import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/database/schemas/*.ts',
  out: './database/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
