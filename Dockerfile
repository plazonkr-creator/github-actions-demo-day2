# 멀티스테이지 빌드 - Day2 고급 기능
# Stage 1: 빌드 환경
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사 (캐싱 최적화)
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production && npm cache clean --force

# Stage 2: 프로덕션 환경
FROM node:18-alpine AS production

# 보안을 위한 non-root 사용자 생성
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 작업 디렉토리 설정
WORKDIR /app

# 필요한 시스템 패키지 설치
RUN apk add --no-cache \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# 빌드 스테이지에서 node_modules 복사
COPY --from=builder /app/node_modules ./node_modules

# 애플리케이션 코드 복사
COPY --chown=nodejs:nodejs . .

# 로그 디렉토리 생성
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# 사용자 전환
USER nodejs

# 포트 노출
EXPOSE 3000

# 헬스체크 설정
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=3000

# dumb-init를 사용하여 시그널 처리 개선
ENTRYPOINT ["dumb-init", "--"]

# 애플리케이션 실행
CMD ["node", "src/server.js"]
