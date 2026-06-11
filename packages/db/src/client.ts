/**
 * Database client.
 *
 * Lazily initialised singleton. The connection is created on first query, not
 * at import time — `next build` collects page data by importing route modules,
 * and a build must never require a live DATABASE_URL. If the env var is
 * missing, the error surfaces on the first actual query with a clear message.
 */
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type Database = PostgresJsDatabase<typeof schema>;

let _db: Database | null = null;

function getDb(): Database {
  if (_db) return _db;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.');
  }
  const queryClient = postgres(connectionString, {
    max: process.env.NODE_ENV === 'production' ? 10 : 5,
    prepare: false,
  });
  _db = drizzle(queryClient, { schema, logger: process.env.DRIZZLE_LOG === 'true' });
  return _db;
}

// A Proxy keeps the export shape identical for every call site (`db.select()`,
// `db.insert()`, …) while deferring connection until first use.
export const db: Database = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = Reflect.get(real, prop, receiver);
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(real) : value;
  },
});

export type DB = Database;
export { schema };
