#!/usr/bin/env node

/**
 * Day2 실습용 환경 설정 스크립트
 * 환경 변수 및 초기 설정을 자동화합니다.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Day2 실습 환경 설정을 시작합니다...\n');

// 환경 변수 템플릿
const envTemplate = `# Day2 실습용 환경 변수
NODE_ENV=development
PORT=3000

# 데이터베이스 설정
DB_HOST=postgres
DB_PORT=5432
DB_NAME=myapp
DB_USER=myapp_user
DB_PASSWORD=password

# Redis 설정
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=password

# 로깅 설정
LOG_LEVEL=debug

# 애플리케이션 설정
APP_NAME=GitHub Actions Demo Day2
APP_VERSION=2.0.0
`;

// 프로덕션 환경 변수 템플릿
const envProdTemplate = `# Day2 실습용 프로덕션 환경 변수
NODE_ENV=production
PORT=3000

# 데이터베이스 설정 (실제 값으로 변경 필요)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=myapp
DB_USER=myapp_user
DB_PASSWORD=your_secure_db_password_here

# Redis 설정 (실제 값으로 변경 필요)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password_here

# 로깅 설정
LOG_LEVEL=info

# 애플리케이션 설정
APP_NAME=GitHub Actions Demo Day2
APP_VERSION=2.0.0
`;

// .env 파일 생성
function createEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  const envProdPath = path.join(__dirname, '..', '.env.prod');
  
  try {
    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, envTemplate);
      console.log('✅ .env 파일이 생성되었습니다.');
    } else {
      console.log('ℹ️  .env 파일이 이미 존재합니다.');
    }
    
    if (!fs.existsSync(envProdPath)) {
      fs.writeFileSync(envProdPath, envProdTemplate);
      console.log('✅ .env.prod 파일이 생성되었습니다.');
    } else {
      console.log('ℹ️  .env.prod 파일이 이미 존재합니다.');
    }
  } catch (error) {
    console.error('❌ 환경 변수 파일 생성 중 오류:', error.message);
    process.exit(1);
  }
}

// 로그 디렉토리 생성
function createLogDirectories() {
  const logsDir = path.join(__dirname, '..', 'logs');
  
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      console.log('✅ logs 디렉토리가 생성되었습니다.');
    } else {
      console.log('ℹ️  logs 디렉토리가 이미 존재합니다.');
    }
  } catch (error) {
    console.error('❌ 로그 디렉토리 생성 중 오류:', error.message);
    process.exit(1);
  }
}

// Docker Compose 파일 검증
function validateDockerCompose() {
  const composeFiles = [
    'docker-compose.yml',
    'docker-compose.prod.yml'
  ];
  
  console.log('\n📋 Docker Compose 파일 검증:');
  
  composeFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} - 존재함`);
    } else {
      console.log(`❌ ${file} - 누락됨`);
    }
  });
}

// Nginx 설정 파일 검증
function validateNginxConfig() {
  const nginxFiles = [
    'nginx/nginx.dev.conf',
    'nginx/nginx.prod.conf'
  ];
  
  console.log('\n📋 Nginx 설정 파일 검증:');
  
  nginxFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} - 존재함`);
    } else {
      console.log(`❌ ${file} - 누락됨`);
    }
  });
}

// GitHub Actions 워크플로우 검증
function validateGitHubActions() {
  const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'advanced-cicd.yml');
  
  console.log('\n📋 GitHub Actions 워크플로우 검증:');
  
  if (fs.existsSync(workflowPath)) {
    console.log('✅ advanced-cicd.yml - 존재함');
  } else {
    console.log('❌ advanced-cicd.yml - 누락됨');
  }
}

// 데이터베이스 초기화 스크립트 검증
function validateDatabaseScripts() {
  const dbScripts = [
    'database/init.sql'
  ];
  
  console.log('\n📋 데이터베이스 스크립트 검증:');
  
  dbScripts.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} - 존재함`);
    } else {
      console.log(`❌ ${file} - 누락됨`);
    }
  });
}

// 테스트 파일 검증
function validateTestFiles() {
  const testFiles = [
    'tests/unit/app.test.js',
    'tests/integration/database.test.js'
  ];
  
  console.log('\n📋 테스트 파일 검증:');
  
  testFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} - 존재함`);
    } else {
      console.log(`❌ ${file} - 누락됨`);
    }
  });
}

// 사용법 안내
function showUsageInstructions() {
  console.log('\n🎯 다음 단계:');
  console.log('1. 환경 변수 파일을 확인하고 필요시 수정하세요:');
  console.log('   - .env (개발 환경)');
  console.log('   - .env.prod (프로덕션 환경)');
  console.log('');
  console.log('2. Docker Compose로 개발 환경을 시작하세요:');
  console.log('   docker-compose up -d');
  console.log('');
  console.log('3. 애플리케이션이 정상 작동하는지 확인하세요:');
  console.log('   curl http://localhost/health');
  console.log('');
  console.log('4. 테스트를 실행하세요:');
  console.log('   npm test');
  console.log('');
  console.log('5. GitHub Actions 워크플로우를 설정하세요:');
  console.log('   - Repository Secrets 설정');
  console.log('   - 워크플로우 파일 커밋 및 푸시');
  console.log('');
  console.log('📚 자세한 내용은 exec.md 파일을 참조하세요.');
}

// 메인 실행 함수
function main() {
  try {
    createEnvFile();
    createLogDirectories();
    validateDockerCompose();
    validateNginxConfig();
    validateGitHubActions();
    validateDatabaseScripts();
    validateTestFiles();
    showUsageInstructions();
    
    console.log('\n🎉 환경 설정이 완료되었습니다!');
    
  } catch (error) {
    console.error('\n❌ 환경 설정 중 오류가 발생했습니다:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = {
  createEnvFile,
  createLogDirectories,
  validateDockerCompose,
  validateNginxConfig,
  validateGitHubActions,
  validateDatabaseScripts,
  validateTestFiles
};
