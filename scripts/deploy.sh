#!/bin/bash

# Production Deployment Script for Shoplytics
# This script handles database migrations, build process, and deployment verification

set -e  # Exit on any error

# Configuration
APP_NAME="shoplytics-secure"
NODE_ENV="${NODE_ENV:-production}"
DATABASE_URL="${DATABASE_URL}"
DEPLOYMENT_ENV="${RAILWAY_ENVIRONMENT:-${VERCEL_ENV:-production}}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓ $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠ $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗ $1${NC}"
}

# Check if required environment variables are set
check_environment() {
    log "Checking environment configuration..."
    
    REQUIRED_VARS=(
        "DATABASE_URL"
        "JWT_SECRET"
        "SHOPIFY_API_KEY"
        "SHOPIFY_API_SECRET"
    )
    
    MISSING_VARS=()
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [[ -z "${!var}" ]]; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
        error "Missing required environment variables:"
        printf '%s\n' "${MISSING_VARS[@]}" | sed 's/^/  - /'
        exit 1
    fi
    
    success "Environment configuration validated"
}

# Check database connectivity
check_database() {
    log "Checking database connectivity..."
    
    if command -v psql >/dev/null 2>&1; then
        if psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
            success "Database connection successful"
        else
            error "Failed to connect to database"
            exit 1
        fi
    else
        warning "psql not available, skipping database connectivity check"
    fi
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    if [[ ! -f "prisma/schema.prisma" ]]; then
        error "Prisma schema not found"
        exit 1
    fi
    
    # Generate Prisma client
    log "Generating Prisma client..."
    npx prisma generate
    
    # Push database schema (or run migrations if using migrate)
    log "Applying database schema..."
    npx prisma db push --accept-data-loss
    
    success "Database migrations completed"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    if [[ -f "package-lock.json" ]]; then
        npm ci --only=production --ignore-scripts
    elif [[ -f "yarn.lock" ]]; then
        yarn install --production --frozen-lockfile
    else
        npm install --only=production --ignore-scripts
    fi
    
    success "Dependencies installed"
}

# Build application
build_application() {
    log "Building application..."
    
    # Set build environment
    export NODE_ENV=production
    export NEXT_TELEMETRY_DISABLED=1
    
    # Clean previous build
    if [[ -d ".next" ]]; then
        rm -rf .next
    fi
    
    # Build the application
    npm run build
    
    if [[ ! -d ".next" ]]; then
        error "Build failed - .next directory not created"
        exit 1
    fi
    
    success "Application built successfully"
}

# Run post-deployment scripts
post_deployment() {
    log "Running post-deployment tasks..."
    
    # Seed database if needed (in development/staging)
    if [[ "$DEPLOYMENT_ENV" != "production" ]]; then
        if [[ -f "prisma/seed.ts" || -f "prisma/seed.js" ]]; then
            log "Seeding database..."
            npx prisma db seed
        fi
    fi
    
    # Warm up the application
    if [[ -n "$HEALTH_CHECK_URL" ]]; then
        log "Warming up application..."
        sleep 10
        if curl -f "$HEALTH_CHECK_URL" >/dev/null 2>&1; then
            success "Application is responding"
        else
            warning "Health check failed, but continuing deployment"
        fi
    fi
    
    success "Post-deployment tasks completed"
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Check if the application is running
    if [[ -n "$PORT" ]]; then
        log "Checking if application is listening on port $PORT..."
        sleep 5
        
        if command -v curl >/dev/null 2>&1; then
            if curl -f "http://localhost:$PORT/api/health" >/dev/null 2>&1; then
                success "Application health check passed"
            else
                warning "Health check endpoint not responding"
            fi
        fi
    fi
    
    success "Deployment verification completed"
}

# Cleanup function
cleanup() {
    log "Cleaning up temporary files..."
    
    # Remove build artifacts that aren't needed in production
    if [[ -d "node_modules/.cache" ]]; then
        rm -rf node_modules/.cache
    fi
    
    # Clean up any temporary files
    find . -name "*.tmp" -delete 2>/dev/null || true
    find . -name "*.log" -older +7 2>/dev/null -delete || true
    
    success "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting deployment of $APP_NAME to $DEPLOYMENT_ENV environment..."
    
    # Deployment steps
    check_environment
    check_database
    install_dependencies
    run_migrations
    build_application
    post_deployment
    verify_deployment
    cleanup
    
    success "Deployment completed successfully!"
    log "Application: $APP_NAME"
    log "Environment: $DEPLOYMENT_ENV"
    log "Node version: $(node --version)"
    log "NPM version: $(npm --version)"
    log "Deployment time: $(date)"
}

# Handle errors
trap 'error "Deployment failed at line $LINENO"' ERR

# Run main function
main "$@"
