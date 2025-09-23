# 🛠️ Day 2 실습 가이드: 고급 CI/CD와 모니터링

## 🎯 실습 목표

이 실습을 통해 다음을 학습합니다:
- 멀티스테이지 Dockerfile을 사용한 이미지 최적화
- Docker Compose로 마이크로서비스 아키텍처 구축
- Prometheus + Grafana 모니터링 스택 구축
- GitHub Actions 고급 CI/CD 파이프라인 구현
- 멀티 환경 배포 (AWS/GCP)

## 📋 사전 준비사항

### **필수 도구**
- [ ] Docker Desktop 설치
- [ ] Git 설치 및 GitHub 계정
- [ ] VS Code 또는 선호하는 에디터
- [ ] 터미널/명령 프롬프트

### **선택사항**
- [ ] AWS 계정 (EC2 VM)
- [ ] GCP 계정 (Compute Engine VM)
- [ ] GitHub Actions Secrets 설정

## 🚀 실습 1: 프로젝트 설정

### **1.1 프로젝트 클론**
```bash
# GitHub에서 프로젝트 클론
git clone https://github.com/jungfrau70/github-actions-demo-day2.git
cd github-actions-demo-day2

# 브랜치 확인
git branch -a
git checkout day2-advanced
```

### **1.2 프로젝트 구조 확인**
```bash
# 프로젝트 구조 살펴보기
tree -I 'node_modules|.git' -L 3

# 주요 파일들 확인
ls -la
ls -la .github/workflows/
ls -la monitoring/
```

## 🐳 실습 2: Docker 환경 구축

### **2.1 멀티스테이지 Dockerfile 이해**
```bash
# Dockerfile 내용 확인
cat Dockerfile

# 각 스테이지별 설명
echo "=== 1단계: 빌드 환경 ==="
echo "FROM node:18-alpine AS builder"
echo "WORKDIR /app"
echo "COPY package*.json ./"
echo "RUN npm ci --only=production"

echo "=== 2단계: 실행 환경 ==="
echo "FROM node:18-alpine AS runtime"
echo "WORKDIR /app"
echo "COPY --from=builder /app/node_modules ./node_modules"
echo "COPY src/ ./src/"
echo "CMD [\"node\", \"src/server.js\"]"
```

### **2.2 Docker 이미지 빌드**
```bash
# 이미지 빌드
docker build -t github-actions-demo:latest .

# 이미지 크기 확인
docker images | grep github-actions-demo

# 이미지 상세 정보 확인
docker inspect github-actions-demo:latest
```

### **2.3 Docker Compose 개발 환경 실행**
```bash
# 개발 환경 시작
docker-compose up -d

# 서비스 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f app
```

## 📊 실습 3: 모니터링 스택 구축

### **3.1 Prometheus 설정 확인**
```bash
# Prometheus 설정 파일 확인
cat monitoring/prometheus/prometheus.yml

# Prometheus 컨테이너 상태 확인
docker-compose ps | grep prometheus

# Prometheus 웹 UI 접속
echo "Prometheus 접속: http://localhost:9090"
```

### **3.2 Grafana 설정 확인**
```bash
# Grafana 설정 파일 확인
ls -la monitoring/grafana/provisioning/

# Grafana 컨테이너 상태 확인
docker-compose ps | grep grafana

# Grafana 웹 UI 접속
echo "Grafana 접속: http://localhost:3001"
echo "사용자명: admin, 비밀번호: admin123"
```

### **3.3 메트릭 수집 확인**
```bash
# 애플리케이션 메트릭 확인
curl http://localhost:3000/metrics | head -20

# Prometheus 타겟 상태 확인
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'

# Node Exporter 메트릭 확인
curl http://localhost:9100/metrics | grep node_cpu_seconds_total | head -5
```

## 🔄 실습 4: CI/CD 파이프라인 실행

### **4.1 워크플로우 파일 분석**
```bash
# 워크플로우 파일 확인
cat .github/workflows/advanced-cicd.yml | head -50

# 주요 섹션별 설명
echo "=== 워크플로우 구조 ==="
echo "1. 코드 품질 검사 (ESLint, 테스트)"
echo "2. Docker 이미지 빌드 및 푸시"
echo "3. 멀티 환경 배포 (AWS, GCP)"
echo "4. 배포 후 테스트"
echo "5. 알림 발송"
```

### **4.2 로컬 테스트 실행**
```bash
# 코드 품질 검사
npm install
npm run lint
npm test

# Docker Compose 프로덕션 환경 테스트
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml ps
```

### **4.3 GitHub Actions 실행**
```bash
# 코드 변경 후 커밋
echo "# 실습 완료" >> README.md
git add .
git commit -m "feat: Day 2 실습 완료"
git push origin day2-advanced

# GitHub Actions에서 워크플로우 확인
echo "GitHub Actions 확인: https://github.com/jungfrau70/github-actions-demo-day2/actions"
```

## 🌐 실습 5: 멀티 환경 배포

### **5.1 환경별 설정 확인**
```bash
# 개발 환경 설정
echo "=== 개발 환경 ==="
docker-compose config

# 프로덕션 환경 설정
echo "=== 프로덕션 환경 ==="
docker-compose -f docker-compose.prod.yml config
```

### **5.2 컨테이너 네이밍 전략**
```bash
# 환경별 컨테이너 이름 확인
echo "=== 개발 환경 컨테이너 ==="
docker-compose ps --format "table {{.Name}}\t{{.Status}}"

echo "=== 프로덕션 환경 컨테이너 ==="
CONTAINER_PREFIX=test-prod docker-compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}"
```

### **5.3 헬스체크 확인**
```bash
# 애플리케이션 헬스체크
curl -f http://localhost:3000/health | jq

# Nginx 헬스체크
curl -f http://localhost/nginx-health

# Prometheus 헬스체크
curl -f http://localhost:9090/-/healthy
```

## 📈 실습 6: 모니터링 대시보드 구성

### **6.1 Grafana 기본 설정**
```bash
# Grafana 접속 후 다음 단계 수행
echo "=== Grafana 설정 단계 ==="
echo "1. http://localhost:3001 접속"
echo "2. admin/admin123 로그인"
echo "3. 데이터소스 확인 (Prometheus 자동 연결됨)"
echo "4. 대시보드 생성"
```

### **6.2 커스텀 대시보드 생성**
```bash
# 대시보드 생성 스크립트
cat > create_dashboard.sh << 'EOF'
#!/bin/bash
echo "=== Grafana 대시보드 생성 가이드 ==="
echo "1. + 버튼 클릭 → Dashboard 선택"
echo "2. Add panel 클릭"
echo "3. Prometheus 데이터소스 선택"
echo "4. 다음 쿼리들 추가:"
echo "   - rate(http_requests_total[5m])"
echo "   - http_request_duration_seconds"
echo "   - active_connections"
echo "   - node_cpu_seconds_total"
echo "5. 패널 제목 설정 및 저장"
EOF

chmod +x create_dashboard.sh
./create_dashboard.sh
```

### **6.3 알림 규칙 설정**
```bash
# Prometheus 알림 규칙 생성
mkdir -p monitoring/prometheus/rules

cat > monitoring/prometheus/rules/alerts.yml << 'EOF'
groups:
  - name: app_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"
      
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"
EOF
```

## 🧪 실습 7: 테스트 및 검증

### **7.1 부하 테스트**
```bash
# Apache Bench를 사용한 부하 테스트
if command -v ab &> /dev/null; then
    echo "=== 부하 테스트 실행 ==="
    ab -n 1000 -c 10 http://localhost:3000/health
else
    echo "Apache Bench가 설치되지 않았습니다."
    echo "대신 curl을 사용한 간단한 테스트를 실행합니다."
    for i in {1..10}; do
        curl -s http://localhost:3000/health > /dev/null
        echo "요청 $i 완료"
    done
fi
```

### **7.2 메트릭 수집 확인**
```bash
# 메트릭 수집 상태 확인
echo "=== 메트릭 수집 상태 ==="
echo "애플리케이션 메트릭:"
curl -s http://localhost:3000/metrics | grep -E "(http_requests_total|http_request_duration_seconds)" | head -5

echo "시스템 메트릭:"
curl -s http://localhost:9100/metrics | grep node_cpu_seconds_total | head -3

echo "컨테이너 메트릭:"
curl -s http://localhost:8080/metrics | grep container_cpu_usage_seconds_total | head -3
```

### **7.3 로그 분석**
```bash
# 애플리케이션 로그 확인
echo "=== 애플리케이션 로그 ==="
docker-compose logs app | tail -20

# Nginx 로그 확인
echo "=== Nginx 로그 ==="
docker-compose logs nginx | tail -10

# Prometheus 로그 확인
echo "=== Prometheus 로그 ==="
docker-compose logs prometheus | tail -10
```

## 🎯 실습 8: 고급 기능 실습

### **8.1 파라미터 기반 배포**
```bash
# GitHub Actions 수동 실행 가이드
echo "=== 수동 배포 실행 ==="
echo "1. GitHub 저장소 → Actions 탭"
echo "2. 'Advanced CI/CD Pipeline' 워크플로우 선택"
echo "3. 'Run workflow' 버튼 클릭"
echo "4. 파라미터 선택:"
echo "   - Provider: aws, gcp, both"
echo "   - Environment: staging, production"
echo "5. 'Run workflow' 실행"
```

### **8.2 롤백 전략**
```bash
# 롤백 시나리오 테스트
echo "=== 롤백 전략 테스트 ==="
echo "1. 이전 이미지로 롤백"
docker-compose down
docker-compose up -d

echo "2. 헬스체크 확인"
sleep 30
curl -f http://localhost:3000/health

echo "3. 서비스 상태 확인"
docker-compose ps
```

### **8.3 모니터링 알림 설정**
```bash
# 알림 설정 가이드
cat > alerting_guide.md << 'EOF'
# 모니터링 알림 설정 가이드

## Grafana 알림 설정
1. Grafana → Alerting → Alert Rules
2. New alert rule 생성
3. 조건 설정:
   - Query: rate(http_requests_total[5m])
   - Condition: IS ABOVE 10
4. 알림 채널 설정 (이메일, Slack 등)

## Prometheus 알림 설정
1. monitoring/prometheus/rules/alerts.yml 파일 수정
2. Alertmanager 설정 추가
3. 알림 규칙 적용
EOF
```

## 🧹 실습 9: 정리 및 최적화

### **9.1 리소스 정리**
```bash
# 사용하지 않는 컨테이너 정리
echo "=== 리소스 정리 ==="
docker-compose down
docker system prune -f

# 볼륨 정리 (주의: 데이터 손실 가능)
# docker volume prune -f
```

### **9.2 성능 최적화**
```bash
# Docker 이미지 최적화 확인
echo "=== 이미지 최적화 확인 ==="
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep github-actions-demo

# 컨테이너 리소스 사용량 확인
docker stats --no-stream
```

### **9.3 보안 검토**
```bash
# 보안 취약점 스캔
echo "=== 보안 검토 ==="
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image github-actions-demo:latest

# npm audit 실행
npm audit
```

## ✅ 실습 완료 체크리스트

### **기본 실습**
- [ ] 프로젝트 클론 및 설정 완료
- [ ] Docker 이미지 빌드 성공
- [ ] Docker Compose 개발 환경 실행
- [ ] Prometheus 메트릭 수집 확인
- [ ] Grafana 대시보드 접속
- [ ] GitHub Actions 워크플로우 실행

### **고급 실습**
- [ ] 멀티 환경 배포 테스트
- [ ] 커스텀 대시보드 생성
- [ ] 알림 규칙 설정
- [ ] 부하 테스트 실행
- [ ] 롤백 전략 테스트
- [ ] 성능 최적화 적용

### **실무 적용**
- [ ] 모니터링 대시보드 구성
- [ ] CI/CD 파이프라인 커스터마이징
- [ ] 보안 설정 검토
- [ ] 문서화 완료

## 🎉 실습 완료!

축하합니다! Day 2 실습을 완료했습니다. 이제 다음 단계로 진행할 수 있습니다:

1. **Day 3**: 고급 모니터링 및 알림 시스템
2. **실무 프로젝트**: 학습한 기술을 실제 프로젝트에 적용
3. **인증 취득**: Docker, Kubernetes, AWS 등 관련 인증

---

**Happy Learning! 🚀**
