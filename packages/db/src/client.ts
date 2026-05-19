/**
 * Database client.
 *
 * Single-process singleton for the postgres connection. Designed for serverless
 * (one connection per request, pooled via Neon's connection pooler in production)
 * and for local dev (a persistent pool).
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.');
}

// In dev, prefer the standard pool. In production on Neon, use the HTTP driver
// via NEON_DATABASE_URL or the WebSocket-based pool. For Stage 1 we keep this
// simple — the postgres-js driver works for both.
const queryClient = postgres(connectionString, {
  max: process.env.NODE_ENV === 'production' ? 10 : 5,
  prepare: false,
});

export const db = drizzle(queryClient, { schema, logger: process.env.DRIZZLE_LOG === 'true' });

export type DB = typeof db;
export { schema };
