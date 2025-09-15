import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface SystemMetrics {
  timestamp: string;
  system: {
    memory: {
      used: number;
      free: number;
      total: number;
      percentage: number;
    };
    uptime: number;
    nodeVersion: string;
    platform: string;
    pid: number;
  };
  database: {
    connectionCount?: number;
    activeConnections?: number;
    responseTime: number;
  };
  application: {
    environment: string;
    version: string;
    startTime: string;
  };
  performance?: {
    requests: {
      total: number;
      successful: number;
      failed: number;
      averageResponseTime: number;
    };
  };
}

// In-memory metrics storage (in production, use Redis or proper metrics store)
const metricsStore = {
  requests: {
    total: 0,
    successful: 0,
    failed: 0,
    totalResponseTime: 0,
  },
  startTime: Date.now(),
};

// Update request metrics
export function updateMetrics(success: boolean, responseTime: number) {
  metricsStore.requests.total++;
  metricsStore.requests.totalResponseTime += responseTime;
  
  if (success) {
    metricsStore.requests.successful++;
  } else {
    metricsStore.requests.failed++;
  }
}

// Get database metrics
async function getDatabaseMetrics() {
  const start = Date.now();
  
  try {
    // Test database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    return {
      responseTime: Date.now() - start,
      connectionCount: 1, // In production, implement actual connection counting
      activeConnections: 1,
    };
  } catch (error) {
    return {
      responseTime: Date.now() - start,
      error: 'Database connection failed',
    };
  }
}

// Get system metrics
function getSystemMetrics() {
  const usage = process.memoryUsage();
  
  return {
    memory: {
      used: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100, // MB
      free: Math.round((usage.heapTotal - usage.heapUsed) / 1024 / 1024 * 100) / 100, // MB
      total: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100, // MB
      percentage: Math.round((usage.heapUsed / usage.heapTotal) * 100),
    },
    uptime: Math.floor(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
    pid: process.pid,
  };
}

// Authentication middleware
function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const token = request.headers.get('x-metrics-token');
  const expectedToken = process.env.METRICS_TOKEN || process.env.HEALTH_CHECK_TOKEN;
  
  if (!expectedToken) return true; // Allow if no token configured
  
  return authHeader === `Bearer ${expectedToken}` || token === expectedToken;
}

export async function GET(request: Request) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const startTime = Date.now();

  try {
    // Get database metrics
    const databaseMetrics = await getDatabaseMetrics();
    
    // Build metrics response
    const metrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      system: getSystemMetrics(),
      database: databaseMetrics,
      application: {
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        startTime: new Date(metricsStore.startTime).toISOString(),
      },
      performance: {
        requests: {
          total: metricsStore.requests.total,
          successful: metricsStore.requests.successful,
          failed: metricsStore.requests.failed,
          averageResponseTime: metricsStore.requests.total > 0 
            ? Math.round(metricsStore.requests.totalResponseTime / metricsStore.requests.total)
            : 0,
        },
      },
    };

    // Update metrics for this request
    const responseTime = Date.now() - startTime;
    updateMetrics(true, responseTime);

    return NextResponse.json(metrics, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': responseTime.toString(),
      },
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    updateMetrics(false, responseTime);

    console.error('Metrics collection failed:', error);

    return NextResponse.json(
      {
        error: 'Metrics collection failed',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Prometheus-compatible metrics endpoint
export async function POST(request: Request) {
  // Check authorization
  if (!isAuthorized(request)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const systemMetrics = getSystemMetrics();
    const databaseMetrics = await getDatabaseMetrics();

    // Generate Prometheus-compatible metrics
    const prometheusMetrics = `
# HELP shoplytics_memory_usage_bytes Memory usage in bytes
# TYPE shoplytics_memory_usage_bytes gauge
shoplytics_memory_usage_bytes{type="heap_used"} ${systemMetrics.memory.used * 1024 * 1024}
shoplytics_memory_usage_bytes{type="heap_total"} ${systemMetrics.memory.total * 1024 * 1024}

# HELP shoplytics_uptime_seconds Application uptime in seconds
# TYPE shoplytics_uptime_seconds counter
shoplytics_uptime_seconds ${systemMetrics.uptime}

# HELP shoplytics_database_response_time_ms Database response time in milliseconds
# TYPE shoplytics_database_response_time_ms gauge
shoplytics_database_response_time_ms ${databaseMetrics.responseTime}

# HELP shoplytics_http_requests_total Total HTTP requests
# TYPE shoplytics_http_requests_total counter
shoplytics_http_requests_total{status="success"} ${metricsStore.requests.successful}
shoplytics_http_requests_total{status="error"} ${metricsStore.requests.failed}

# HELP shoplytics_http_request_duration_ms Average HTTP request duration
# TYPE shoplytics_http_request_duration_ms gauge
shoplytics_http_request_duration_ms ${metricsStore.requests.total > 0 
      ? Math.round(metricsStore.requests.totalResponseTime / metricsStore.requests.total)
      : 0}
    `.trim();

    return new NextResponse(prometheusMetrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Prometheus metrics generation failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
