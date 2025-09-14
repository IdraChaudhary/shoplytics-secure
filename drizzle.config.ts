import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

// Load environment variables from .env.local
config({ path: '.env.local', override: true });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export default {
  schema: './src/lib/database/schemas/*.ts',
  out: './database/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
    ssl: true
  },
  verbose: true,
  strict: true,
} satisfies Config;
