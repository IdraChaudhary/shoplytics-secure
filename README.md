# 🛡️ Shoplytics Secure 
Technical Documentation -https://docs.google.com/document/d/17BAkIMc5EqXXGuR4ptLieHAXAxV8s7x3XDqCtezWIMY/edit?usp=sharing

A privacy-first, AI-assisted multi-tenant Shopify insights platform designed for enterprise retailers who take data security seriously.

## 🎯 What Makes This Different

Unlike typical analytics tools that treat privacy as an afterthought, Shoplytics Secure puts data protection at its core. Every customer email, address, and sensitive detail gets encrypted before hitting the database. We've built this assuming you're dealing with millions of customer records across multiple stores, where a data breach isn't just embarrassing—it's business-ending.

## 🏗️ Architecture Overview

### The Stack
- **Frontend/Backend**: Next.js 14 with TypeScript (App Router)
- **Database**: PostgreSQL on Neon with Drizzle ORM
- **Encryption**: AES-256-GCM with automatic key rotation
- **Auth**: JWT with role-based access control
- **Charts**: Recharts for beautiful, responsive analytics
- **Deployment**: Vercel, Docker, or traditional hosting

### Multi-Tenant Design

Each Shopify store gets its own encrypted data silo. Users can access multiple stores, but the data never mixes. Think of it like having separate bank accounts—even if you're the same person, the money stays separate.

```
Store A Data ─→ Encrypted with Key A ─→ Database
Store B Data ─→ Encrypted with Key B ─→ Database  
Store C Data ─→ Encrypted with Key C ─→ Database
```

### Encryption Strategy

We don't just encrypt everything and call it secure. Here's how we actually protect data:

- **Customer PII**: Names, emails, addresses get AES-256 encryption
- **Financial Data**: Order totals stay in plaintext for analytics (they're not PII)
- **Metadata**: Order dates, product SKUs remain searchable
- **Keys**: Each store gets unique encryption keys, rotated automatically

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (we use newer features, so don't try Node 16)
- A Neon PostgreSQL database
- Basic understanding of Shopify apps (if you're integrating)

### Quick Setup

1. **Clone and install**
   ```bash
   git clone <your-repo>
   cd shoplytics-secure
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your database URL, JWT secrets, and encryption keys. The `.env.example` file has detailed comments explaining each variable.

3. **Database setup**
   ```bash
   npm run db:generate  # Generate migration files
   npm run db:migrate   # Apply to database
   ```

4. **Development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` and you should see the auth page.

### Setting Up Shopify Integration

1. Create a Shopify Partner account
2. Build a new app with these scopes:
   - `read_orders` - For order data
   - `read_customers` - For customer analytics
   - `read_products` - For product insights
3. Set your app URL and webhook endpoints in the Partner Dashboard
4. Add your Shopify credentials to `.env.local`

## 🔐 Security Features

### Encryption at Rest

Every sensitive field gets encrypted before storage:

```typescript path=null start=null
// Before storing customer email
const encryptedEmail = encryptData(customer.email, storeKey);
await db.insert(customers).values({
  email: encryptedEmail,  // This goes to the database
  // ... other fields
});

// When retrieving for display
const customer = await db.select().from(customers).where(...);
const decryptedEmail = decryptData(customer.email, storeKey);
```

### Key Rotation Without Downtime

Keys automatically rotate every year, but you can force rotation anytime:

```bash
npm run encrypt:rotate-keys                    # All stores
node scripts/rotate-encryption-keys.js --store-id=abc-123  # One store
node scripts/rotate-encryption-keys.js --dry-run          # Test run
```

The rotation process:
1. Generate new key (keep old active)
2. Re-encrypt all data with new key
3. Activate new key, deactivate old one
4. Clean up old keys after retention period

### Role-Based Access

Three levels of access:
- **Viewer**: See dashboards, no data export
- **Analyst**: Full analytics access, can export aggregated data
- **Admin**: Everything + user management + encryption settings

## 📊 Analytics Features

### AI-Powered Insights

The system runs nightly analysis to surface:
- Customer churn risk scores
- Seasonal buying pattern detection
- Product recommendation opportunities
- Fraud risk assessment for orders

### Real-Time Alerts

Get notified about:
- Unusual order volume spikes
- High-risk transactions
- Customer data processing requests
- System security events

### Privacy-First Reporting

All reports show aggregated data only. You'll see "425 customers from California" but never individual customer details in reports.

## 🏢 Deployment Options

### Vercel (Recommended)

The simplest path to production:

```bash
npm install -g vercel
vercel --prod
```

Set these environment variables in the Vercel dashboard:
- All variables from `.env.example`
- Make sure `NODE_ENV=production`

### Docker Deployment

For more control over your hosting:

```bash
docker build -t shoplytics-secure .
docker run -p 3000:3000 --env-file .env.local shoplytics-secure
```

Or use the full Docker Compose setup:

```bash
docker-compose up -d
```

This gives you the app + PostgreSQL + Redis + monitoring stack.

### Traditional Hosting

Works on any Node.js host:

```bash
npm run build
npm start
```

You'll need to provide your own PostgreSQL database.

## 🧪 Testing Strategy

### Unit Tests
```bash
npm test                    # Run once
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
```

We test the critical paths:
- Encryption/decryption functions
- JWT token generation/validation
- Database queries with proper tenant isolation
- API route authentication

### Integration Tests
```bash
npm run test:integration
```

These test full workflows:
- User registration → email verification → dashboard access
- Shopify webhook processing → data encryption → analytics calculation
- Key rotation process end-to-end

### Security Testing

Manual testing checklist:
- [ ] Try accessing another store's data (should fail)
- [ ] Attempt SQL injection on search endpoints
- [ ] Test with expired/malformed JWT tokens
- [ ] Verify encrypted fields are never returned in plain text
- [ ] Check audit logs capture all sensitive operations

## 🔍 Monitoring and Observability

### Audit Logs

Every sensitive operation gets logged:
```typescript path=null start=null
await logAuditEvent({
  action: 'DECRYPT_CUSTOMER_DATA',
  userId: currentUser.id,
  storeId: customer.storeId,
  resourceId: customer.id,
  metadata: { purpose: 'dashboard_display' }
});
```

### Health Checks

Monitor these endpoints:
- `/api/health` - Basic app health
- `/api/health/database` - Database connectivity
- `/api/health/encryption` - Key management system

### Performance Monitoring

Key metrics to watch:
- Database query time (especially for encrypted field searches)
- Key retrieval latency
- Webhook processing delays
- Dashboard load times

## 🚨 Incident Response

### Data Breach Protocol

If you suspect encrypted data exposure:

1. **Immediate**: Rotate all encryption keys
   ```bash
   node scripts/rotate-encryption-keys.js --force
   ```

2. **Assess**: Check audit logs for unauthorized access
   ```sql
   SELECT * FROM audit_logs 
   WHERE action IN ('DECRYPT_CUSTOMER_DATA', 'READ') 
   AND created_at > '2024-01-01'
   ORDER BY created_at DESC;
   ```

3. **Notify**: Customer notification process (varies by jurisdiction)

### System Recovery

Database corruption recovery:
1. Restore from latest backup
2. Check encryption key integrity
3. Verify data decryption works
4. Run consistency checks

## 🔧 Common Issues

### "Encryption key not found"
- Check your `ENCRYPTION_MASTER_KEY` environment variable
- Verify database connectivity
- Look for failed key rotations in logs

### "Invalid JWT token"
- Token might be expired (15-minute lifetime)
- Check `JWT_SECRET` matches between sessions
- Browser might have stale tokens (clear localStorage)

### Slow dashboard loading
- Database indexes on encrypted fields won't help (they're encrypted!)
- Consider caching aggregated data
- Pre-calculate heavy analytics nightly

### Shopify webhook failures
- Verify webhook secret matches Shopify settings
- Check if webhook endpoint is publicly accessible
- Look for rate limiting issues

## 🤝 Contributing

### Development Workflow

1. **Feature branches**: `feature/customer-segments`
2. **Testing**: All tests must pass, including security tests
3. **Encryption**: Any new sensitive fields need encryption
4. **Audit**: Sensitive operations need audit logging

### Code Style

We use Prettier and ESLint. Run before committing:
```bash
npm run lint:fix
npm run type-check
```

### Security Reviews

Changes affecting encryption, authentication, or data access need security review. Create a detailed PR description explaining:
- What data is affected
- How access control works
- Why the approach is secure

## 📚 API Documentation

### Authentication
All API routes (except auth) require Bearer token:
```http
Authorization: Bearer <jwt-token>
```

### Key Endpoints

**POST `/api/auth/signin`**
```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

**GET `/api/stores/{storeId}/analytics`**
Returns aggregated analytics for the store. Requires analyst+ role.

**POST `/api/shopify/webhooks/orders/create`**
Receives Shopify order webhooks. Verifies signature and processes data.

Full API documentation available at `/api/docs` when running locally.

## 🎓 Learning Resources

### Encryption Concepts
- [AES-256-GCM explained](https://en.wikipedia.org/wiki/Galois/Counter_Mode)
- [Key rotation best practices](https://cloud.google.com/kms/docs/key-rotation)

### Multi-tenancy Patterns
- [Database per tenant vs shared database](https://docs.microsoft.com/en-us/azure/architecture/patterns/multi-tenancy)

### Shopify Development
- [Shopify App Development](https://shopify.dev/docs/apps)
- [Webhook best practices](https://shopify.dev/docs/apps/webhooks)

## 📄 License

[Insert your license here]

---

**Built with security in mind.** Questions? Issues? Check the troubleshooting guide above or open an issue.
