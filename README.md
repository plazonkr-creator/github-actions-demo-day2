# 🚀 GitHub Actions Demo - Day2 고급 기능

> **Day2 실습용 프로젝트**: 고급 CI/CD 파이프라인과 다중 서비스 환경 구축

## 📋 프로젝트 개요

이 프로젝트는 Cloud Master 과정의 2일차 실습을 위한 고급 CI/CD 파이프라인과 다중 서비스 환경을 구축하는 실습 프로젝트입니다.

### 🎯 주요 기능

- **고급 CI/CD 파이프라인**: GitHub Actions를 활용한 멀티 환경 배포
- **다중 서비스 환경**: PostgreSQL + Redis + Nginx 통합
- **모니터링 시스템**: Prometheus 메트릭 수집 및 헬스체크
- **보안 스캔**: Trivy를 활용한 컨테이너 보안 검사
- **자동화된 테스트**: 단위 테스트 및 통합 테스트

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   Node.js App   │    │   PostgreSQL    │
│   (Load Balancer)│◄──►│   (Express)     │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Redis         │
                       │   (Cache)       │
                       └─────────────────┘
```

## 🛠️ 기술 스택

### Backend
- **Node.js 18**: 런타임 환경
- **Express.js**: 웹 프레임워크
- **PostgreSQL**: 메인 데이터베이스
- **Redis**: 캐시 및 세션 저장소

### DevOps
- **Docker**: 컨테이너화
- **Docker Compose**: 다중 서비스 관리
- **GitHub Actions**: CI/CD 파이프라인
- **Nginx**: 로드밸런서 및 리버스 프록시

### Monitoring
- **Prometheus**: 메트릭 수집
- **Winston**: 로깅
- **Health Checks**: 서비스 상태 모니터링

## 🚀 빠른 시작

### 1. 프로젝트 클론

```bash
# GitHub 저장소 클론
git clone https://github.com/your-username/github-actions-demo-day2.git
cd github-actions-demo-day2

# 브랜치 전환 (Day2 실습용)
git checkout day2-advanced
```

### 2. 환경 설정

```bash
# 환경 변수 파일 생성
npm run setup:env

# 의존성 설치
npm install
```

### 3. 개발 환경 실행

```bash
# Docker Compose로 개발 환경 시작
docker-compose up -d

# 서비스 상태 확인
docker-compose ps

# 헬스체크 확인
curl http://localhost/health
```

### 4. 테스트 실행

```bash
# 단위 테스트
npm run test:unit

# 통합 테스트
npm run test:integration

# 전체 테스트
npm test
```

## 📁 프로젝트 구조

```
github-actions-demo-day2/
├── src/                          # 소스 코드
│   └── app.js                    # 메인 애플리케이션
├── tests/                        # 테스트 파일
│   ├── unit/                     # 단위 테스트
│   └── integration/              # 통합 테스트
├── database/                     # 데이터베이스 스크립트
│   └── init.sql                  # 초기화 스크립트
├── nginx/                        # Nginx 설정
│   ├── nginx.dev.conf            # 개발 환경 설정
│   └── nginx.prod.conf           # 프로덕션 환경 설정
├── scripts/                      # 유틸리티 스크립트
│   ├── setup-env.js              # 환경 설정
│   ├── migrate.js                # 데이터베이스 마이그레이션
│   └── seed.js                   # 시드 데이터 생성
├── .github/workflows/            # GitHub Actions 워크플로우
│   └── advanced-cicd.yml         # 고급 CI/CD 파이프라인
├── docker-compose.yml            # 개발 환경 Docker Compose
├── docker-compose.prod.yml       # 프로덕션 환경 Docker Compose
├── Dockerfile                    # 멀티스테이지 빌드
└── package.json                  # 프로젝트 설정
```

## 🔧 환경 변수

### 개발 환경 (.env)
```bash
NODE_ENV=development
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=myapp
DB_USER=myapp_user
DB_PASSWORD=password
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=password
LOG_LEVEL=debug
```

### 프로덕션 환경 (.env.prod)
```bash
NODE_ENV=production
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=myapp
DB_USER=myapp_user
DB_PASSWORD=your_secure_db_password_here
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password_here
LOG_LEVEL=info
```

## 🐳 Docker 명령어

### 개발 환경
```bash
# 서비스 시작
docker-compose up -d

# 서비스 중지
docker-compose down

# 로그 확인
docker-compose logs -f app

# 서비스 재시작
docker-compose restart app
```

### 프로덕션 환경
```bash
# 프로덕션 환경 실행
docker-compose -f docker-compose.prod.yml up -d

# 프로덕션 환경 중지
docker-compose -f docker-compose.prod.yml down

# 프로덕션 로그 확인
docker-compose -f docker-compose.prod.yml logs -f
```

## 🧪 테스트

### 테스트 실행
```bash
# 전체 테스트
npm test

# 단위 테스트만
npm run test:unit

# 통합 테스트만
npm run test:integration

# 커버리지 포함 테스트
npm test -- --coverage
```

### 테스트 구조
- **단위 테스트**: 개별 함수 및 모듈 테스트
- **통합 테스트**: 데이터베이스 및 외부 서비스 연동 테스트
- **E2E 테스트**: 전체 애플리케이션 플로우 테스트

## 📊 API 엔드포인트

### 헬스체크
- `GET /health` - 서비스 상태 확인
- `GET /metrics` - Prometheus 메트릭

### 사용자 관리
- `GET /api/users` - 사용자 목록 조회
- `POST /api/users` - 새 사용자 생성
- `GET /api/users/cached` - 캐시된 사용자 목록

### 로그 관리
- `GET /api/logs` - 로그 목록 조회
- `POST /api/logs` - 새 로그 생성

### 시스템 상태
- `GET /api/redis/status` - Redis 상태 확인
- `GET /api/db/status` - 데이터베이스 상태 확인

## 🔄 CI/CD 파이프라인

### GitHub Actions 워크플로우
1. **코드 품질 검사**: 린팅, 포맷팅, 보안 감사
2. **멀티 환경 테스트**: Node.js 16, 18, 20 버전 테스트
3. **Docker 이미지 빌드**: 멀티스테이지 빌드 및 푸시
4. **보안 스캔**: Trivy를 활용한 컨테이너 보안 검사
5. **환경별 배포**: 스테이징/프로덕션 환경 자동 배포
6. **배포 후 테스트**: 배포된 애플리케이션 상태 확인

### Repository Secrets 설정
```bash
# Docker Hub
DOCKER_USERNAME: your-docker-username
DOCKER_PASSWORD: your-docker-password

# 스테이징 환경
STAGING_VM_HOST: staging-vm-public-ip
STAGING_VM_USERNAME: ubuntu
STAGING_VM_SSH_KEY: staging-vm-ssh-private-key
STAGING_DB_PASSWORD: staging-db-password
STAGING_REDIS_PASSWORD: staging-redis-password

# 프로덕션 환경
PROD_VM_HOST: prod-vm-public-ip
PROD_VM_USERNAME: ubuntu
PROD_VM_SSH_KEY: prod-vm-ssh-private-key
PROD_DB_PASSWORD: prod-db-password
PROD_REDIS_PASSWORD: prod-redis-password
```

## 📈 모니터링

### Prometheus 메트릭
- `http_requests_total`: HTTP 요청 총 수
- `http_request_duration_seconds`: HTTP 요청 응답 시간
- `active_connections`: 활성 연결 수
- `nodejs_*`: Node.js 기본 메트릭

### 헬스체크
- **애플리케이션**: `/health` 엔드포인트
- **데이터베이스**: PostgreSQL 연결 상태
- **Redis**: Redis 연결 상태
- **메모리**: 메모리 사용량 모니터링

## 🚨 문제 해결

### 자주 발생하는 문제

1. **Docker Compose 서비스 시작 실패**
   ```bash
   # 로그 확인
   docker-compose logs -f [service-name]
   
   # 서비스 재시작
   docker-compose restart [service-name]
   ```

2. **데이터베이스 연결 오류**
   ```bash
   # 환경 변수 확인
   docker-compose config
   
   # 데이터베이스 상태 확인
   docker-compose exec postgres pg_isready -U myapp_user
   ```

3. **GitHub Actions 워크플로우 실패**
   ```bash
   # Secrets 설정 확인
   # GitHub Repository > Settings > Secrets and variables > Actions
   
   # 워크플로우 파일 문법 검사
   # .github/workflows/ 디렉토리 확인
   ```

4. **Nginx 프록시 오류**
   ```bash
   # Nginx 설정 확인
   docker-compose exec nginx nginx -t
   
   # Nginx 재시작
   docker-compose restart nginx
   ```

## 📚 추가 학습 자료

- [GitHub Actions 공식 문서](https://docs.github.com/en/actions)
- [Docker Compose 공식 문서](https://docs.docker.com/compose/)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [Redis 공식 문서](https://redis.io/documentation)
- [Nginx 공식 문서](https://nginx.org/en/docs/)
- [Prometheus 공식 문서](https://prometheus.io/docs/)

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

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Happy Learning! 🎉**

이 프로젝트를 통해 고급 CI/CD 파이프라인과 다중 서비스 환경을 구축하는 실무 경험을 쌓을 수 있습니다.
