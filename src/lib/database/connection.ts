import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { PgTransaction } from 'drizzle-orm/pg-core';
import type { NeonHttpQueryResultHKT } from 'drizzle-orm/neon-http';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import * as schema from './schemas';

// Initialize connection lazily to prevent build-time connection attempts
let _db: NeonHttpDatabase<typeof schema> | null = null;

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Enable connection pooling for better performance
    neonConfig.fetchConnectionCache = true;

    // Create the database connection with proper typing
    const sql: NeonQueryFunction<any, any> = neon(process.env.DATABASE_URL);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

// Connection health check utility
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const db = getDb();
    await db.execute(sql`SELECT 1 as health_check`);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Transaction wrapper with proper error handling
export async function withTransaction<T>(
  callback: (tx: PgTransaction<NeonHttpQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>) => Promise<T>
): Promise<T> {
  const db = getDb();
  return await db.transaction(async (tx) => {
    try {
      return await callback(tx);
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  });
}