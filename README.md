# 🚀 GitHub Actions CI/CD 실습 프로젝트 - Day 2

> **고급 CI/CD 파이프라인과 모니터링 스택을 구축하는 실습 프로젝트**

[![CI/CD Pipeline](https://github.com/jungfrau70/github-actions-demo-day2/workflows/Advanced%20CI/CD%20Pipeline/badge.svg)](https://github.com/jungfrau70/github-actions-demo-day2/actions)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=flat&logo=prometheus&logoColor=white)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-F46800?style=flat&logo=grafana&logoColor=white)](https://grafana.com/)

## 📋 프로젝트 개요

이 프로젝트는 현대적인 DevOps 워크플로우를 학습하기 위한 실습 프로젝트입니다. Docker, Docker Compose, GitHub Actions, Prometheus, Grafana를 활용하여 완전한 CI/CD 파이프라인과 모니터링 스택을 구축합니다.

### **🎯 학습 목표**
- 멀티스테이지 Dockerfile을 사용한 이미지 최적화
- Docker Compose로 마이크로서비스 아키텍처 구축
- Prometheus + Grafana 모니터링 스택 구축
- GitHub Actions 고급 CI/CD 파이프라인 구현
- 멀티 환경 배포 (AWS/GCP)

## 🏗️ 아키텍처

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

## 🚀 빠른 시작

### **필수 요구사항**
- Docker & Docker Compose
- Node.js 18+
- Git
- GitHub 계정

### **1. 프로젝트 클론**
```bash
git clone https://github.com/jungfrau70/github-actions-demo-day2.git
cd github-actions-demo-day2
git checkout day2-advanced
```

### **2. 개발 환경 실행**
```bash
# 모든 서비스 시작 (앱 + 모니터링)
docker-compose up -d

# 서비스 상태 확인
docker-compose ps
```

### **3. 애플리케이션 접속**
- **메인 앱**: http://localhost:3000
- **헬스체크**: http://localhost:3000/health
- **메트릭**: http://localhost:3000/metrics
- **Grafana**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090

## 📁 프로젝트 구조

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
├── docs/
│   ├── DAY2-LECTURE.md            # Day 2 강의안
│   └── DAY2-HANDSON.md            # Day 2 실습 가이드
├── docker-compose.yml             # 개발 환경
├── docker-compose.prod.yml        # 프로덕션 환경
├── Dockerfile                     # 멀티스테이지 빌드
├── package.json                   # Node.js 의존성
└── README.md                      # 프로젝트 문서
```

## 🛠️ 주요 기능

### **1. 멀티스테이지 Dockerfile**
- **빌드 환경**: Node.js 의존성 설치
- **실행 환경**: 최적화된 런타임 이미지
- **이미지 크기**: 50% 이상 최적화

### **2. Docker Compose 마이크로서비스**
- **Node.js 애플리케이션**: Express 기반 REST API
- **PostgreSQL**: 관계형 데이터베이스
- **Redis**: 인메모리 캐시
- **Nginx**: 리버스 프록시 및 로드밸런서

### **3. 모니터링 스택**
- **Prometheus**: 메트릭 수집 및 저장
- **Grafana**: 대시보드 및 시각화
- **Node Exporter**: 시스템 메트릭
- **cAdvisor**: 컨테이너 메트릭
- **Redis/PostgreSQL Exporter**: 데이터베이스 메트릭

### **4. 고급 CI/CD 파이프라인**
- **멀티 환경 배포**: AWS, GCP 동시 배포
- **파라미터 기반 배포**: 수동 트리거로 선택적 배포
- **헬스체크**: 배포 후 서비스 상태 검증
- **롤백 전략**: 실패 시 자동 복구

## 📊 모니터링

### **수집되는 메트릭**
- **애플리케이션**: HTTP 요청, 응답 시간, 메모리 사용량
- **시스템**: CPU, 메모리, 디스크 I/O, 네트워크
- **컨테이너**: 각 컨테이너별 리소스 사용량
- **데이터베이스**: 연결 수, 쿼리 성능, 테이블 크기
- **캐시**: Redis 메모리 사용량, 키 수, 명령 실행 수

### **대시보드**
- **시스템 메트릭**: CPU, 메모리, 디스크 사용률
- **애플리케이션 메트릭**: HTTP 요청, 응답 시간, 오류율
- **비즈니스 메트릭**: 사용자 수, API 호출 수
- **인프라 메트릭**: 컨테이너 상태, 네트워크 트래픽

## 🔧 개발 가이드

### **로컬 개발**
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 테스트 실행
npm test

# 코드 품질 검사
npm run lint
```

### **Docker 개발**
```bash
# 개발 환경 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f app

# 서비스 재시작
docker-compose restart app
```

### **프로덕션 배포**
```bash
# 프로덕션 환경 실행
docker-compose -f docker-compose.prod.yml up -d

# 서비스 상태 확인
docker-compose -f docker-compose.prod.yml ps
```

## 🚨 문제 해결

### **자주 발생하는 문제**

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

### **상세 문제 해결 가이드**
- [MONITORING.md](./MONITORING.md) - 모니터링 설정 및 문제 해결
- [docs/DAY2-HANDSON.md](./docs/DAY2-HANDSON.md) - 실습 가이드

## 📚 학습 자료

### **강의 자료**
- [Day 2 강의안](./docs/DAY2-LECTURE.md) - 이론 및 개념 설명
- [Day 2 실습 가이드](./docs/DAY2-HANDSON.md) - 단계별 실습 가이드

### **추가 학습**
- [Docker 공식 문서](https://docs.docker.com/)
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Prometheus 공식 문서](https://prometheus.io/docs/)
- [Grafana 공식 문서](https://grafana.com/docs/)

## 🎯 실습 완료 체크리스트

### **Day 2 완료 후 확인사항**
- [ ] 멀티스테이지 Dockerfile 빌드 성공
- [ ] Docker Compose로 전체 스택 실행
- [ ] Prometheus 메트릭 수집 확인
- [ ] Grafana 대시보드 설정
- [ ] GitHub Actions CI/CD 파이프라인 실행
- [ ] 멀티 환경 배포 (AWS/GCP) 성공
- [ ] 배포 후 테스트 통과
- [ ] 모니터링 알림 설정

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면 다음을 통해 연락해주세요:

- **Issues**: [GitHub Issues](https://github.com/jungfrau70/github-actions-demo-day2/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jungfrau70/github-actions-demo-day2/discussions)

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들의 도움을 받아 만들어졌습니다:

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Docker](https://www.docker.com/)
- [Prometheus](https://prometheus.io/)
- [Grafana](https://grafana.com/)
- [GitHub Actions](https://github.com/features/actions)

---

**Happy Learning! 🚀**