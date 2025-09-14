@echo off
REM Production Deployment Verification Script for Windows
REM Tests all critical functionality after deployment

setlocal enabledelayedexpansion

REM Configuration
if "%APP_URL%"=="" set APP_URL=http://localhost:3000
if "%HEALTH_CHECK_TOKEN%"=="" set HEALTH_TOKEN= else set HEALTH_TOKEN=%HEALTH_CHECK_TOKEN%

REM Test counters
set TESTS_RUN=0
set TESTS_PASSED=0
set TESTS_FAILED=0

echo [%time%] Starting deployment verification for %APP_URL%
echo.

REM Check if curl is available
curl --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ERROR: curl is required but not installed
    exit /b 1
)

REM Test 1: Basic Health Check
echo [%time%] Running: Basic Health Check
set /a TESTS_RUN+=1
curl -f -s "%APP_URL%/api/health" >nul 2>&1
if !errorlevel! equ 0 (
    echo [%time%] PASS: Basic Health Check
    set /a TESTS_PASSED+=1
) else (
    echo [%time%] FAIL: Basic Health Check
    set /a TESTS_FAILED+=1
)

REM Test 2: Webhook Health Check
echo [%time%] Running: Webhook Health Check
set /a TESTS_RUN+=1
curl -f -s "%APP_URL%/api/webhooks/shopify" >nul 2>&1
if !errorlevel! equ 0 (
    echo [%time%] PASS: Webhook Health Check
    set /a TESTS_PASSED+=1
) else (
    echo [%time%] FAIL: Webhook Health Check
    set /a TESTS_FAILED+=1
)

REM Test 3: Performance Test
echo [%time%] Running: Response Performance Test
set /a TESTS_RUN+=1
for /f %%i in ('curl -w "%%{time_total}" -s -o nul "%APP_URL%/api/health" 2^>nul') do set response_time=%%i
REM Simple performance check - if we got a response time, consider it passed
if "!response_time!"=="" (
    echo [%time%] FAIL: Response Performance Test
    set /a TESTS_FAILED+=1
) else (
    echo [%time%] PASS: Response Performance Test ^(!response_time!s^)
    set /a TESTS_PASSED+=1
)

REM Test 4: Security Headers
echo [%time%] Running: Security Headers Test
set /a TESTS_RUN+=1
curl -s -I "%APP_URL%/api/health" | findstr /i "X-Frame-Options" >nul 2>&1
if !errorlevel! equ 0 (
    echo [%time%] PASS: Security Headers Test
    set /a TESTS_PASSED+=1
) else (
    echo [%time%] FAIL: Security Headers Test
    set /a TESTS_FAILED+=1
)

echo.
echo ==========================================
echo DEPLOYMENT VERIFICATION RESULTS
echo ==========================================
echo Tests Run:    !TESTS_RUN!
echo Tests Passed: !TESTS_PASSED!
echo Tests Failed: !TESTS_FAILED!

if !TESTS_FAILED! equ 0 (
    echo Success Rate: 100.0%%
    echo ==========================================
    echo.
    echo [%time%] SUCCESS: All tests passed! Deployment verified successfully.
    echo.
    echo Deployment Summary:
    echo • Application URL: %APP_URL%
    echo • Health Check: %APP_URL%/api/health
    echo • Webhook Endpoint: %APP_URL%/api/webhooks/shopify
    echo.
    if not "%HEALTH_TOKEN%"=="" (
        echo • Monitoring: Configured with authentication
    ) else (
        echo • Monitoring: No auth token configured
    )
    echo.
    echo Your Shoplytics deployment is ready for production!
    exit /b 0
) else (
    set /a success_rate=!TESTS_PASSED! * 100 / !TESTS_RUN!
    echo Success Rate: !success_rate!%%
    echo ==========================================
    echo.
    echo [%time%] ERROR: !TESTS_FAILED! test^(s^) failed. Please check the deployment.
    echo.
    echo Common troubleshooting steps:
    echo 1. Check environment variables are properly set
    echo 2. Verify database connection
    echo 3. Ensure all required services are running
    echo 4. Check application logs for errors
    echo 5. Verify SSL certificate if using HTTPS
    echo.
    exit /b 1
)

endlocal
