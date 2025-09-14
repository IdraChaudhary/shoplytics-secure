-- Production Database Initialization Script
-- This script sets up the database with proper permissions and indexes

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom roles for better security
DO $$
BEGIN
    -- App role for normal operations
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'shoplytics_app') THEN
        CREATE ROLE shoplytics_app LOGIN;
    END IF;
    
    -- Read-only role for analytics/reporting
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'shoplytics_readonly') THEN
        CREATE ROLE shoplytics_readonly LOGIN;
    END IF;
END
$$;

-- Create database if it doesn't exist (this would typically be done by the hosting provider)
-- CREATE DATABASE shoplytics_production;

-- Connect to the database and set up tables
-- (Prisma will handle table creation, but we can add indexes and triggers here)

-- Custom functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Performance indexes (these supplement Prisma's generated indexes)
-- Note: Only create if tables exist (Prisma will create tables first)

-- Tenant performance indexes
-- CREATE INDEX IF NOT EXISTS idx_tenant_status ON "Tenant"(status);
-- CREATE INDEX IF NOT EXISTS idx_tenant_shopify_domain ON "Tenant"(shopify_domain);
-- CREATE INDEX IF NOT EXISTS idx_tenant_created_at ON "Tenant"(created_at);

-- User performance indexes
-- CREATE INDEX IF NOT EXISTS idx_user_email_lower ON "User"(LOWER(email));
-- CREATE INDEX IF NOT EXISTS idx_user_tenant_id ON "User"(tenant_id);
-- CREATE INDEX IF NOT EXISTS idx_user_role ON "User"(role);

-- Session performance indexes
-- CREATE INDEX IF NOT EXISTS idx_session_user_id ON "Session"(user_id);
-- CREATE INDEX IF NOT EXISTS idx_session_expires_at ON "Session"(expires_at);
-- CREATE INDEX IF NOT EXISTS idx_session_tenant_id ON "Session"(tenant_id);

-- Analytics performance indexes (for future tables)
-- These would be created once analytics tables are defined

-- Grant permissions
GRANT CONNECT ON DATABASE shoplytics_production TO shoplytics_app;
GRANT CONNECT ON DATABASE shoplytics_production TO shoplytics_readonly;

-- Grant schema permissions
GRANT USAGE ON SCHEMA public TO shoplytics_app;
GRANT USAGE ON SCHEMA public TO shoplytics_readonly;

-- Grant table permissions (these would be run after Prisma creates tables)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO shoplytics_app;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO shoplytics_readonly;

-- Grant sequence permissions
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO shoplytics_app;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO shoplytics_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO shoplytics_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO shoplytics_app;

-- Security settings
-- Row Level Security can be enabled per table as needed
-- ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Audit trail function (optional)
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, old_data, new_data, user_id, timestamp)
        VALUES (TG_TABLE_NAME, 'INSERT', NULL, row_to_json(NEW), NEW.id, NOW());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, old_data, new_data, user_id, timestamp)
        VALUES (TG_TABLE_NAME, 'UPDATE', row_to_json(OLD), row_to_json(NEW), NEW.id, NOW());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, old_data, new_data, user_id, timestamp)
        VALUES (TG_TABLE_NAME, 'DELETE', row_to_json(OLD), NULL, OLD.id, NOW());
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create audit log table (optional)
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);

-- Database maintenance functions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete expired sessions older than 7 days
    DELETE FROM "Session" 
    WHERE expires_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Performance monitoring view
CREATE OR REPLACE VIEW performance_stats AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- Connection and performance monitoring
CREATE OR REPLACE VIEW connection_stats AS
SELECT 
    count(*) as total_connections,
    count(*) FILTER (WHERE state = 'active') as active_connections,
    count(*) FILTER (WHERE state = 'idle') as idle_connections,
    count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
FROM pg_stat_activity 
WHERE datname = current_database();

-- Notify that initialization is complete
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully';
    RAISE NOTICE 'Created extensions: uuid-ossp, pgcrypto';
    RAISE NOTICE 'Created roles: shoplytics_app, shoplytics_readonly';
    RAISE NOTICE 'Created functions: update_updated_at_column, cleanup_old_sessions, audit_trigger';
    RAISE NOTICE 'Created audit_log table and performance monitoring views';
END
$$;
