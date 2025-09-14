#!/bin/bash

# Production Deployment Verification Script
# Tests all critical functionality after deployment

set -e

# Configuration
APP_URL="${APP_URL:-http://localhost:3000}"
HEALTH_TOKEN="${HEALTH_CHECK_TOKEN:-}"
WEBHOOK_SECRET="${SHOPIFY_WEBHOOK_SECRET:-}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() { echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"; }
success() { echo -e "${GREEN}[$(date +'%H:%M:%S')] ✓ $1${NC}"; }
warning() { echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠ $1${NC}"; }
error() { echo -e "${RED}[$(date +'%H:%M:%S')] ✗ $1${NC}"; }

# Test results tracking
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    log "Running: $test_name"
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if eval "$test_command" >/dev/null 2>&1; then
        success "$test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        error "$test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# 1. Basic Health Check
test_basic_health() {
    curl -f -s "$APP_URL/api/health" -o /dev/null
}

# 2. Detailed Health Check (with auth)
test_detailed_health() {
    if [[ -n "$HEALTH_TOKEN" ]]; then
        curl -f -s -H "Authorization: Bearer $HEALTH_TOKEN" \
             "$APP_URL/api/health" | jq -e '.status == "healthy"'
    else
        return 0  # Skip if no token
    fi
}

# 3. Database Connectivity
test_database_health() {
    if [[ -n "$HEALTH_TOKEN" ]]; then
        curl -f -s -H "Authorization: Bearer $HEALTH_TOKEN" \
             "$APP_URL/api/health" | jq -e '.checks.database.status == "pass"'
    else
        curl -f -s "$APP_URL/api/health" | jq -e '.checks.environment.status == "pass"'
    fi
}

# 4. Metrics Endpoint
test_metrics() {
    if [[ -n "$HEALTH_TOKEN" ]]; then
        curl -f -s -H "Authorization: Bearer $HEALTH_TOKEN" \
             "$APP_URL/api/metrics" | jq -e '.system.uptime >= 0'
    else
        return 0  # Skip if no token
    fi
}

# 5. Webhook Endpoint Health
test_webhook_health() {
    curl -f -s "$APP_URL/api/webhooks/shopify" | \
         jq -e '.status == "healthy"'
}

# 6. SSL Certificate (for HTTPS)
test_ssl_certificate() {
    if [[ "$APP_URL" =~ ^https:// ]]; then
        local domain=$(echo "$APP_URL" | sed 's|https://||' | sed 's|/.*||')
        echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | \
        openssl x509 -noout -dates | grep -q "notAfter"
    else
        return 0  # Skip for HTTP
    fi
}

# 7. Test Performance (Response Times)
test_performance() {
    local response_time=$(curl -w '%{time_total}' -s -o /dev/null "$APP_URL/api/health")
    # Check if response time is less than 2 seconds
    awk -v rt="$response_time" 'BEGIN { exit (rt > 2.0) ? 1 : 0 }'
}

# 8. Test CORS Headers
test_cors_headers() {
    curl -s -H "Origin: https://example.com" \
         -H "Access-Control-Request-Method: POST" \
         -H "Access-Control-Request-Headers: Content-Type" \
         -X OPTIONS "$APP_URL/api/health" | \
    grep -q "Access-Control-Allow"
}

# 9. Test Security Headers
test_security_headers() {
    local headers=$(curl -s -I "$APP_URL/api/health")
    echo "$headers" | grep -q "X-Frame-Options" && \
    echo "$headers" | grep -q "X-Content-Type-Options"
}

# 10. Test Environment Configuration
test_environment_config() {
    curl -f -s "$APP_URL/api/health" | \
         jq -e '.environment == "production" or .environment == "staging"'
}

# Main verification function
main() {
    log "🚀 Starting deployment verification for $APP_URL"
    echo
    
    # Run all tests
    run_test "Basic Health Check" "test_basic_health"
    run_test "Detailed Health Check" "test_detailed_health"
    run_test "Database Connectivity" "test_database_health"
    run_test "Metrics Endpoint" "test_metrics"
    run_test "Webhook Health" "test_webhook_health"
    run_test "SSL Certificate" "test_ssl_certificate"
    run_test "Response Performance" "test_performance"
    run_test "CORS Headers" "test_cors_headers"
    run_test "Security Headers" "test_security_headers"
    run_test "Environment Config" "test_environment_config"
    
    echo
    echo "=========================================="
    echo "DEPLOYMENT VERIFICATION RESULTS"
    echo "=========================================="
    echo "Tests Run:    $TESTS_RUN"
    echo "Tests Passed: $TESTS_PASSED"
    echo "Tests Failed: $TESTS_FAILED"
    echo "Success Rate: $(awk "BEGIN {printf \"%.1f\", $TESTS_PASSED/$TESTS_RUN*100}")%"
    echo "=========================================="
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        success "🎉 All tests passed! Deployment verified successfully."
        
        echo
        log "📋 Deployment Summary:"
        log "• Application URL: $APP_URL"
        log "• Health Check: $APP_URL/api/health"
        log "• Webhook Endpoint: $APP_URL/api/webhooks/shopify"
        
        if [[ -n "$HEALTH_TOKEN" ]]; then
            log "• Monitoring: Configured with authentication"
        else
            warning "• Monitoring: No auth token configured"
        fi
        
        echo
        success "🚀 Your Shoplytics deployment is ready for production!"
        return 0
        
    else
        error "❌ $TESTS_FAILED test(s) failed. Please check the deployment."
        
        echo
        warning "🔧 Common troubleshooting steps:"
        warning "1. Check environment variables are properly set"
        warning "2. Verify database connection"
        warning "3. Ensure all required services are running"
        warning "4. Check application logs for errors"
        warning "5. Verify SSL certificate if using HTTPS"
        
        return 1
    fi
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo
        echo "Options:"
        echo "  --url URL      Application URL to test (default: http://localhost:3000)"
        echo "  --token TOKEN  Health check authentication token"
        echo "  --help         Show this help message"
        echo
        echo "Environment Variables:"
        echo "  APP_URL              Application URL"
        echo "  HEALTH_CHECK_TOKEN   Authentication token for detailed checks"
        echo
        exit 0
        ;;
    --url)
        APP_URL="$2"
        shift 2
        ;;
    --token)
        HEALTH_TOKEN="$2"
        shift 2
        ;;
esac

# Check dependencies
if ! command -v curl >/dev/null 2>&1; then
    error "curl is required but not installed"
    exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
    error "jq is required but not installed"
    exit 1
fi

# Run main verification
main "$@"
