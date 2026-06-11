/**
 * One-off bootstrap script.
 *
 * Sets the seeded Founder's password so you can sign in the first time.
 * Idempotent: re-running rotates the password.
 *
 * Usage:
 *   FOUNDER_PASSWORD=somethingstrong pnpm --filter @keep-playing/db bootstrap
 */
import { config } from 'dotenv';
config({ path: '../../.env.local' });
config({ path: '../../.env' });
import { eq } from 'drizzle-orm';
import { hash } from '@node-rs/argon2';
import { db } from './client';
import { users } from './schema';

const argonOptions = { memoryCost: 19_456, timeCost: 2, parallelism: 1, outputLen: 32 } as const;

const email = process.env.FOUNDER_EMAIL ?? 'krasumashi@ahtohmoh.com';
const password = process.env.FOUNDER_PASSWORD;

if (!password) {
  console.error('Set FOUNDER_PASSWORD env var.');
  process.exit(1);
}
if (password.length < 12) {
  console.error('Use a password with at least 12 characters.');
  process.exit(1);
}

const passwordHash = await hash(password, argonOptions);
const updated = await db
  .update(users)
  .set({ passwordHash })
  .where(eq(users.email, email))
  .returning({ id: users.id, email: users.email });

if (updated.length === 0) {
  console.error(`No user with email ${email}. Run \`pnpm db:seed\` first.`);
  process.exit(1);
}

console.log(`Password set for ${updated[0]!.email}. You can sign in at /login.`);
process.exit(0);
