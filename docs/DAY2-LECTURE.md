# 🚀 Day 2: 고급 CI/CD 파이프라인과 모니터링

## 📋 학습 목표

- **멀티 환경 배포**: AWS, GCP 환경에서의 자동 배포
- **Docker Compose**: 마이크로서비스 아키텍처 구축
- **모니터링 스택**: Prometheus + Grafana를 활용한 관찰 가능성
- **고급 CI/CD**: 파라미터 기반 배포, 헬스체크, 롤백 전략

## 🎯 실습 개요

### **아키텍처 다이어그램**
```
┌─────────────────┐    ┌─────────────────┐
│   GitHub        │    │   GitHub        │
│   Actions       │───▶│   Actions       │
│   (CI/CD)       │    │   (CI/CD)       │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   AWS VM        │    │   GCP VM        │
│   (Production)  │    │   (Staging)     │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────┐
│           Docker Compose Stack          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │   App   │ │  Nginx  │ │  Redis  │   │
│  │ (Node.js)│ │(Proxy) │ │(Cache)  │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Postgres │ │Prometheus│ │ Grafana │   │
│  │   DB    │ │(Metrics)│ │(Dash)   │   │
│  └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
```

## 🔧 실습 환경 구성

### **필수 요구사항**
- Docker & Docker Compose
- GitHub 계정
- AWS/GCP VM (선택사항)
- Node.js 18+

### **프로젝트 구조**
```
github-actions-demo-day2/
├── .github/workflows/
│   └── advanced-cicd.yml          # 고급 CI/CD 워크플로우
├── src/
│   ├── app.js                     # Express 애플리케이션
│   └── server.js                  # 서버 시작 파일
├── nginx/
│   ├── nginx.dev.conf             # 개발용 Nginx 설정
│   └── nginx.prod.conf            # 프로덕션용 Nginx 설정
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.yml         # Prometheus 설정
│   └── grafana/
│       └── provisioning/          # Grafana 자동 설정
├── docker-compose.yml             # 개발 환경
├── docker-compose.prod.yml        # 프로덕션 환경
├── Dockerfile                     # 멀티스테이지 빌드
└── package.json                   # Node.js 의존성
```

## 📖 1단계: 멀티스테이지 Dockerfile

### **개념 설명**
멀티스테이지 빌드는 빌드 환경과 실행 환경을 분리하여 최종 이미지 크기를 최적화합니다.

### **실습 코드**
```dockerfile
# 1단계: 빌드 환경
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 2단계: 실행 환경
FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY src/ ./src/
EXPOSE 3000
CMD ["node", "src/server.js"]
```

### **장점**
- **이미지 크기 최적화**: 빌드 도구 제거로 50% 이상 크기 감소
- **보안 강화**: 불필요한 패키지 제거
- **빌드 속도 향상**: 캐시 레이어 최적화

## 📖 2단계: Docker Compose 마이크로서비스

### **개념 설명**
Docker Compose를 사용하여 여러 서비스를 하나의 애플리케이션으로 구성합니다.

### **핵심 서비스**
```yaml
services:
  app:                    # Node.js 애플리케이션
  postgres:              # PostgreSQL 데이터베이스
  redis:                 # Redis 캐시
  nginx:                 # Nginx 리버스 프록시
  prometheus:            # 메트릭 수집
  grafana:              # 대시보드
```

### **네트워킹**
- **브리지 네트워크**: 서비스 간 통신
- **포트 매핑**: 외부 접근 가능한 포트
- **볼륨 마운트**: 데이터 영속성

## 📖 3단계: 고급 CI/CD 파이프라인

### **워크플로우 구조**
```yaml
name: Advanced CI/CD Pipeline
on:
  push:
    branches: [master, day2-advanced]
  workflow_dispatch:
    inputs:
      provider: [aws, gcp, both]
      environment: [staging, production]

jobs:
  test:                    # 코드 품질 검사
  build:                   # Docker 이미지 빌드
  deploy-aws:             # AWS 배포
  deploy-gcp:             # GCP 배포
  post-deployment-test:   # 배포 후 테스트
  notify:                 # 알림
```

### **핵심 기능**
- **파라미터 기반 배포**: 수동 트리거로 선택적 배포
- **멀티 환경 지원**: AWS, GCP 동시 배포
- **헬스체크**: 배포 후 서비스 상태 검증
- **롤백 전략**: 실패 시 자동 복구

## 📖 4단계: 모니터링 스택

### **Prometheus 메트릭 수집**
```javascript
// 커스텀 메트릭 정의
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

// 메트릭 수집 미들웨어
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path, res.statusCode)
      .observe(duration);
  });
  next();
});
```

### **Grafana 대시보드**
- **시스템 메트릭**: CPU, 메모리, 디스크
- **애플리케이션 메트릭**: HTTP 요청, 응답 시간
- **비즈니스 메트릭**: 사용자 수, API 호출 수

## 🛠️ 실습 가이드

### **실습 1: 로컬 환경 구축**
```bash
# 1. 프로젝트 클론
git clone <repository-url>
cd github-actions-demo-day2

# 2. 개발 환경 실행
docker-compose up -d

# 3. 서비스 상태 확인
docker-compose ps
```

### **실습 2: 모니터링 확인**
```bash
# 1. 애플리케이션 메트릭
curl http://localhost:3000/metrics

# 2. Prometheus 접속
open http://localhost:9090

# 3. Grafana 접속
open http://localhost:3001
# 사용자명: admin, 비밀번호: admin123
```

### **실습 3: CI/CD 파이프라인 실행**
```bash
# 1. 코드 변경 후 커밋
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin day2-advanced

# 2. GitHub Actions에서 워크플로우 확인
# https://github.com/username/repo/actions

# 3. 수동 배포 실행
# GitHub Actions → Run workflow → 파라미터 선택
```

## 🎯 핵심 학습 포인트

### **1. DevOps 문화**
- **개발과 운영의 통합**: 개발자가 직접 배포하고 모니터링
- **자동화 마인드셋**: 반복 작업을 자동화하여 효율성 극대화
- **지속적 개선**: 모니터링 데이터를 바탕으로 한 시스템 개선

### **2. 현대적인 개발 워크플로우**
- **Git 기반 협업**: 브랜치 전략과 코드 리뷰 프로세스
- **CI/CD 파이프라인**: 코드 품질 관리부터 배포까지의 자동화
- **인프라 코드화**: Docker와 Docker Compose를 통한 환경 관리

### **3. 모니터링 및 관찰 가능성**
- **메트릭 기반 의사결정**: 데이터를 바탕으로 한 시스템 최적화
- **장애 대응 능력**: 실시간 모니터링을 통한 빠른 문제 해결
- **성능 최적화**: 지속적인 성능 측정과 개선

## 🚨 문제 해결 가이드

### **자주 발생하는 문제들**

#### **1. Docker 빌드 실패**
```bash
# BuildKit 비활성화
export DOCKER_BUILDKIT=0
docker build -t github-actions-demo:latest .
```

#### **2. 컨테이너 시작 실패**
```bash
# 로그 확인
docker-compose logs

# 컨테이너 재시작
docker-compose restart

# 완전 정리 후 재시작
docker-compose down --remove-orphans
docker-compose up -d
```

#### **3. 메트릭 수집 실패**
```bash
# Prometheus 타겟 상태 확인
curl http://localhost:9090/api/v1/targets

# 애플리케이션 메트릭 확인
curl http://localhost:3000/metrics
```

## 🎓 실무 적용 가이드

### **스타트업 환경**
- **빠른 프로토타이핑**: Docker를 활용한 빠른 개발 환경 구축
- **비용 효율적 모니터링**: Prometheus + Grafana로 저비용 모니터링
- **자동화된 배포**: GitHub Actions로 소규모 팀의 배포 자동화

### **대기업 환경**
- **표준화된 개발 프로세스**: 일관된 CI/CD 파이프라인
- **확장 가능한 아키텍처**: 마이크로서비스 환경에서의 컨테이너 활용
- **엔터프라이즈 모니터링**: 대규모 시스템의 모니터링 체계

### **클라우드 환경**
- **클라우드 네이티브 개발**: 컨테이너 기반의 클라우드 애플리케이션
- **인프라 자동화**: Terraform, Ansible과 연계한 인프라 관리
- **멀티 클라우드 전략**: 다양한 클라우드 환경에서의 일관된 배포

## 📚 추가 학습 자료

### **공식 문서**
- [GitHub Actions 공식 문서](https://docs.github.com/en/actions)
- [Docker 공식 문서](https://docs.docker.com/)
- [Prometheus 공식 문서](https://prometheus.io/docs/)
- [Grafana 공식 문서](https://grafana.com/docs/)

### **추가 학습**
- [Docker Deep Dive](https://www.docker.com/products/docker-desktop)
- [Kubernetes 공식 튜토리얼](https://kubernetes.io/docs/tutorials/)
- [Terraform 공식 가이드](https://learn.hashicorp.com/terraform)
- [DevOps Roadmap](https://roadmap.sh/devops)

## 🎉 실습 완료 체크리스트

### **Day 2 완료 후 확인사항**
- [ ] 멀티스테이지 Dockerfile 빌드 성공
- [ ] Docker Compose로 전체 스택 실행
- [ ] Prometheus 메트릭 수집 확인
- [ ] Grafana 대시보드 설정
- [ ] GitHub Actions CI/CD 파이프라인 실행
- [ ] 멀티 환경 배포 (AWS/GCP) 성공
- [ ] 배포 후 테스트 통과
- [ ] 모니터링 알림 설정

---

**Happy Learning! 🚀**
