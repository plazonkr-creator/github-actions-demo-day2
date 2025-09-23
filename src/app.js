const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const { Pool } = require('pg');
const winston = require('winston');
const client = require('prom-client');

// Prometheus 메트릭 설정
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// 커스텀 메트릭
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);

// Winston 로거 설정
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'github-actions-demo' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL 연결 풀 설정
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'myapp',
  user: process.env.DB_USER || 'myapp_user',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis 클라이언트는 외부에서 주입받음
let redisClient = null;

// Redis 클라이언트 설정 함수
function setRedisClient(client) {
  redisClient = client;
}

// 미들웨어 설정
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 메트릭 수집 미들웨어
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
});

// 연결 상태 추적
let connectionCount = 0;
app.use((req, res, next) => {
  connectionCount++;
  activeConnections.set(connectionCount);
  
  res.on('finish', () => {
    connectionCount--;
    activeConnections.set(connectionCount);
  });
  
  next();
});

// 헬스체크 엔드포인트
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '2.0.0',
    checks: {}
  };

  try {
    // 데이터베이스 연결 확인
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    const dbDuration = Date.now() - dbStart;
    
    healthCheck.checks.database = {
      status: 'connected',
      responseTime: `${dbDuration}ms`
    };
    
    // Redis 연결 확인
    if (redisClient) {
      const redisStart = Date.now();
      await redisClient.ping();
      const redisDuration = Date.now() - redisStart;
      
      healthCheck.checks.redis = {
        status: 'connected',
        responseTime: `${redisDuration}ms`
      };
    } else {
      healthCheck.checks.redis = {
        status: 'not_configured',
        responseTime: '0ms'
      };
    }
    
    // 메모리 사용량
    const memUsage = process.memoryUsage();
    healthCheck.checks.memory = {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
    };
    
    logger.info('Health check passed', healthCheck);
    res.json(healthCheck);
    
  } catch (error) {
    logger.error('Health check failed:', error);
    
    healthCheck.status = 'unhealthy';
    healthCheck.checks.database = { status: 'error', error: error.message };
    healthCheck.checks.redis = { status: 'error', error: error.message };
    
    res.status(503).json(healthCheck);
  }
});

// 메트릭 엔드포인트
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error('Metrics endpoint error:', error);
    res.status(500).end();
  }
});

// 사용자 관리 API
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC LIMIT 100');
    
    // Redis 캐시에 저장 (5분)
    if (redisClient) {
      await redisClient.setEx('users:list', 300, JSON.stringify(result.rows));
    }
    
    logger.info(`Retrieved ${result.rows.length} users`);
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      cached: false
    });
    
  } catch (error) {
    logger.error('Error retrieving users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users',
      message: error.message
    });
  }
});

// 캐시된 사용자 목록 조회
app.get('/api/users/cached', async (req, res) => {
  try {
    if (!redisClient) {
      return res.redirect('/api/users');
    }
    
    const cached = await redisClient.get('users:list');
    
    if (cached) {
      logger.info('Retrieved users from cache');
      res.json({
        success: true,
        data: JSON.parse(cached),
        cached: true
      });
    } else {
      // 캐시가 없으면 DB에서 조회
      const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC LIMIT 100');
      await redisClient.setEx('users:list', 300, JSON.stringify(result.rows));
      
      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length,
        cached: false
      });
    }
    
  } catch (error) {
    logger.error('Error retrieving cached users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cached users',
      message: error.message
    });
  }
});

// 새 사용자 생성
app.post('/api/users', async (req, res) => {
  const { username, email } = req.body;
  
  if (!username || !email) {
    return res.status(400).json({
      success: false,
      error: 'Username and email are required'
    });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *',
      [username, email]
    );
    
    // 캐시 무효화
    if (redisClient) {
      await redisClient.del('users:list');
    }
    
    logger.info(`Created new user: ${username}`);
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    logger.error('Error creating user:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({
        success: false,
        error: 'User already exists',
        message: 'Username or email already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create user',
        message: error.message
      });
    }
  }
});

// 로그 조회 API
app.get('/api/logs', async (req, res) => {
  try {
    const { level, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM app_logs';
    let params = [];
    
    if (level) {
      query += ' WHERE level = $1';
      params.push(level);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT $' + (params.length + 1);
    params.push(parseInt(limit));
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      filters: { level, limit }
    });
    
  } catch (error) {
    logger.error('Error retrieving logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve logs',
      message: error.message
    });
  }
});

// 로그 생성 API
app.post('/api/logs', async (req, res) => {
  const { level, message } = req.body;
  
  if (!level || !message) {
    return res.status(400).json({
      success: false,
      error: 'Level and message are required'
    });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO app_logs (level, message) VALUES ($1, $2) RETURNING *',
      [level, message]
    );
    
    logger.info(`Created log entry: ${level} - ${message}`);
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    logger.error('Error creating log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create log',
      message: error.message
    });
  }
});

// Redis 상태 확인
app.get('/api/redis/status', async (req, res) => {
  try {
    if (!redisClient) {
      return res.json({
        success: false,
        status: 'not_configured',
        error: 'Redis client not configured'
      });
    }
    
    const info = await redisClient.info();
    const ping = await redisClient.ping();
    
    res.json({
      success: true,
      status: 'connected',
      ping: ping,
      info: info.split('\r\n').slice(0, 10) // 첫 10줄만 반환
    });
    
  } catch (error) {
    logger.error('Redis status check failed:', error);
    res.status(500).json({
      success: false,
      status: 'disconnected',
      error: error.message
    });
  }
});

// 데이터베이스 상태 확인
app.get('/api/db/status', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version,
        (SELECT count(*) FROM users) as user_count,
        (SELECT count(*) FROM app_logs) as log_count
    `);
    
    res.json({
      success: true,
      status: 'connected',
      data: result.rows[0]
    });
    
  } catch (error) {
    logger.error('Database status check failed:', error);
    res.status(500).json({
      success: false,
      status: 'disconnected',
      error: error.message
    });
  }
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// 에러 핸들러
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 서버 시작 로직은 server.js로 이동됨

module.exports = { app, setRedisClient };
