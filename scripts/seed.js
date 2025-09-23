#!/usr/bin/env node

/**
 * Day2 실습용 데이터베이스 시드 스크립트
 * 테스트용 초기 데이터를 생성합니다.
 */

const { Pool } = require('pg');
require('dotenv').config();

console.log('🌱 데이터베이스 시드 데이터 생성을 시작합니다...\n');

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

// 샘플 사용자 데이터
const sampleUsers = [
  { username: 'alice', email: 'alice@example.com' },
  { username: 'bob', email: 'bob@example.com' },
  { username: 'charlie', email: 'charlie@example.com' },
  { username: 'diana', email: 'diana@example.com' },
  { username: 'eve', email: 'eve@example.com' }
];

// 샘플 로그 데이터
const sampleLogs = [
  { level: 'info', message: 'Application started successfully' },
  { level: 'info', message: 'Database connection established' },
  { level: 'info', message: 'Redis connection established' },
  { level: 'warn', message: 'High memory usage detected' },
  { level: 'error', message: 'Failed to connect to external API' },
  { level: 'debug', message: 'User authentication successful' },
  { level: 'info', message: 'New user registered' },
  { level: 'warn', message: 'Rate limit exceeded for user' },
  { level: 'error', message: 'Database query timeout' },
  { level: 'info', message: 'Cache miss for key: user:123' }
];

// 샘플 메트릭 데이터
const sampleMetrics = [
  { metric_name: 'cpu_usage', metric_value: 45.5, metric_unit: 'percent' },
  { metric_name: 'memory_usage', metric_value: 67.2, metric_unit: 'percent' },
  { metric_name: 'disk_usage', metric_value: 23.8, metric_unit: 'percent' },
  { metric_name: 'response_time', metric_value: 125.5, metric_unit: 'ms' },
  { metric_name: 'request_count', metric_value: 1500, metric_unit: 'count' }
];

// 사용자 데이터 삽입
async function seedUsers() {
  console.log('👥 사용자 데이터 생성 중...');
  
  try {
    for (const user of sampleUsers) {
      await pool.query(
        'INSERT INTO users (username, email) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING',
        [user.username, user.email]
      );
    }
    
    const result = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`✅ 사용자 데이터 생성 완료: ${result.rows[0].count}명`);
    
  } catch (error) {
    console.error('❌ 사용자 데이터 생성 실패:', error.message);
    throw error;
  }
}

// 로그 데이터 삽입
async function seedLogs() {
  console.log('📝 로그 데이터 생성 중...');
  
  try {
    for (const log of sampleLogs) {
      await pool.query(
        'INSERT INTO app_logs (level, message) VALUES ($1, $2)',
        [log.level, log.message]
      );
    }
    
    const result = await pool.query('SELECT COUNT(*) FROM app_logs');
    console.log(`✅ 로그 데이터 생성 완료: ${result.rows[0].count}개`);
    
  } catch (error) {
    console.error('❌ 로그 데이터 생성 실패:', error.message);
    throw error;
  }
}

// 메트릭 데이터 삽입
async function seedMetrics() {
  console.log('📊 메트릭 데이터 생성 중...');
  
  try {
    for (const metric of sampleMetrics) {
      await pool.query(
        'INSERT INTO system_metrics (metric_name, metric_value, metric_unit) VALUES ($1, $2, $3)',
        [metric.metric_name, metric.metric_value, metric.metric_unit]
      );
    }
    
    const result = await pool.query('SELECT COUNT(*) FROM system_metrics');
    console.log(`✅ 메트릭 데이터 생성 완료: ${result.rows[0].count}개`);
    
  } catch (error) {
    console.error('❌ 메트릭 데이터 생성 실패:', error.message);
    throw error;
  }
}

// 데이터 정리
async function clearData() {
  console.log('🗑️  기존 데이터 정리 중...');
  
  try {
    await pool.query('DELETE FROM system_metrics');
    await pool.query('DELETE FROM app_logs');
    await pool.query('DELETE FROM users WHERE username NOT IN ($1, $2, $3)', ['admin', 'testuser', 'demo']);
    
    console.log('✅ 데이터 정리 완료');
    
  } catch (error) {
    console.error('❌ 데이터 정리 실패:', error.message);
    throw error;
  }
}

// 데이터 통계 출력
async function showDataStats() {
  console.log('\n📊 데이터베이스 통계:');
  
  try {
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const logCount = await pool.query('SELECT COUNT(*) FROM app_logs');
    const metricCount = await pool.query('SELECT COUNT(*) FROM system_metrics');
    
    console.log(`👥 사용자: ${userCount.rows[0].count}명`);
    console.log(`📝 로그: ${logCount.rows[0].count}개`);
    console.log(`📊 메트릭: ${metricCount.rows[0].count}개`);
    
    // 레벨별 로그 통계
    const logStats = await pool.query(`
      SELECT level, COUNT(*) as count 
      FROM app_logs 
      GROUP BY level 
      ORDER BY count DESC
    `);
    
    console.log('\n📝 로그 레벨별 통계:');
    logStats.rows.forEach(stat => {
      console.log(`   ${stat.level}: ${stat.count}개`);
    });
    
  } catch (error) {
    console.error('❌ 통계 조회 실패:', error.message);
  }
}

// 메인 시드 함수
async function runSeed() {
  try {
    // 데이터베이스 연결 테스트
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ 데이터베이스 연결 성공\n');
    
    // 기존 데이터 정리 (선택사항)
    const clearExisting = process.argv.includes('--clear');
    if (clearExisting) {
      await clearData();
    }
    
    // 시드 데이터 생성
    await seedUsers();
    await seedLogs();
    await seedMetrics();
    
    // 통계 출력
    await showDataStats();
    
    console.log('\n🎉 시드 데이터 생성이 완료되었습니다!');
    
  } catch (error) {
    console.error('\n❌ 시드 데이터 생성 실패:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 메인 실행 함수
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'clear':
      await clearData();
      break;
    case 'stats':
      await showDataStats();
      break;
    case 'seed':
    default:
      await runSeed();
      break;
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 스크립트 실행 실패:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runSeed,
  clearData,
  showDataStats,
  seedUsers,
  seedLogs,
  seedMetrics
};
