#!/usr/bin/env node

/**
 * Day2 실습용 서버 시작 파일
 * 프로덕션 환경에서만 실행됩니다.
 */

const app = require('./app');
const setRedisClient = app.setRedisClient;
const { Pool } = require('pg');
const redis = require('redis');
const winston = require('winston');
require('dotenv').config();

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
      format: winston.format.simple()
    })
  ]
});

// 데이터베이스 연결 설정
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'myapp',
  user: process.env.DB_USER || 'myapp_user',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis 클라이언트 설정
const redisConfig = {
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
  },
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      logger.error('Redis server connection refused');
      return new Error('Redis server connection refused');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      logger.error('Redis retry time exhausted');
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      logger.error('Redis max retry attempts reached');
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
};

// 비밀번호가 설정된 경우에만 추가
if (process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.trim() !== '') {
  redisConfig.password = process.env.REDIS_PASSWORD;
}

const redisClient = redis.createClient(redisConfig);

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
});

// 서버 시작
async function startServer() {
  try {
    // Redis 연결
    await redisClient.connect();
    logger.info('Redis connected successfully');
    
    // app.js에 Redis 클라이언트 설정
    setRedisClient(redisClient);
    
    // 데이터베이스 연결 테스트
    await pool.query('SELECT 1');
    logger.info('Database connected successfully');
    
    // 서버 시작
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}`);
      logger.info(`📊 Metrics available at http://localhost:${port}/metrics`);
      logger.info(`🏥 Health check available at http://localhost:${port}/health`);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  try {
    await redisClient.quit();
    await pool.end();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  try {
    await redisClient.quit();
    await pool.end();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// 서버 시작
startServer();
