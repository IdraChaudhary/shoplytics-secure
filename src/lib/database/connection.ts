import { neon, neonConfig } from '@neondatabase/serverless';import { if (!process.env.DATABASE_URL) {

import { drizzle } from 'drizzle-orm/neon-http';  throw new Error('DATABASE_URL environment variable is required');

import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';}

import * as schema from './schemas';

// Create the database connection with type assertion

// Enable connection pooling for better performanceconst sql = neon(process.env.DATABASE_URL);

neonConfig.fetchConnectionCache = true;export const db = drizzle(sql as any, { schema });eonConfig } from '@neondatabase/serverless';

import { drizzle } from 'drizzle-orm/neon-http';

if (!process.env.DATABASE_URL) {import { NeonHttpDatabase } from 'drizzle-orm/neon-http';

  throw new Error('DATABASE_URL environment variable is required');import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

}import * as schema from './schemas';



// Create the database connection with type assertion for compatibility// Enable connection pooling for better performance

const sql = neon(process.env.DATABASE_URL);neonConfig.fetchConnectionCache = true;

export const db = drizzle(sql as any, { schema });

if (!process.env.DATABASE_URL) {

// Connection health check utility  throw new Error('DATABASE_URL environment variable is required');

export async function checkDatabaseConnection(): Promise<boolean> {}

  try {

    await sql`SELECT 1 as health_check`;// Create the database connection

    return true;const sql = neon<boolean, boolean>(process.env.DATABASE_URL);

  } catch (error) {export const db = drizzle(sql, { schema });

    console.error('Database connection failed:', error);

    return false;// Connection health check utility

  }export async function checkDatabaseConnection(): Promise<boolean> {

}  try {

    await sql`SELECT 1 as health_check`;

// Transaction wrapper with proper error handling    return true;

export async function withTransaction<T>(  } catch (error) {

  callback: (tx: PostgresJsDatabase<typeof schema>) => Promise<T>    console.error('Database connection failed:', error);

): Promise<T> {    return false;

  return await db.transaction(async (tx) => {  }

    try {}

      return await callback(tx as unknown as PostgresJsDatabase<typeof schema>);

    } catch (error) {// Transaction wrapper with proper error handling

      console.error('Transaction failed:', error);export async function withTransaction<T>(

      throw error;  callback: (tx: PostgresJsDatabase<typeof schema>) => Promise<T>

    }): Promise<T> {

  });  return await db.transaction(async (tx) => {

}    try {
      return await callback(tx as unknown as PostgresJsDatabase<typeof schema>);
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  });
}
