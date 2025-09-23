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
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

// 각 테스트 전에 데이터 정리
beforeEach(async () => {
  try {
    await pool.query(`
      DELETE FROM users 
      WHERE username LIKE '%test%' 
      AND username NOT IN ('admin', 'testuser', 'demo')
    `);
  } catch (error) {
    // 조용히 무시
  }
});

// 모든 테스트 후 정리
afterAll(async () => {
  try {
    await pool.end();
  } catch (error) {
    // 조용히 무시
  }
  
  // 강제 종료
  setTimeout(() => process.exit(0), 100);
});

// 전역 테스트 타임아웃 설정
jest.setTimeout(5000);
