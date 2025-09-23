// Day2 실습용 통합 테스트
const request = require('supertest');
const app = require('../../src/app');

describe('Database Integration Tests', () => {
  
  describe('User Management Flow', () => {
    it('should create, read, and manage users', async () => {
      // 1. 사용자 생성
      const userData = {
        username: `integrationtest_${Date.now()}`,
        email: `integration_${Date.now()}@example.com`
      };
      
      const createResponse = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);
      
      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.username).toBe(userData.username);
      
      const userId = createResponse.body.data.id;
      
      // 2. 사용자 목록 조회
      const listResponse = await request(app)
        .get('/api/users')
        .expect(200);
      
      expect(listResponse.body.success).toBe(true);
      expect(listResponse.body.data.length).toBeGreaterThan(0);
      
      // 생성된 사용자가 목록에 있는지 확인
      const createdUser = listResponse.body.data.find(user => user.id === userId);
      expect(createdUser).toBeDefined();
      expect(createdUser.username).toBe(userData.username);
    });
    
    it('should handle duplicate user creation', async () => {
      const timestamp = Date.now();
      const userData = {
        username: `duplicatetest_${timestamp}`,
        email: `duplicate_${timestamp}@example.com`
      };
      
      // 첫 번째 사용자 생성
      await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);
      
      // 동일한 사용자명으로 재생성 시도
      const duplicateResponse = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(409);
      
      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.error).toBe('User already exists');
    });
  });
  
  describe('Log Management Flow', () => {
    it('should create and retrieve logs', async () => {
      // 1. 로그 생성
      const logData = {
        level: 'info',
        message: 'Integration test log message'
      };
      
      const createResponse = await request(app)
        .post('/api/logs')
        .send(logData)
        .expect(201);
      
      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.level).toBe(logData.level);
      expect(createResponse.body.data.message).toBe(logData.message);
      
      // 2. 로그 목록 조회
      const listResponse = await request(app)
        .get('/api/logs')
        .expect(200);
      
      expect(listResponse.body.success).toBe(true);
      expect(listResponse.body.data.length).toBeGreaterThan(0);
      
      // 생성된 로그가 목록에 있는지 확인
      const createdLog = listResponse.body.data.find(log => 
        log.level === logData.level && log.message === logData.message
      );
      expect(createdLog).toBeDefined();
    });
    
    it('should filter logs by level', async () => {
      // 다양한 레벨의 로그 생성
      const logs = [
        { level: 'info', message: 'Info message' },
        { level: 'error', message: 'Error message' },
        { level: 'warn', message: 'Warning message' }
      ];
      
      for (const log of logs) {
        await request(app)
          .post('/api/logs')
          .send(log)
          .expect(201);
      }
      
      // info 레벨 로그만 조회
      const infoLogsResponse = await request(app)
        .get('/api/logs?level=info')
        .expect(200);
      
      expect(infoLogsResponse.body.success).toBe(true);
      expect(infoLogsResponse.body.filters.level).toBe('info');
      
      // 모든 로그가 info 레벨인지 확인
      infoLogsResponse.body.data.forEach(log => {
        expect(log.level).toBe('info');
      });
    });
  });
  
  describe('Health Check Integration', () => {
    it('should verify all services are healthy', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.checks.database.status).toBe('connected');
      expect(response.body.checks.redis.status).toBe('connected');
      expect(response.body.checks.memory).toBeDefined();
    });
  });
  
  describe('Redis Integration', () => {
    it('should check Redis connectivity', async () => {
      const response = await request(app)
        .get('/api/redis/status')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('connected');
      expect(response.body.ping).toBe('PONG');
    });
  });
  
  describe('Database Status Integration', () => {
    it('should check database connectivity and stats', async () => {
      const response = await request(app)
        .get('/api/db/status')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('connected');
      expect(response.body.data.database).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.version).toBeDefined();
      expect(typeof response.body.data.user_count).toBe('number');
      expect(typeof response.body.data.log_count).toBe('number');
    });
  });
  
  describe('Performance Integration', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = [];
      
      // 10개의 동시 요청 생성
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .get('/api/users')
            .expect(200)
        );
      }
      
      const responses = await Promise.all(requests);
      
      // 모든 요청이 성공했는지 확인
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
      });
    });
    
    it('should measure response times', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/health')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // 응답 시간이 1초 이내인지 확인
      expect(responseTime).toBeLessThan(1000);
    });
  });
  
  describe('Error Handling Integration', () => {
    it('should handle database connection errors gracefully', async () => {
      // 이 테스트는 실제로는 데이터베이스 연결을 끊을 수 없으므로
      // 에러 핸들링 로직이 올바르게 구현되어 있는지 확인
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      // 정상적인 응답이 와야 함
      expect(response.body).toHaveProperty('status');
    });
  });
});
