# Shoplytics Secure API Documentation

A comprehensive Node.js Express API for multi-tenant Shopify analytics with proper security, validation, and error handling.

## 🚀 Quick Start

### Installation
```bash
# Install dependencies
npm install

# Start the API server in development mode
npm run api:dev

# Or start in production mode
npm run api:build
npm run api:start
```

### Environment Setup
Copy `.env.api` and configure your environment variables:
```bash
cp .env.api .env.local.api
# Edit .env.local.api with your actual configuration
```

## 📋 API Endpoints

### Base URL
- **Development**: `http://localhost:3001`
- **Production**: `https://your-domain.com`

---

## 🔐 Authentication

Most endpoints require authentication via API key in the `X-API-Key` header:

```javascript
headers: {
  'X-API-Key': 'sk_your_api_key_here',
  'Content-Type': 'application/json'
}
```

---

## 📡 Endpoints

### 1. Health Check
**GET** `/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-09-13T19:15:00.000Z",
  "version": "1.0.0",
  "service": "shoplytics-api"
}
```

---

### 2. Shopify Webhook
**POST** `/api/shopify/webhook`

Receive and process Shopify webhook data.

**Headers:**
- `X-Shopify-Topic`: Webhook topic (e.g., "orders/create")
- `X-Shopify-Hmac-Sha256`: HMAC signature for verification
- `X-Tenant-ID`: Your tenant identifier
- `Content-Type`: application/json

**Request Body:**
```json
{
  "id": 123456789,
  "name": "#1001",
  "email": "customer@example.com",
  "created_at": "2024-09-13T10:30:00Z",
  "updated_at": "2024-09-13T10:30:00Z",
  "total_price": "149.99",
  "subtotal_price": "135.99",
  "total_tax": "14.00",
  "currency": "USD",
  "financial_status": "paid",
  "fulfillment_status": "unfulfilled",
  "customer": {
    "id": 987654321,
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1-555-0123",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-09-13T10:30:00Z"
  },
  "line_items": [
    {
      "id": 111111111,
      "product_id": 222222222,
      "variant_id": 333333333,
      "title": "Classic White Shirt",
      "quantity": 2,
      "price": "67.99",
      "sku": "CWS-001",
      "vendor": "Fashion Co"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "data": {
    "orderId": "order-uuid-here",
    "customerId": "customer-uuid-here",
    "processedAt": "2024-09-13T19:15:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/shopify/webhook \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: orders/create" \
  -H "X-Shopify-Hmac-Sha256: mock-hmac-signature" \
  -H "X-Tenant-ID: tenant-123" \
  -d '{"id":123456789,"name":"#1001","total_price":"149.99","financial_status":"paid"}'
```

---

### 3. Analytics Overview
**GET** `/api/analytics/overview/:tenantId`

Get dashboard summary statistics for a tenant.

**Parameters:**
- `tenantId` (path): Your tenant ID
- `from` (query, optional): Start date (YYYY-MM-DD)
- `to` (query, optional): End date (YYYY-MM-DD)

**Headers:**
- `X-API-Key`: Your API key

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 2847,
    "totalOrders": 8956,
    "totalRevenue": 387845.75,
    "averageOrderValue": 43.32,
    "revenueGrowth": 18.7,
    "ordersGrowth": 24.3,
    "customersGrowth": 12.8
  },
  "period": {
    "from": "2024-08-14",
    "to": "2024-09-13",
    "previousPeriod": {
      "from": "2024-07-15T00:00:00.000Z",
      "to": "2024-08-13T23:59:59.999Z"
    }
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3001/api/analytics/overview/123?from=2024-08-01&to=2024-09-01" \
  -H "X-API-Key: sk_your_api_key_here"
```

---

### 4. Orders Analytics
**GET** `/api/analytics/orders/:tenantId`

Get orders data with date filtering and grouping.

**Parameters:**
- `tenantId` (path): Your tenant ID
- `from` (query, optional): Start date (YYYY-MM-DD)
- `to` (query, optional): End date (YYYY-MM-DD)
- `groupBy` (query, optional): Group by "day", "week", or "month" (default: "day")
- `limit` (query, optional): Maximum records to return (default: 100)

**Headers:**
- `X-API-Key`: Your API key

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-09-01",
      "orders": 89,
      "revenue": 3824.50
    },
    {
      "date": "2024-09-02", 
      "orders": 112,
      "revenue": 4867.20
    }
  ],
  "meta": {
    "groupBy": "day",
    "period": {
      "from": "2024-09-01",
      "to": "2024-09-13"
    },
    "totalRecords": 13
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3001/api/analytics/orders/123?from=2024-09-01&to=2024-09-13&groupBy=day" \
  -H "X-API-Key: sk_your_api_key_here"
```

---

### 5. Top Customers
**GET** `/api/analytics/customers/top/:tenantId`

Get top customers by spending.

**Parameters:**
- `tenantId` (path): Your tenant ID
- `limit` (query, optional): Number of customers to return (default: 5, max: 50)

**Headers:**
- `X-API-Key`: Your API key

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "customer-uuid-1",
      "name": "Emily Rodriguez",
      "email": "emily.rodriguez@shopaholic.com",
      "totalSpent": 8973.80,
      "ordersCount": 47,
      "lastOrderDate": "2024-09-12T16:30:00.000Z",
      "segment": "high-value",
      "lifetimeValue": 8973.80
    },
    {
      "id": "customer-uuid-2",
      "name": "Marcus Thompson", 
      "email": "marcus.thompson@fashionista.com",
      "totalSpent": 6892.45,
      "ordersCount": 32,
      "lastOrderDate": "2024-09-13T11:15:00.000Z",
      "segment": "regular",
      "lifetimeValue": 6892.45
    }
  ],
  "meta": {
    "totalRecords": 5,
    "limit": 5
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3001/api/analytics/customers/top/123?limit=10" \
  -H "X-API-Key: sk_your_api_key_here"
```

---

### 6. Tenant Registration
**POST** `/api/tenant/register`

Register a new tenant and generate API credentials.

**Request Body:**
```json
{
  "name": "My Fashion Store",
  "email": "owner@myfashionstore.com",
  "shopifyStoreUrl": "myfashionstore.myshopify.com",
  "shopifyAccessToken": "shpat_your_access_token_here",
  "webhookSecret": "optional_custom_webhook_secret",
  "planType": "professional"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenant": {
      "id": "tenant-uuid-here",
      "name": "My Fashion Store",
      "email": "owner@myfashionstore.com", 
      "shopifyStoreUrl": "myfashionstore.myshopify.com",
      "apiKey": "sk_1234567890abcdef1234567890abcdef12345678",
      "webhookSecret": "webhook-secret-hash-here",
      "planType": "professional",
      "createdAt": "2024-09-13T19:15:00.000Z"
    },
    "nextSteps": [
      "Configure your Shopify webhooks to point to our endpoint",
      "Test webhook integration with a sample order", 
      "Start monitoring your analytics dashboard"
    ],
    "webhookEndpoint": "http://localhost:3001/api/shopify/webhook",
    "documentation": "http://localhost:3001/docs"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/tenant/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Fashion Store",
    "email": "owner@myfashionstore.com",
    "shopifyStoreUrl": "myfashionstore.myshopify.com",
    "shopifyAccessToken": "shpat_your_access_token_here",
    "planType": "professional"
  }'
```

---

## 🛡️ Security Features

### Rate Limiting
- **General endpoints**: 100 requests per 15 minutes per IP
- **Webhook endpoint**: 1000 requests per 5 minutes per IP

### Security Headers
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`

### Data Protection
- All customer PII is encrypted at rest
- API keys are securely generated using crypto.randomBytes
- Webhook HMAC verification (in production)
- Tenant data isolation

---

## 🚨 Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message",
  "details": "Additional error details (development only)"
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid API key)
- `403`: Forbidden (access denied)
- `404`: Not Found
- `409`: Conflict (resource already exists)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

---

## 📝 Logging

The API uses Winston for structured logging:

### Log Levels
- `error`: Error conditions
- `warn`: Warning conditions
- `info`: General information
- `debug`: Debug-level messages

### Log Files
- `logs/error.log`: Error-level logs only
- `logs/combined.log`: All logs
- Console: Development output

---

## 🧪 Testing

### Test with Sample Data
```javascript
// Test webhook endpoint
const webhookData = {
  id: 123456789,
  name: "#TEST-001",
  total_price: "99.99",
  financial_status: "paid",
  customer: {
    id: 987654321,
    email: "test@example.com",
    first_name: "Test",
    last_name: "User",
    created_at: "2024-09-13T10:00:00Z",
    updated_at: "2024-09-13T10:00:00Z"
  }
};

fetch('http://localhost:3001/api/shopify/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Topic': 'orders/create',
    'X-Shopify-Hmac-Sha256': 'mock-signature',
    'X-Tenant-ID': 'test-tenant'
  },
  body: JSON.stringify(webhookData)
});
```

---

## 🔄 Multi-tenant Architecture

Each tenant is completely isolated:
- Separate API keys
- Encrypted data storage
- Row-level security by tenant ID
- Individual webhook secrets
- Separate analytics views

---

## 📊 Monitoring

### Health Check
Monitor the `/health` endpoint for service availability.

### Metrics Available
- Request counts by endpoint
- Response times
- Error rates
- Database connection status
- Memory and CPU usage (via logs)

---

## 🚀 Production Deployment

### Environment Variables
Make sure to set these in production:
```bash
NODE_ENV=production
API_PORT=3001
DATABASE_URL=your_production_db_url
DEMO_ENCRYPTION_KEY=your_production_encryption_key
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Security Checklist
- [ ] Change all default secrets
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up log rotation
- [ ] Configure database backups
- [ ] Enable webhook HMAC verification
- [ ] Set up monitoring and alerts

---

## 📞 Support

For questions or issues:
- Check the logs at `logs/combined.log`
- Review error responses for details
- Ensure proper API key authentication
- Verify tenant permissions

---

## 📄 License

This API is part of the Shoplytics Secure platform - a privacy-first, multi-tenant Shopify analytics solution.
