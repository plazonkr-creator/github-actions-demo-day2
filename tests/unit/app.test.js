// Day2 실습용 단위 테스트
const request = require('supertest');
const app = require('../../src/app');

describe('Application Unit Tests', () => {
  
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('checks');
    });
    
    it('should include database check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks.database).toHaveProperty('status');
    });
    
    it('should include redis check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.checks).toHaveProperty('redis');
      expect(response.body.checks.redis).toHaveProperty('status');
    });
    
    it('should include memory usage', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.checks).toHaveProperty('memory');
      expect(response.body.checks.memory).toHaveProperty('rss');
      expect(response.body.checks.memory).toHaveProperty('heapTotal');
      expect(response.body.checks.memory).toHaveProperty('heapUsed');
    });
  });
  
  describe('GET /metrics', () => {
    it('should return Prometheus metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);
      
      expect(response.text).toContain('# HELP');
      expect(response.text).toContain('# TYPE');
      expect(response.text).toContain('http_requests_total');
    });
  });
  
  describe('GET /api/users', () => {
    it('should return users list', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('cached', false);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
  
  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('username', userData.username);
      expect(response.body.data).toHaveProperty('email', userData.email);
    });
    
    it('should return 400 for missing username', async () => {
      const userData = {
        email: 'test@example.com'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
    
    it('should return 400 for missing email', async () => {
      const userData = {
        username: `testuser_${Date.now()}`
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('GET /api/logs', () => {
    it('should return logs list', async () => {
      const response = await request(app)
        .get('/api/logs')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('filters');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    it('should filter logs by level', async () => {
      const response = await request(app)
        .get('/api/logs?level=info')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.filters).toHaveProperty('level', 'info');
    });
    
    it('should limit logs count', async () => {
      const response = await request(app)
        .get('/api/logs?limit=10')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.filters).toHaveProperty('limit', '10');
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });
  });
  
  describe('POST /api/logs', () => {
    it('should create a new log entry', async () => {
      const logData = {
        level: 'info',
        message: 'Test log message'
      };
      
      const response = await request(app)
        .post('/api/logs')
        .send(logData)
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('level', logData.level);
      expect(response.body.data).toHaveProperty('message', logData.message);
    });
    
    it('should return 400 for missing level', async () => {
      const logData = {
        message: 'Test log message'
      };
      
      const response = await request(app)
        .post('/api/logs')
        .send(logData)
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
    
    it('should return 400 for missing message', async () => {
      const logData = {
        level: 'info'
      };
      
      const response = await request(app)
        .post('/api/logs')
        .send(logData)
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('GET /api/redis/status', () => {
    it('should return Redis status', async () => {
      const response = await request(app)
        .get('/api/redis/status')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('ping');
    });
  });
  
  describe('GET /api/db/status', () => {
    it('should return database status', async () => {
      const response = await request(app)
        .get('/api/db/status')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('database');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('version');
    });
  });
  
  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Not Found');
    });
  });
});
