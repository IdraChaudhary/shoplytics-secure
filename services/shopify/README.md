# Shopify Data Ingestion Service

A comprehensive, production-ready Shopify data ingestion system for multi-tenant SaaS applications. This service provides real-time webhook handling, scheduled batch imports, rate limiting, error handling, and data transformation capabilities.

## Features

✅ **Multi-tenant Architecture**: Support for multiple Shopify stores with isolated data
✅ **Real-time Webhooks**: Process Shopify webhooks for immediate data synchronization
✅ **Scheduled Sync Jobs**: Automated periodic data imports using node-cron
✅ **Rate Limiting**: Intelligent Shopify API rate limit monitoring and handling
✅ **Batch Processing**: Efficient batch imports with concurrency control
✅ **Data Transformation**: Map Shopify data to your Prisma schema with encryption
✅ **Error Handling**: Comprehensive error handling with retry logic
✅ **Health Monitoring**: Real-time health checks and monitoring
✅ **Logging**: Detailed logging with Winston

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Shopify Ingestion Service                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐              │
│  │   Client    │  │   Import     │  │   Webhook   │              │
│  │   Manager   │  │   Service    │  │   Handler   │              │
│  └─────────────┘  └──────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐              │
│  │ Scheduler   │  │ Transformers │  │   Logger    │              │
│  │  Service    │  │              │  │             │              │
│  └─────────────┘  └──────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│                        Prisma ORM                               │
├─────────────────────────────────────────────────────────────────┤
│                       PostgreSQL                                │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Install Dependencies

The required dependencies have been added to your `package.json`:

```bash
npm install
```

### 2. Environment Configuration

Add the following environment variables:

```env
# Shopify API Configuration
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
HOST_NAME=your_app_domain.com

# Encryption for PII data
ENCRYPTION_KEY=your_32_character_encryption_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/shoplytics
```

### 3. Initialize the Service

```typescript
import { PrismaClient } from '@prisma/client';
import { createIngestionService } from './services/shopify/ingestion';

const prisma = new PrismaClient();

// Create ingestion service with default configuration
const shopifyService = createIngestionService(prisma);

// Initialize the service
await shopifyService.initialize();
```

### 4. Setup Express Routes

```typescript
import express from 'express';

const app = express();

// Setup webhook endpoints
shopifyService.setupWebhookEndpoints(app);

// Add authentication middleware
const authMiddleware = shopifyService.createAuthMiddleware();

// Sync endpoints
app.post('/api/shopify/sync/:tenantId', authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { dataType = 'all', ...options } = req.body;
    
    const result = await shopifyService.importData(tenantId, dataType, options);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Status endpoint
app.get('/api/shopify/status', authMiddleware, async (req, res) => {
  try {
    const status = await shopifyService.getSyncStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

## Core Components

### 1. Shopify Client (`client.ts`)

Handles communication with Shopify Admin API:

```typescript
import { createShopifyClient } from './services/shopify/client';

const client = createShopifyClient({
  shopDomain: 'mystore.myshopify.com',
  accessToken: 'shpat_xxxxx'
});

// Fetch data with automatic pagination
const customers = await client.fetchAllPages('/customers.json');

// Check rate limits
if (client.isRateLimited()) {
  const waitTime = client.getWaitTime();
  await new Promise(resolve => setTimeout(resolve, waitTime));
}
```

### 2. Data Transformers (`transformers.ts`)

Transform Shopify data to your Prisma schema:

```typescript
import { ShopifyTransformer } from './services/shopify/transformers';

// Transform a single customer
const transformedCustomer = ShopifyTransformer.transformCustomer(
  shopifyCustomerData, 
  tenantId
);

// Transform orders with line items and events
const { orders, lineItems, events } = ShopifyTransformer.transformOrdersBatch(
  shopifyOrders, 
  tenantId
);
```

### 3. Import Service (`import.ts`)

Handle batch imports with error handling:

```typescript
import { createImportService } from './services/shopify/import';

const importService = createImportService(prisma, shopifyClient, tenantId);

// Import with custom options
const result = await importService.importCustomers({
  batchSize: 100,
  concurrency: 3,
  skipExisting: false,
  dateRange: {
    from: '2024-01-01T00:00:00Z',
    to: '2024-12-31T23:59:59Z'
  }
});

console.log(`Imported: ${result.imported}, Errors: ${result.errors}`);
```

### 4. Webhook Handler (`webhooks.ts`)

Process real-time Shopify webhooks:

```typescript
import { createWebhookService } from './services/shopify/webhooks';

const webhookService = createWebhookService(prisma);

// Webhooks are automatically processed for these topics:
// - customers/create, customers/update, customers/delete
// - products/create, products/update, products/delete
// - orders/create, orders/updated, orders/paid, orders/cancelled, orders/fulfilled, orders/delete
```

### 5. Scheduler (`scheduler.ts`)

Automated periodic sync jobs:

```typescript
import { createSchedulerService } from './services/shopify/scheduler';

const scheduler = createSchedulerService(prisma, clientManager);

// Start scheduler with default configuration
await scheduler.startScheduler();

// Manage jobs
scheduler.enableJob('customers-sync-tenant123');
scheduler.disableJob('products-sync-tenant123');

// Get status
const status = scheduler.getStatus();
console.log(`Running ${status.runningJobs} of ${status.totalJobs} jobs`);
```

## Configuration

### Sync Job Configuration

```typescript
const syncConfig = {
  customers: {
    enabled: true,
    schedule: '0 */6 * * *', // Every 6 hours
    options: {
      batchSize: 100,
      concurrency: 2,
      skipExisting: false
    }
  },
  products: {
    enabled: true,
    schedule: '0 2 * * *', // Daily at 2 AM
    options: {
      batchSize: 75,
      concurrency: 2
    }
  },
  orders: {
    enabled: true,
    schedule: '*/30 * * * *', // Every 30 minutes
    options: {
      batchSize: 50,
      concurrency: 3,
      dateRange: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString()
      }
    }
  },
  fullSync: {
    enabled: true,
    schedule: '0 1 * * 0', // Weekly on Sunday at 1 AM
    options: {
      batchSize: 100,
      concurrency: 2
    }
  }
};
```

### Import Options

```typescript
const importOptions = {
  batchSize: 100,         // Items per batch
  concurrency: 3,         // Parallel processing limit
  skipExisting: false,    // Skip existing records
  dryRun: false,         // Don't actually import
  dateRange: {           // Filter by date range
    from: '2024-01-01T00:00:00Z',
    to: '2024-12-31T23:59:59Z'
  },
  retryOptions: {        // Retry configuration
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 5000
  }
};
```

## Multi-Tenant Usage

### Adding a New Tenant

```typescript
// Add Shopify integration for a tenant
await shopifyService.addTenant('tenant-123', {
  shopDomain: 'newstore.myshopify.com',
  accessToken: 'shpat_xxxxx'
});

// The service automatically:
// ✅ Tests the credentials
// ✅ Creates a Shopify client
// ✅ Schedules sync jobs
// ✅ Updates the tenant record
```

### Removing a Tenant

```typescript
// Remove Shopify integration
await shopifyService.removeTenant('tenant-123');

// The service automatically:
// ✅ Removes the Shopify client
// ✅ Disables scheduled jobs
// ✅ Updates the tenant record
```

### Manual Data Sync

```typescript
// Sync specific data types
await shopifyService.importData('tenant-123', 'customers');
await shopifyService.importData('tenant-123', 'products');
await shopifyService.importData('tenant-123', 'orders');

// Full sync with custom options
const result = await shopifyService.importData('tenant-123', 'all', {
  batchSize: 50,
  skipExisting: true
});
```

## Monitoring & Health Checks

### Service Health Status

```typescript
const health = shopifyService.getHealthStatus();
/*
{
  status: 'healthy',
  services: {
    clients: 5,
    scheduler: {
      enabled: true,
      totalJobs: 20,
      runningJobs: 2
    },
    webhooks: {
      enabled: true
    }
  },
  uptime: 86400
}
*/
```

### Detailed Statistics

```typescript
const stats = await shopifyService.getStatistics();
/*
{
  totalTenants: 10,
  activeTenants: 8,
  totalRecords: {
    customers: 15000,
    products: 5000,
    orders: 25000
  },
  syncJobs: { ... },
  webhookStats: { ... }
}
*/
```

### Tenant Sync Status

```typescript
const status = await shopifyService.getSyncStatus();
/*
[
  {
    tenantId: 'tenant-123',
    tenantName: 'Acme Store',
    shopDomain: 'acme.myshopify.com',
    isActive: true,
    lastSync: '2024-01-15T10:30:00Z',
    syncStatus: 'idle',
    stats: {
      customers: 1500,
      products: 500,
      orders: 2500
    },
    healthStatus: true,
    rateLimitStatus: {
      callsMade: 20,
      bucketSize: 40,
      isLimited: false
    }
  }
]
*/
```

## Error Handling

The service includes comprehensive error handling:

### Retry Logic

```typescript
// Automatic retries with exponential backoff
const retryOptions = {
  retries: 3,
  factor: 2,        // Multiply delay by 2 each retry
  minTimeout: 1000, // Start with 1 second
  maxTimeout: 5000  // Max 5 seconds delay
};
```

### Rate Limit Handling

```typescript
// Automatic rate limit detection and waiting
if (client.isRateLimited()) {
  const waitTime = client.getWaitTime();
  logger.warn(`Rate limited, waiting ${waitTime}ms`);
  await sleep(waitTime);
}
```

### Error Logging

All errors are logged with detailed context:

```typescript
logger.error('Import failed', {
  tenantId: 'tenant-123',
  dataType: 'orders',
  batchSize: 100,
  error: error.message,
  stack: error.stack
});
```

## Data Security

### PII Encryption

Customer personal data is automatically encrypted:

```typescript
// Encrypted fields:
// - email
// - firstName
// - lastName  
// - phone
// - addresses

const customer = ShopifyTransformer.transformCustomer(shopifyData, tenantId);
// customer.email is now encrypted
```

### Multi-tenant Isolation

All data is isolated by `tenantId`:

```typescript
// All database queries include tenantId filter
const customers = await prisma.customer.findMany({
  where: { tenantId: 'tenant-123' }
});
```

## Production Deployment

### Logging Setup

```typescript
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    ...(process.env.NODE_ENV !== 'production' 
      ? [new winston.transports.Console()] 
      : [])
  ]
});
```

### Graceful Shutdown

```typescript
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await shopifyService.shutdown();
  await prisma.$disconnect();
  process.exit(0);
});
```

### Environment Configuration

```env
# Production settings
NODE_ENV=production
LOG_LEVEL=info

# Rate limiting
SHOPIFY_API_CALL_LIMIT=40
SHOPIFY_LEAK_RATE=2

# Batch sizes (tune based on your needs)
DEFAULT_BATCH_SIZE=100
DEFAULT_CONCURRENCY=3
```

## Testing

### Manual Testing

```typescript
// Test Shopify connection
const client = createShopifyClient(credentials);
const isHealthy = await client.healthCheck();
console.log('Shopify connection:', isHealthy ? 'OK' : 'Failed');

// Test data import
const result = await shopifyService.importData('test-tenant', 'customers', {
  dryRun: true,
  batchSize: 10
});
console.log('Import test result:', result);
```

### Webhook Testing

Use tools like ngrok for local webhook testing:

```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000

# Configure webhook URL in Shopify:
# https://abc123.ngrok.io/api/webhooks/shopify
```

## Troubleshooting

### Common Issues

1. **Rate Limiting**: Reduce batch size and concurrency
2. **Webhook Signature Validation**: Check webhook secret configuration
3. **Memory Issues**: Reduce batch size for large datasets
4. **Connection Timeouts**: Increase axios timeout in client configuration

### Debug Logging

```typescript
// Enable debug logging
const logger = winston.createLogger({
  level: 'debug',
  // ... other config
});

// Or set environment variable
process.env.LOG_LEVEL = 'debug';
```

## API Reference

### ShopifyIngestionService Methods

- `initialize()`: Initialize the service
- `addTenant(tenantId, credentials, config?)`: Add Shopify integration
- `removeTenant(tenantId)`: Remove Shopify integration  
- `importData(tenantId, dataType, options?)`: Manual data import
- `getSyncStatus()`: Get sync status for all tenants
- `getHealthStatus()`: Get service health status
- `getStatistics()`: Get detailed statistics
- `shutdown()`: Graceful shutdown

### Import Service Methods

- `importCustomers(options?)`: Import customers
- `importProducts(options?)`: Import products
- `importOrders(options?)`: Import orders
- `importAll(options?)`: Import all data types
- `getImportStats()`: Get import statistics

### Scheduler Methods

- `startScheduler()`: Start all scheduled jobs
- `stopScheduler()`: Stop all scheduled jobs
- `enableJob(jobId)`: Enable a specific job
- `disableJob(jobId)`: Disable a specific job
- `getStatus()`: Get scheduler status

This service provides everything you need for robust, production-ready Shopify data ingestion! 🚀
