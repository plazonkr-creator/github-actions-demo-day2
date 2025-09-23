// Jest 테스트 설정 파일
const { Pool } = require('pg');
require('dotenv').config();

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

// 각 테스트 전에 데이터 정리
beforeEach(async () => {
  try {
    // 테스트용 데이터만 정리 (시드 데이터는 유지)
    await pool.query(`
      DELETE FROM system_metrics 
      WHERE metric_name LIKE 'test_%' OR metric_name LIKE '%test%'
    `);
    
    await pool.query(`
      DELETE FROM app_logs 
      WHERE message LIKE '%test%' OR message LIKE '%Test%'
    `);
    
    await pool.query(`
      DELETE FROM users 
      WHERE username LIKE '%test%' 
      AND username NOT IN ('admin', 'testuser', 'demo')
    `);
  } catch (error) {
    console.warn('테스트 데이터 정리 중 오류 발생:', error.message);
  }
});

// 모든 테스트 후 정리
afterAll(async () => {
  try {
    await pool.end();
  } catch (error) {
    console.warn('데이터베이스 연결 종료 중 오류 발생:', error.message);
  }
});

// 전역 테스트 타임아웃 설정
jest.setTimeout(30000);
