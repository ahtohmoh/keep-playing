/**
 * Run migrations.
 *
 * Usage: `pnpm db:migrate`
 */
import { config } from 'dotenv';
config({ path: '../../.env.local' });
config({ path: '../../.env' });
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const url = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL (or DIRECT_DATABASE_URL) must be set.');
  process.exit(1);
}

const migrationClient = postgres(url, { max: 1 });
const db = drizzle(migrationClient);

console.log('Running migrations…');
await migrate(db, { migrationsFolder: './drizzle' });
console.log('Migrations complete.');

await migrationClient.end();
process.exit(0);
