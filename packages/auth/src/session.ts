/**
 * Session management.
 *
 * Cookie-based, HttpOnly, SameSite=Lax, Secure in production. Sessions live
 * in the database (`sessions` table). Tokens are 40-byte URL-safe random ids
 * stored hashed at rest — we keep the same convention as Lucia v3.
 *
 * If you swap to Lucia or Better Auth later, the interfaces here are
 * intentionally narrow so the swap stays local to this file.
 */
import { eq, lt } from 'drizzle-orm';
import { sha256 } from 'oslo/crypto';
import { db, sessions, users, type User } from '@keep-playing/db';

// Base32 (lowercase, no padding) — RFC 4648 alphabet, lowercased.
const BASE32_ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';

function encodeBase32Lower(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i]!;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const SESSION_REFRESH_AFTER_MS = 1000 * 60 * 60 * 24 * 15; // refresh halfway

export type SessionRow = {
  id: string;
  userId: string;
  expiresAt: Date;
};

export type SessionValidationResult =
  | { session: SessionRow; user: User }
  | { session: null; user: null };

/** Generate a new random token. Caller stores its sha256 hash as the session id. */
export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return encodeBase32Lower(bytes);
}

async function hashToken(token: string): Promise<string> {
  const buf = await sha256(new TextEncoder().encode(token));
  return Buffer.from(buf).toString('hex');
}

export async function createSession(token: string, userId: string): Promise<SessionRow> {
  const id = await hashToken(token);
  const session: SessionRow = {
    id,
    userId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  };
  await db.insert(sessions).values(session);
  return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  const id = await hashToken(token);

  const rows = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, id))
    .limit(1);

  if (rows.length === 0) return { session: null, user: null };
  const { session, user } = rows[0]!;

  // Expired? Delete and bounce.
  if (session.expiresAt.getTime() <= Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, session.id));
    return { session: null, user: null };
  }

  // Sliding refresh: if we're past the halfway mark, extend.
  if (session.expiresAt.getTime() - Date.now() < SESSION_TTL_MS - SESSION_REFRESH_AFTER_MS) {
    const newExpiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await db.update(sessions).set({ expiresAt: newExpiresAt }).where(eq(sessions.id, session.id));
    session.expiresAt = newExpiresAt;
  }

  return { session, user };
}

export async function invalidateSession(token: string): Promise<void> {
  const id = await hashToken(token);
  await db.delete(sessions).where(eq(sessions.id, id));
}

export async function invalidateAllSessionsForUser(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/** Sweep expired sessions. Call periodically from a nightly job. */
export async function reapExpiredSessions(): Promise<void> {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

// Cookie helpers — framework-agnostic so they can be wired into Next.js,
// Hono, or anything else from a single place.

export const SESSION_COOKIE_NAME = 'kp_session';

export type CookieAttributes = {
  name: string;
  value: string;
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  maxAge?: number;
  domain?: string;
};

export function sessionCookie(token: string, opts?: { domain?: string }): CookieAttributes {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    domain: opts?.domain,
  };
}

export function blankSessionCookie(opts?: { domain?: string }): CookieAttributes {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    domain: opts?.domain,
  };
}
