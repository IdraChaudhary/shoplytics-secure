# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Shoplytics Secure is a privacy-first, AI-assisted multi-tenant Shopify insights platform built with enterprise-grade security. The core architecture centers around data encryption, multi-tenancy, and compliance with privacy regulations like GDPR.

## Technology Stack

- **Framework**: Next.js 14 with TypeScript (App Router)
- **Database**: PostgreSQL on Neon with Drizzle ORM
- **Encryption**: AES-256-GCM with automatic key rotation
- **Authentication**: JWT with role-based access control (RBAC)
- **UI**: Tailwind CSS with Headless UI components
- **Charts**: Recharts for analytics visualization
- **Testing**: Jest with React Testing Library

## Development Commands

### Core Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Database Operations
```bash
# Generate migration files from schema
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Open Drizzle Studio for database management
npm run db:studio
```

### Testing
```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run integration tests specifically
npm run test:integration
```

### Encryption Management
```bash
# Rotate encryption keys for all stores
npm run encrypt:rotate-keys

# Rotate keys for a specific store
node scripts/rotate-encryption-keys.js --store-id=abc-123

# Dry run key rotation
node scripts/rotate-encryption-keys.js --dry-run
```

## Architecture Overview

### Multi-Tenant Data Isolation
The application uses a shared database with row-level security. Each Shopify store gets:
- Unique encryption keys stored encrypted in the database
- Complete data isolation (no cross-store data access)
- Separate authentication and authorization contexts

### Encryption Strategy
- **Customer PII**: Names, emails, addresses are encrypted with AES-256-GCM
- **Financial Data**: Order totals remain plaintext for analytics aggregation
- **Metadata**: Dates, SKUs, and non-sensitive data remain searchable
- **Key Management**: Automatic rotation without downtime using key versioning

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints
│   │   ├── auth/          # Authentication endpoints
│   │   ├── analytics/     # Analytics and reporting APIs
│   │   ├── shopify/       # Shopify webhook handlers
│   │   └── admin/         # Admin-only endpoints
│   ├── auth/              # Authentication pages (signin, signup)
│   └── dashboard/         # Protected dashboard pages
├── components/            # React components
│   ├── auth/              # Authentication forms and UI
│   ├── charts/            # Analytics visualization components
│   ├── dashboard/         # Dashboard-specific components
│   ├── providers/         # React context providers
│   └── ui/                # Reusable UI components
├── lib/                   # Core utilities and services
│   ├── auth/              # JWT handling and authentication logic
│   ├── database/          # Database connection and schemas
│   │   └── schemas/       # Drizzle ORM schema definitions
│   ├── encryption/        # Encryption utilities and key management
│   ├── ai/                # AI/ML analysis utilities
│   └── privacy/           # Privacy and compliance utilities
├── middleware/            # Next.js middleware for auth and security
├── types/                 # TypeScript type definitions
└── utils/                 # General utility functions

scripts/                   # Administrative scripts
├── rotate-encryption-keys.js  # Key rotation automation

tests/                     # Test files
├── unit/                  # Unit tests
└── integration/           # Integration tests
```

### Key Components

#### Encryption Layer (`src/lib/encryption/`)
- `crypto.ts`: Core encryption/decryption functions using AES-256-GCM
- `key-manager.ts`: Handles key generation, rotation, and storage
- All sensitive data is encrypted before database storage
- Keys are stored encrypted with a master key from environment variables

#### Database Layer (`src/lib/database/`)
- Uses Drizzle ORM with PostgreSQL
- Connection pooling enabled via Neon serverless
- Schemas define multi-tenant data structures with encryption fields
- Transaction support with proper error handling

#### Authentication (`src/lib/auth/`)
- JWT-based authentication with configurable expiration
- Role-based access control (Viewer, Analyst, Admin)
- Secure token generation and validation
- Session management with automatic refresh

#### Multi-tenant API Design
API routes follow the pattern `/api/stores/{storeId}/...` to ensure:
- Store ID validation before any operation
- User permission checks for store access
- Automatic encryption key retrieval for data operations
- Complete tenant isolation

## Security Considerations

### Data Protection
- All customer PII is encrypted at rest using store-specific keys
- Encryption keys are rotated automatically without service downtime
- Audit logging tracks all sensitive data access
- Database queries use parameterized statements to prevent SQL injection

### Access Control
- JWT tokens have short lifespans (15 minutes) with refresh mechanisms
- Role-based permissions control feature access
- API endpoints validate user permissions before processing
- Failed authentication attempts are logged and monitored

### Environment Variables
Critical environment variables required:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `ENCRYPTION_MASTER_KEY`: Master key for encrypting store keys
- `ENCRYPTION_SALT`: Salt for key derivation
- `NEXTAUTH_SECRET`: NextAuth.js secret for session handling

## Development Guidelines

### Adding New Encrypted Fields
When adding fields that contain PII:
1. Mark the database column as `text` (not the raw type)
2. Use `encryptData()` before database insertion
3. Use `decryptData()` when retrieving for display
4. Update the encryption key rotation script to include the new field
5. Add audit logging for access to the encrypted data

### API Security Patterns
New API routes should:
1. Validate JWT tokens using the auth middleware
2. Check user permissions for the requested store
3. Use parameterized queries for database operations
4. Log sensitive operations to the audit trail
5. Return minimal data (no unnecessary PII exposure)

### Testing Security Features
Critical tests include:
- Encryption/decryption roundtrip verification
- Key rotation without data loss
- Cross-tenant data access prevention
- JWT token validation and expiration
- Role-based permission enforcement

### Database Migrations
When modifying schemas:
1. Generate migrations with `npm run db:generate`
2. Review the generated SQL for correctness
3. Test migrations on a copy of production data
4. Ensure encrypted fields remain properly encrypted
5. Update any affected encryption key rotation scripts

## Common Troubleshooting

### "Encryption key not found" errors
- Verify `ENCRYPTION_MASTER_KEY` environment variable is set
- Check database connectivity to the key storage table
- Look for failed key rotation operations in application logs

### JWT token issues
- Tokens expire after 15 minutes - implement refresh logic
- Ensure `JWT_SECRET` is consistent across deployments
- Clear browser localStorage if tokens appear corrupted

### Database connection problems
- Verify `DATABASE_URL` format and credentials
- Check Neon database status and connection limits
- Enable connection pooling in production environments

### Slow dashboard performance
- Pre-calculate heavy analytics queries and cache results
- Consider denormalized tables for frequently accessed aggregations
- Monitor database query performance and add indexes where appropriate
- Remember that encrypted field indexes don't improve query performance
