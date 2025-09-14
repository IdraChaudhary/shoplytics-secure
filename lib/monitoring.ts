import * as Sentry from '@sentry/nextjs';

// Sentry configuration
const SENTRY_CONFIG = {
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENV || process.env.NODE_ENV || 'development',
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACE_SAMPLE_RATE || '0.1'),
  debug: process.env.NODE_ENV === 'development',
  enableTracing: process.env.NODE_ENV === 'production',
  beforeSend(event: Sentry.Event) {
    // Filter out sensitive information
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-api-key'];
    }
    
    // Filter out noisy errors
    if (event.exception?.values?.[0]?.value?.includes('AbortError')) {
      return null;
    }
    
    return event;
  },
};

// Initialize Sentry if DSN is configured
if (SENTRY_CONFIG.dsn) {
  Sentry.init(SENTRY_CONFIG);
}

// Custom error logger
export class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: Array<{
    timestamp: string;
    level: 'error' | 'warn' | 'info';
    message: string;
    context?: any;
    userId?: string;
    tenantId?: string;
  }> = [];

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  // Log error with context
  logError(error: Error | string, context?: any, userId?: string, tenantId?: string) {
    const errorMessage = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;

    // Add to in-memory logs (consider using external service in production)
    this.logs.push({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: errorMessage,
      context: {
        ...context,
        stack,
        userId,
        tenantId,
      },
      userId,
      tenantId,
    });

    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // Send to Sentry if configured
    if (SENTRY_CONFIG.dsn) {
      Sentry.withScope((scope) => {
        if (userId) scope.setUser({ id: userId });
        if (tenantId) scope.setTag('tenantId', tenantId);
        if (context) scope.setContext('additional', context);
        
        if (error instanceof Error) {
          Sentry.captureException(error);
        } else {
          Sentry.captureMessage(error, 'error');
        }
      });
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', {
        message: errorMessage,
        context,
        userId,
        tenantId,
        stack,
      });
    }
  }

  // Log warning
  logWarning(message: string, context?: any, userId?: string, tenantId?: string) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
      userId,
      tenantId,
    });

    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // Send to Sentry as warning
    if (SENTRY_CONFIG.dsn) {
      Sentry.withScope((scope) => {
        if (userId) scope.setUser({ id: userId });
        if (tenantId) scope.setTag('tenantId', tenantId);
        if (context) scope.setContext('additional', context);
        
        Sentry.captureMessage(message, 'warning');
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn('Warning logged:', { message, context, userId, tenantId });
    }
  }

  // Log info
  logInfo(message: string, context?: any, userId?: string, tenantId?: string) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
      userId,
      tenantId,
    });

    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    if (process.env.NODE_ENV === 'development') {
      console.info('Info logged:', { message, context, userId, tenantId });
    }
  }

  // Get recent logs
  getRecentLogs(limit: number = 100) {
    return this.logs.slice(-limit);
  }

  // Get logs by user
  getLogsByUser(userId: string, limit: number = 100) {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(-limit);
  }

  // Get logs by tenant
  getLogsByTenant(tenantId: string, limit: number = 100) {
    return this.logs
      .filter(log => log.tenantId === tenantId)
      .slice(-limit);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Array<{
    timestamp: string;
    operation: string;
    duration: number;
    status: 'success' | 'error';
    metadata?: any;
  }> = [];

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start timing an operation
  startTiming(operation: string): () => void {
    const startTime = Date.now();
    
    return (status: 'success' | 'error' = 'success', metadata?: any) => {
      const duration = Date.now() - startTime;
      
      this.metrics.push({
        timestamp: new Date().toISOString(),
        operation,
        duration,
        status,
        metadata,
      });

      // Keep only last 1000 metrics
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      // Send timing to Sentry
      if (SENTRY_CONFIG.dsn && SENTRY_CONFIG.enableTracing) {
        Sentry.addBreadcrumb({
          category: 'performance',
          message: `${operation} completed in ${duration}ms`,
          level: status === 'success' ? 'info' : 'error',
          data: { duration, operation, status, ...metadata },
        });
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance: ${operation} - ${duration}ms (${status})`);
      }
    };
  }

  // Get performance metrics
  getMetrics(limit: number = 100) {
    return this.metrics.slice(-limit);
  }

  // Get average performance for an operation
  getAveragePerformance(operation: string) {
    const operationMetrics = this.metrics.filter(m => m.operation === operation);
    
    if (operationMetrics.length === 0) return null;
    
    const totalDuration = operationMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    const successfulOperations = operationMetrics.filter(m => m.status === 'success');
    
    return {
      totalOperations: operationMetrics.length,
      successfulOperations: successfulOperations.length,
      failedOperations: operationMetrics.length - successfulOperations.length,
      averageDuration: Math.round(totalDuration / operationMetrics.length),
      successRate: Math.round((successfulOperations.length / operationMetrics.length) * 100),
    };
  }
}

// Express-style error handling middleware for API routes
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const logger = ErrorLogger.getInstance();
    const monitor = PerformanceMonitor.getInstance();
    
    const endTiming = monitor.startTiming('api_request');
    
    try {
      const result = await handler(...args);
      endTiming('success');
      return result;
    } catch (error) {
      endTiming('error', { error: error instanceof Error ? error.message : 'Unknown error' });
      
      // Log the error
      logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          handler: handler.name,
          args: args.length > 0 ? 'present' : 'none',
        }
      );
      
      throw error;
    }
  };
}

// Singleton instances
export const errorLogger = ErrorLogger.getInstance();
export const performanceMonitor = PerformanceMonitor.getInstance();

// Helper functions
export function logError(error: Error | string, context?: any, userId?: string, tenantId?: string) {
  errorLogger.logError(error, context, userId, tenantId);
}

export function logWarning(message: string, context?: any, userId?: string, tenantId?: string) {
  errorLogger.logWarning(message, context, userId, tenantId);
}

export function logInfo(message: string, context?: any, userId?: string, tenantId?: string) {
  errorLogger.logInfo(message, context, userId, tenantId);
}

export function timeOperation(operation: string) {
  return performanceMonitor.startTiming(operation);
}
