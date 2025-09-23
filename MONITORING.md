# 📊 모니터링 가이드

이 프로젝트는 Prometheus와 Grafana를 사용한 완전한 모니터링 스택을 제공합니다.

## 🚀 빠른 시작

### 개발 환경 실행
```bash
# 모든 서비스 시작 (앱 + 모니터링)
docker-compose up -d

# 서비스 상태 확인
docker-compose ps
```

### 프로덕션 환경 실행
```bash
# 프로덕션 환경 시작
docker-compose -f docker-compose.prod.yml up -d

# 서비스 상태 확인
docker-compose -f docker-compose.prod.yml ps
```

## 🌐 접속 URL

### 애플리케이션
- **메인 앱**: http://localhost:3000
- **헬스체크**: http://localhost:3000/health
- **메트릭**: http://localhost:3000/metrics

### 모니터링 도구
- **Grafana**: http://localhost:3001
  - 사용자명: `admin`
  - 비밀번호: `admin123`
- **Prometheus**: http://localhost:9090
- **cAdvisor**: http://localhost:8080 (컨테이너 메트릭)

### Exporter들
- **Node Exporter**: http://localhost:9100 (시스템 메트릭)
- **Redis Exporter**: http://localhost:9121 (Redis 메트릭)
- **PostgreSQL Exporter**: http://localhost:9187 (DB 메트릭)

## 📈 수집되는 메트릭

### 애플리케이션 메트릭
- HTTP 요청 수 (`http_requests_total`)
- HTTP 요청 지연시간 (`http_request_duration_seconds`)
- 활성 연결 수 (`active_connections`)
- 메모리 사용량
- 업타임

### 시스템 메트릭 (Node Exporter)
- CPU 사용률
- 메모리 사용량
- 디스크 I/O
- 네트워크 트래픽
- 파일시스템 사용량

### 컨테이너 메트릭 (cAdvisor)
- 컨테이너별 CPU 사용률
- 컨테이너별 메모리 사용량
- 컨테이너별 네트워크 I/O
- 컨테이너별 디스크 I/O

### 데이터베이스 메트릭 (PostgreSQL Exporter)
- 연결 수
- 쿼리 성능
- 테이블 크기
- 인덱스 사용률

### 캐시 메트릭 (Redis Exporter)
- 메모리 사용량
- 키 수
- 명령 실행 수
- 연결 수

## 🎯 Grafana 대시보드

### 기본 대시보드
Grafana에 접속하면 다음 대시보드들을 사용할 수 있습니다:

1. **Node Exporter Full** - 시스템 전체 메트릭
2. **Docker Containers** - 컨테이너별 메트릭
3. **PostgreSQL Database** - 데이터베이스 메트릭
4. **Redis Dashboard** - Redis 메트릭

### 커스텀 대시보드 생성
1. Grafana에 로그인
2. "+" 버튼 클릭 → "Dashboard" 선택
3. "Add panel" 클릭
4. Prometheus 데이터소스 선택
5. 원하는 메트릭 쿼리 입력

## 🔧 설정 파일

### Prometheus 설정
- **파일**: `monitoring/prometheus/prometheus.yml`
- **기능**: 메트릭 수집 대상 및 규칙 정의

### Grafana 설정
- **데이터소스**: `monitoring/grafana/provisioning/datasources/prometheus.yml`
- **대시보드**: `monitoring/grafana/provisioning/dashboards/dashboard.yml`

## 🚨 알림 설정

### Prometheus 알림 규칙
```yaml
# monitoring/prometheus/rules/alerts.yml
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
```

### Alertmanager 설정
```yaml
# monitoring/alertmanager/alertmanager.yml
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@example.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'http://localhost:5001/'
```

## 🛠️ 문제 해결

### Prometheus가 메트릭을 수집하지 않는 경우
```bash
# Prometheus 로그 확인
docker logs github-actions-demo-prometheus-dev

# 타겟 상태 확인
curl http://localhost:9090/api/v1/targets
```

### Grafana에 데이터가 표시되지 않는 경우
```bash
# Grafana 로그 확인
docker logs github-actions-demo-grafana-dev

# 데이터소스 연결 테스트
curl http://localhost:3001/api/datasources
```

### 메트릭 엔드포인트 확인
```bash
# 애플리케이션 메트릭
curl http://localhost:3000/metrics

# Node Exporter 메트릭
curl http://localhost:9100/metrics

# Redis Exporter 메트릭
curl http://localhost:9121/metrics
```

## 📚 추가 학습 자료

- [Prometheus 공식 문서](https://prometheus.io/docs/)
- [Grafana 공식 문서](https://grafana.com/docs/)
- [Node Exporter 문서](https://github.com/prometheus/node_exporter)
- [cAdvisor 문서](https://github.com/google/cadvisor)

## 🎉 실습 완료 체크리스트

- [ ] Prometheus가 모든 메트릭을 수집하고 있는지 확인
- [ ] Grafana에서 데이터소스 연결 확인
- [ ] 기본 대시보드가 정상 작동하는지 확인
- [ ] 커스텀 대시보드 생성해보기
- [ ] 알림 규칙 설정해보기
- [ ] 메트릭 쿼리 작성해보기

---

**Happy Monitoring! 📊**
