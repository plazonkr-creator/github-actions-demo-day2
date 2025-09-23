#!/bin/bash

# Day 2 실습 환경 설정 스크립트
# GitHub Actions CI/CD 실습 프로젝트

set -e

echo "🚀 Day 2 실습 환경 설정을 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. 필수 도구 확인
print_step "필수 도구 확인 중..."

# Docker 확인
if command -v docker &> /dev/null; then
    print_success "Docker가 설치되어 있습니다: $(docker --version)"
else
    print_error "Docker가 설치되지 않았습니다. https://docs.docker.com/get-docker/ 에서 설치하세요."
    exit 1
fi

# Docker Compose 확인
if command -v docker-compose &> /dev/null; then
    print_success "Docker Compose가 설치되어 있습니다: $(docker-compose --version)"
else
    print_error "Docker Compose가 설치되지 않았습니다."
    exit 1
fi

# Node.js 확인
if command -v node &> /dev/null; then
    print_success "Node.js가 설치되어 있습니다: $(node --version)"
else
    print_warning "Node.js가 설치되지 않았습니다. 로컬 개발을 위해 설치를 권장합니다."
fi

# Git 확인
if command -v git &> /dev/null; then
    print_success "Git이 설치되어 있습니다: $(git --version)"
else
    print_error "Git이 설치되지 않았습니다."
    exit 1
fi

# 2. 프로젝트 의존성 설치
print_step "프로젝트 의존성 설치 중..."

if [ -f "package.json" ]; then
    if command -v npm &> /dev/null; then
        npm install
        print_success "Node.js 의존성이 설치되었습니다."
    else
        print_warning "npm이 설치되지 않았습니다. Docker 환경에서만 실행됩니다."
    fi
else
    print_warning "package.json을 찾을 수 없습니다."
fi

# 3. Docker 이미지 빌드
print_step "Docker 이미지 빌드 중..."

if docker build -t github-actions-demo:latest .; then
    print_success "Docker 이미지가 성공적으로 빌드되었습니다."
else
    print_error "Docker 이미지 빌드에 실패했습니다."
    exit 1
fi

# 4. 개발 환경 시작
print_step "개발 환경 시작 중..."

if docker-compose up -d; then
    print_success "개발 환경이 시작되었습니다."
else
    print_error "개발 환경 시작에 실패했습니다."
    exit 1
fi

# 5. 서비스 상태 확인
print_step "서비스 상태 확인 중..."

sleep 10

echo "=== 서비스 상태 ==="
docker-compose ps

# 6. 헬스체크
print_step "헬스체크 실행 중..."

# 애플리케이션 헬스체크
if curl -f http://localhost:3000/health &> /dev/null; then
    print_success "애플리케이션이 정상적으로 실행 중입니다."
else
    print_warning "애플리케이션 헬스체크에 실패했습니다. 잠시 후 다시 시도해주세요."
fi

# Prometheus 헬스체크
if curl -f http://localhost:9090/-/healthy &> /dev/null; then
    print_success "Prometheus가 정상적으로 실행 중입니다."
else
    print_warning "Prometheus 헬스체크에 실패했습니다."
fi

# Grafana 헬스체크
if curl -f http://localhost:3001/api/health &> /dev/null; then
    print_success "Grafana가 정상적으로 실행 중입니다."
else
    print_warning "Grafana 헬스체크에 실패했습니다."
fi

# 7. 접속 정보 출력
print_step "접속 정보"

echo "=== 🌐 접속 URL ==="
echo "애플리케이션:     http://localhost:3000"
echo "헬스체크:        http://localhost:3000/health"
echo "메트릭:          http://localhost:3000/metrics"
echo "Grafana:        http://localhost:3001 (admin/admin123)"
echo "Prometheus:     http://localhost:9090"
echo "cAdvisor:       http://localhost:8080"
echo "Node Exporter:  http://localhost:9100"

echo ""
echo "=== 📊 모니터링 확인 ==="
echo "1. Grafana 접속: http://localhost:3001"
echo "2. 사용자명: admin, 비밀번호: admin123"
echo "3. Prometheus 데이터소스가 자동으로 연결되어 있습니다."
echo "4. 대시보드를 생성하여 메트릭을 시각화하세요."

echo ""
echo "=== 🛠️ 유용한 명령어 ==="
echo "서비스 상태 확인:    docker-compose ps"
echo "로그 확인:          docker-compose logs -f"
echo "서비스 재시작:      docker-compose restart"
echo "서비스 중지:        docker-compose down"
echo "프로덕션 환경:      docker-compose -f docker-compose.prod.yml up -d"

echo ""
echo "=== 📚 학습 자료 ==="
echo "강의안:            docs/DAY2-LECTURE.md"
echo "실습 가이드:        docs/DAY2-HANDSON.md"
echo "모니터링 가이드:    MONITORING.md"

print_success "Day 2 실습 환경 설정이 완료되었습니다! 🎉"

echo ""
echo "다음 단계:"
echo "1. Grafana에 접속하여 대시보드를 확인하세요."
echo "2. 실습 가이드를 따라 단계별로 학습하세요."
echo "3. GitHub Actions에서 CI/CD 파이프라인을 실행해보세요."
