# Shoplytics Production Deployment Guide

This guide provides comprehensive instructions for deploying Shoplytics to production environments including Vercel, Railway, and Docker-based deployments.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Shopify Partner account with API credentials
- SSL certificate (provided by hosting platforms)

### Environment Variables

Copy `.env.example` to `.env.production` and configure all required variables:

```bash
cp .env.example .env.production
```

**Critical Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Shopify API
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret  
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

# Security
JWT_SECRET=your_secure_jwt_secret
ENCRYPTION_KEY=your_32_character_encryption_key

# Monitoring (Optional but recommended)
SENTRY_DSN=your_sentry_dsn
HEALTH_CHECK_TOKEN=your_health_check_token
```

## 🌐 Platform-Specific Deployments

### Vercel Deployment

1. **Connect Repository**
   ```bash
   npx vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - Set `NODE_ENV=production`

3. **Database Setup**
   ```bash
   # Connect external PostgreSQL (Supabase, Railway, etc.)
   vercel env add DATABASE_URL
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

5. **Verify Deployment**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

### Railway Deployment

1. **Connect Repository**
   ```bash
   npm install -g @railway/cli
   railway login
   railway link
   ```

2. **Add PostgreSQL Service**
   ```bash
   railway add postgresql
   ```

3. **Configure Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set SHOPIFY_API_KEY=your_api_key
   # ... add all other variables
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Setup Custom Domain** (Optional)
   ```bash
   railway domain add your-domain.com
   ```

### Docker Deployment

1. **Build Image**
   ```bash
   docker build -t shoplytics-secure .
   ```

2. **Run with Docker Compose**
   ```bash
   # Configure environment in .env file
   docker-compose up -d
   ```

3. **Scale Services** (Optional)
   ```bash
   docker-compose up -d --scale app=3
   ```

## 🔒 Security Configuration

### SSL/HTTPS Setup

**Vercel/Railway:** SSL automatically provided and configured.

**Custom Deployment:** Use Let's Encrypt or your SSL provider:

```bash
# Example nginx configuration
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/ssl/certs/your_cert.pem;
    ssl_certificate_key /etc/ssl/private/your_key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_ssl_verify on;
    }
}
```

### Webhook Security

Webhooks automatically validate:
- HMAC-SHA256 signatures
- HTTPS enforcement in production
- Shop domain validation
- Rate limiting and timeout protection

## 📊 Database Setup

### Automatic Setup (Recommended)

The deployment script automatically handles:
- Database migrations
- Index creation
- Permission setup
- Performance optimization

### Manual Database Setup

If needed, run manually:

```bash
# Apply Prisma schema
npx prisma db push

# Run custom initialization
psql $DATABASE_URL -f scripts/init-db.sql

# Verify setup
psql $DATABASE_URL -c "SELECT version();"
```

### Database Performance

Production optimizations included:
- Connection pooling (configured in Prisma)
- Performance indexes
- Query optimization
- Automatic cleanup jobs

## 🔍 Monitoring Setup

### Health Checks

- **Endpoint:** `/api/health`
- **Detailed:** `/api/health` with `Authorization: Bearer your_token`
- **Metrics:** `/api/metrics`

### Error Tracking

1. **Sentry Integration**
   ```bash
   # Set environment variable
   SENTRY_DSN=https://your-dsn@sentry.io/project-id
   ```

2. **Custom Logging**
   ```bash
   # View logs
   curl -H "Authorization: Bearer your_token" \
        "https://your-app.com/api/logs?type=logs&level=error"
   ```

## 📈 Performance Optimization

### CDN Configuration

**Vercel:** Automatic global CDN
**Railway:** Configure with Cloudflare
**Custom:** Setup CloudFront or similar

### Caching Strategy

- Static assets: 1 year cache
- API responses: Configurable per endpoint
- Database queries: Redis caching (optional)

### Resource Limits

```bash
# Vercel Function Configuration
export const config = {
  maxDuration: 30,
  memory: 1024
}

# Railway Resource Allocation
railway variables set RAILWAY_DEPLOYMENT_MEMORY=1024
```

## 🛠 Maintenance

### Database Maintenance

```bash
# Clean up old sessions (automated via cron)
psql $DATABASE_URL -c "SELECT cleanup_old_sessions();"

# View performance stats
psql $DATABASE_URL -c "SELECT * FROM performance_stats;"
```

### Log Management

```bash
# Export logs
curl -X POST -H "Authorization: Bearer your_token" \
     -H "Content-Type: application/json" \
     -d '{"format":"csv","type":"logs"}' \
     "https://your-app.com/api/logs"

# Clear old logs
curl -X DELETE -H "Authorization: Bearer your_token" \
     "https://your-app.com/api/logs?type=logs"
```

### Update Deployment

```bash
# Vercel
vercel --prod

# Railway
railway up

# Docker
docker-compose down
docker-compose pull
docker-compose up -d
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Test connection
   psql $DATABASE_URL -c "SELECT 1;"
   
   # Check connection pool
   curl "https://your-app.com/api/health" \
        -H "Authorization: Bearer your_token"
   ```

2. **Webhook Validation Failures**
   ```bash
   # Verify webhook secret
   echo $SHOPIFY_WEBHOOK_SECRET
   
   # Check webhook logs
   curl "https://your-app.com/api/logs?level=error" \
        -H "Authorization: Bearer your_token"
   ```

3. **Performance Issues**
   ```bash
   # Check metrics
   curl "https://your-app.com/api/metrics" \
        -H "Authorization: Bearer your_token"
   
   # Database performance
   psql $DATABASE_URL -c "SELECT * FROM connection_stats;"
   ```

### Emergency Procedures

1. **Rollback Deployment**
   ```bash
   # Vercel
   vercel rollback
   
   # Railway
   railway rollback
   ```

2. **Scale Resources**
   ```bash
   # Railway
   railway variables set RAILWAY_DEPLOYMENT_REPLICAS=3
   
   # Docker Compose
   docker-compose up -d --scale app=5
   ```

## 📝 Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database connection successful
- [ ] SSL certificate active
- [ ] Health checks passing
- [ ] Webhooks receiving data
- [ ] Monitoring alerts configured
- [ ] Backup strategy implemented
- [ ] Performance metrics baseline recorded
- [ ] Documentation updated

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Example

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 📞 Support

For deployment issues:

1. Check application logs via monitoring endpoints
2. Review this deployment guide
3. Check platform-specific documentation (Vercel, Railway)
4. Monitor health check endpoints for system status

---

**Security Note:** Never commit production environment variables to version control. Use secure environment variable management provided by your hosting platform.
