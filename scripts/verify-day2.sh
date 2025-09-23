#!/bin/bash

# Day 2 실습 검증 스크립트
# 모든 기능이 정상적으로 작동하는지 확인

set -e

echo "🔍 Day 2 실습 검증을 시작합니다..."

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

# 검증 결과 카운터
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 테스트 함수
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command" &> /dev/null; then
        print_success "$test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        print_error "$test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# 1. Docker 환경 검증
print_step "Docker 환경 검증 중..."

run_test "Docker가 실행 중입니다" "docker ps"
run_test "Docker Compose가 사용 가능합니다" "docker-compose --version"

# 2. 애플리케이션 검증
print_step "애플리케이션 검증 중..."

run_test "애플리케이션이 실행 중입니다" "curl -f http://localhost:3000/health"
run_test "메트릭 엔드포인트가 작동합니다" "curl -f http://localhost:3000/metrics"
run_test "API 엔드포인트가 작동합니다" "curl -f http://localhost:3000/api/users"

# 3. 데이터베이스 검증
print_step "데이터베이스 검증 중..."

run_test "PostgreSQL이 실행 중입니다" "docker-compose ps | grep postgres | grep Up"
run_test "Redis가 실행 중입니다" "docker-compose ps | grep redis | grep Up"

# 4. 모니터링 검증
print_step "모니터링 스택 검증 중..."

run_test "Prometheus가 실행 중입니다" "curl -f http://localhost:9090/-/healthy"
run_test "Grafana가 실행 중입니다" "curl -f http://localhost:3001/api/health"
run_test "Node Exporter가 실행 중입니다" "curl -f http://localhost:9100/metrics"
run_test "cAdvisor가 실행 중입니다" "curl -f http://localhost:8080/metrics"

# 5. Nginx 검증
print_step "Nginx 검증 중..."

run_test "Nginx가 실행 중입니다" "docker-compose ps | grep nginx | grep Up"
run_test "Nginx 헬스체크가 작동합니다" "curl -f http://localhost/nginx-health"

# 6. 메트릭 수집 검증
print_step "메트릭 수집 검증 중..."

# Prometheus 타겟 상태 확인
if curl -s http://localhost:9090/api/v1/targets | grep -q '"health":"up"'; then
    print_success "Prometheus가 모든 타겟을 수집하고 있습니다"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_warning "일부 Prometheus 타겟이 down 상태일 수 있습니다"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 7. 컨테이너 상태 검증
print_step "컨테이너 상태 검증 중..."

# 모든 컨테이너가 실행 중인지 확인
if docker-compose ps | grep -q "Exit"; then
    print_error "일부 컨테이너가 종료되었습니다"
    docker-compose ps | grep "Exit"
    FAILED_TESTS=$((FAILED_TESTS + 1))
else
    print_success "모든 컨테이너가 정상적으로 실행 중입니다"
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 8. 네트워크 연결 검증
print_step "네트워크 연결 검증 중..."

run_test "애플리케이션에서 데이터베이스 연결이 가능합니다" "docker-compose exec app node -e 'const {Pool} = require(\"pg\"); const pool = new Pool({host:\"postgres\",port:5432,database:\"myapp\",user:\"myapp_user\",password:\"password\"}); pool.query(\"SELECT 1\").then(() => process.exit(0)).catch(() => process.exit(1))'"
run_test "애플리케이션에서 Redis 연결이 가능합니다" "docker-compose exec app node -e 'const redis = require(\"redis\"); const client = redis.createClient({socket:{host:\"redis\",port:6379},password:\"password\"}); client.connect().then(() => process.exit(0)).catch(() => process.exit(1))'"

# 9. 성능 검증
print_step "성능 검증 중..."

# 응답 시간 측정
response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3000/health)
if (( $(echo "$response_time < 1.0" | bc -l) )); then
    print_success "애플리케이션 응답 시간이 양호합니다 (${response_time}s)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_warning "애플리케이션 응답 시간이 느립니다 (${response_time}s)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 10. 로그 검증
print_step "로그 검증 중..."

# 애플리케이션 로그에 오류가 없는지 확인
if docker-compose logs app 2>&1 | grep -i error | wc -l | grep -q "^0$"; then
    print_success "애플리케이션 로그에 오류가 없습니다"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_warning "애플리케이션 로그에 오류가 있을 수 있습니다"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 11. 보안 검증
print_step "보안 검증 중..."

# 헬스체크 엔드포인트가 민감한 정보를 노출하지 않는지 확인
if curl -s http://localhost:3000/health | grep -q "password\|secret\|key"; then
    print_warning "헬스체크 엔드포인트에 민감한 정보가 노출될 수 있습니다"
    FAILED_TESTS=$((FAILED_TESTS + 1))
else
    print_success "헬스체크 엔드포인트가 안전합니다"
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 12. 리소스 사용량 검증
print_step "리소스 사용량 검증 중..."

# 메모리 사용량 확인
memory_usage=$(docker stats --no-stream --format "table {{.MemUsage}}" | grep github-actions-demo | head -1 | awk '{print $1}' | sed 's/MiB//')
if [ -n "$memory_usage" ] && [ "$memory_usage" -lt 500 ]; then
    print_success "메모리 사용량이 적절합니다 (${memory_usage}MiB)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_warning "메모리 사용량이 높을 수 있습니다 (${memory_usage}MiB)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 결과 출력
echo ""
echo "=== 📊 검증 결과 ==="
echo "총 테스트: $TOTAL_TESTS"
echo "성공: $PASSED_TESTS"
echo "실패: $FAILED_TESTS"

if [ $FAILED_TESTS -eq 0 ]; then
    print_success "모든 검증이 통과했습니다! 🎉"
    echo ""
    echo "=== 🎯 다음 단계 ==="
    echo "1. Grafana에서 대시보드를 확인하세요: http://localhost:3001"
    echo "2. Prometheus에서 메트릭을 확인하세요: http://localhost:9090"
    echo "3. 실습 가이드를 따라 고급 기능을 학습하세요: docs/DAY2-HANDSON.md"
    echo "4. GitHub Actions에서 CI/CD 파이프라인을 실행해보세요"
    exit 0
else
    print_error "일부 검증이 실패했습니다. 문제를 해결한 후 다시 시도해주세요."
    echo ""
    echo "=== 🔧 문제 해결 ==="
    echo "1. 서비스 상태 확인: docker-compose ps"
    echo "2. 로그 확인: docker-compose logs"
    echo "3. 서비스 재시작: docker-compose restart"
    echo "4. 완전 재시작: docker-compose down && docker-compose up -d"
    exit 1
fi
