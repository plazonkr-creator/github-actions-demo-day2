#!/usr/bin/env node

/**
 * Day2 실습용 데이터베이스 마이그레이션 스크립트
 * 데이터베이스 스키마를 초기화하고 업데이트합니다.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🗄️  데이터베이스 마이그레이션을 시작합니다...\n');

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

// SQL 파일 실행 함수
async function executeSqlFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`📄 ${path.basename(filePath)} 실행 중...`);
    
    await pool.query(sql);
    console.log(`✅ ${path.basename(filePath)} 실행 완료`);
    
  } catch (error) {
    console.error(`❌ ${path.basename(filePath)} 실행 실패:`, error.message);
    throw error;
  }
}

// 데이터베이스 연결 테스트
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ 데이터베이스 연결 성공:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    return false;
  }
}

// 테이블 존재 확인
async function checkTableExists(tableName) {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    
    return result.rows[0].exists;
  } catch (error) {
    console.error(`❌ 테이블 존재 확인 실패 (${tableName}):`, error.message);
    return false;
  }
}

// 마이그레이션 실행
async function runMigration() {
  try {
    // 1. 데이터베이스 연결 테스트
    const connected = await testConnection();
    if (!connected) {
      throw new Error('데이터베이스 연결에 실패했습니다.');
    }
    
    // 2. 초기화 스크립트 실행
    const initSqlPath = path.join(__dirname, '..', 'database', 'init.sql');
    
    if (fs.existsSync(initSqlPath)) {
      await executeSqlFile(initSqlPath);
    } else {
      console.log('⚠️  init.sql 파일을 찾을 수 없습니다.');
    }
    
    // 3. 테이블 존재 확인
    console.log('\n📋 테이블 존재 확인:');
    const tables = ['users', 'app_logs', 'system_metrics'];
    
    for (const table of tables) {
      const exists = await checkTableExists(table);
      console.log(`${exists ? '✅' : '❌'} ${table} 테이블`);
    }
    
    // 4. 초기 데이터 확인
    console.log('\n📊 초기 데이터 확인:');
    
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`👥 사용자 수: ${userCount.rows[0].count}`);
    
    const logCount = await pool.query('SELECT COUNT(*) FROM app_logs');
    console.log(`📝 로그 수: ${logCount.rows[0].count}`);
    
    console.log('\n🎉 데이터베이스 마이그레이션이 완료되었습니다!');
    
  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 롤백 함수 (필요시)
async function rollback() {
  try {
    console.log('🔄 데이터베이스 롤백을 시작합니다...');
    
    const tables = ['system_metrics', 'app_logs', 'users'];
    
    for (const table of tables) {
      const exists = await checkTableExists(table);
      if (exists) {
        await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`🗑️  ${table} 테이블 삭제 완료`);
      }
    }
    
    console.log('✅ 롤백이 완료되었습니다.');
    
  } catch (error) {
    console.error('❌ 롤백 실패:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 메인 실행 함수
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'rollback':
      await rollback();
      break;
    case 'migrate':
    default:
      await runMigration();
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
  runMigration,
  rollback,
  testConnection,
  checkTableExists
};
