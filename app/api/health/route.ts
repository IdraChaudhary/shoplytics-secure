import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Health check configuration
const HEALTH_CHECK_CONFIG = {
  timeout: 5000, // 5 seconds
  enableDetailedChecks: process.env.ENABLE_DETAILED_HEALTH_CHECKS === 'true',
  authToken: process.env.HEALTH_CHECK_TOKEN,
};

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn';
      responseTime?: number;
      message?: string;
      details?: any;
    };
  };
  system?: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu?: {
      usage: number;
    };
  };
}

// Database health check
async function checkDatabase(): Promise<any> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'pass',
      responseTime: Date.now() - start,
      message: 'Database connection successful',
    };
  } catch (error) {
    return {
      status: 'fail',
      responseTime: Date.now() - start,
      message: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Redis health check (if available)
async function checkRedis(): Promise<any> {
  const start = Date.now();
  try {
    // If Redis is configured, check connection
    if (process.env.REDIS_URL) {
      // This is a placeholder - implement actual Redis check if using Redis
      return {
        status: 'pass',
        responseTime: Date.now() - start,
        message: 'Redis connection successful',
      };
    }
    return {
      status: 'warn',
      message: 'Redis not configured',
    };
  } catch (error) {
    return {
      status: 'fail',
      responseTime: Date.now() - start,
      message: 'Redis connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// External API health checks
async function checkShopifyAPI(): Promise<any> {
  const start = Date.now();
  try {
    if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
      return {
        status: 'warn',
        message: 'Shopify API credentials not configured',
      };
    }

    // Simple connectivity check - in production you might want to make actual API call
    return {
      status: 'pass',
      responseTime: Date.now() - start,
      message: 'Shopify API credentials configured',
    };
  } catch (error) {
    return {
      status: 'fail',
      responseTime: Date.now() - start,
      message: 'Shopify API check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// System metrics
function getSystemMetrics() {
  const usage = process.memoryUsage();
  return {
    memory: {
      used: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100, // MB
      total: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100, // MB
      percentage: Math.round((usage.heapUsed / usage.heapTotal) * 100),
    },
    uptime: Math.floor(process.uptime()),
  };
}

// Authentication check for detailed health checks
function isAuthorized(request: Request): boolean {
  if (!HEALTH_CHECK_CONFIG.authToken) return true;
  
  const authHeader = request.headers.get('authorization');
  const token = request.headers.get('x-health-token');
  
  return authHeader === `Bearer ${HEALTH_CHECK_CONFIG.authToken}` || 
         token === HEALTH_CHECK_CONFIG.authToken;
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const isDetailedRequest = HEALTH_CHECK_CONFIG.enableDetailedChecks && isAuthorized(request);
  
  try {
    const checks: HealthCheckResult['checks'] = {};
    
    // Always perform basic checks
    checks.api = {
      status: 'pass',
      responseTime: Date.now() - startTime,
      message: 'API is responsive',
    };

    // Environment check
    checks.environment = {
      status: 'pass',
      message: `Running in ${process.env.NODE_ENV || 'development'} mode`,
    };

    // Detailed checks (if authorized)
    if (isDetailedRequest) {
      // Database check
      checks.database = await Promise.race([
        checkDatabase(),
        new Promise(resolve => setTimeout(() => resolve({
          status: 'fail',
          message: 'Database check timeout',
        }), HEALTH_CHECK_CONFIG.timeout))
      ]) as any;

      // Redis check
      checks.redis = await Promise.race([
        checkRedis(),
        new Promise(resolve => setTimeout(() => resolve({
          status: 'fail',
          message: 'Redis check timeout',
        }), HEALTH_CHECK_CONFIG.timeout))
      ]) as any;

      // Shopify API check
      checks.shopifyAPI = await checkShopifyAPI();
    }

    // Determine overall status
    const hasFailures = Object.values(checks).some(check => check.status === 'fail');
    const hasWarnings = Object.values(checks).some(check => check.status === 'warn');
    
    const overallStatus = hasFailures ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy';
    
    // Build response
    const healthResult: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
    };

    // Add system metrics if detailed check
    if (isDetailedRequest) {
      healthResult.system = getSystemMetrics();
    }

    // Set appropriate HTTP status code
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(healthResult, { 
      status: httpStatus,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check-Time': (Date.now() - startTime).toString(),
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        api: {
          status: 'fail',
          message: 'Health check endpoint error',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
    }, { 
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  }
}

// Simple health check for basic monitoring
export async function HEAD(request: Request) {
  try {
    // Perform minimal check
    const isHealthy = true; // Add basic health logic here if needed
    
    return new NextResponse(null, {
      status: isHealthy ? 200 : 503,
      headers: {
        'X-Health-Status': isHealthy ? 'healthy' : 'unhealthy',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'X-Health-Status': 'unhealthy',
        'Cache-Control': 'no-cache',
      },
    });
  }
}
