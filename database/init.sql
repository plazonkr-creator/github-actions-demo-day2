-- Day2 실습용 데이터베이스 초기화 스크립트
-- PostgreSQL 데이터베이스 스키마 및 초기 데이터

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 애플리케이션 로그 테이블
CREATE TABLE IF NOT EXISTS app_logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(20) NOT NULL CHECK (level IN ('error', 'warn', 'info', 'debug')),
    message TEXT NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 시스템 메트릭 테이블
CREATE TABLE IF NOT EXISTS system_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(20),
    labels JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_app_logs_level ON app_logs(level);
CREATE INDEX IF NOT EXISTS idx_app_logs_timestamp ON app_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_app_logs_level_timestamp ON app_logs(level, timestamp);

CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_metrics_name_timestamp ON system_metrics(metric_name, timestamp);

-- 초기 데이터 삽입
INSERT INTO users (username, email) VALUES 
    ('admin', 'admin@example.com'),
    ('testuser', 'test@example.com'),
    ('demo', 'demo@example.com')
ON CONFLICT (username) DO NOTHING;

INSERT INTO app_logs (level, message, metadata) VALUES 
    ('info', 'Application started', '{"version": "2.0.0", "environment": "development"}'),
    ('info', 'Database connection established', '{"host": "postgres", "port": 5432}'),
    ('info', 'Redis connection established', '{"host": "redis", "port": 6379}')
ON CONFLICT DO NOTHING;

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 생성
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 뷰 생성
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as users_today,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as users_this_week,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as users_this_month
FROM users;

CREATE OR REPLACE VIEW log_stats AS
SELECT 
    level,
    COUNT(*) as count,
    MIN(timestamp) as first_log,
    MAX(timestamp) as last_log
FROM app_logs
GROUP BY level;

-- 함수 생성
CREATE OR REPLACE FUNCTION get_user_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM users);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_recent_logs(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id INTEGER,
    level VARCHAR(20),
    message TEXT,
    "timestamp" TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, l.level, l.message, l."timestamp"
    FROM app_logs l
    ORDER BY l."timestamp" DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 권한 설정
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO myapp_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO myapp_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO myapp_user;

-- 데이터베이스 초기화 완료 로그
INSERT INTO app_logs (level, message, metadata) VALUES 
    ('info', 'Database initialization completed', '{"tables_created": 3, "indexes_created": 9, "initial_data_inserted": true}');
