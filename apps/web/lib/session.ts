/**
 * Request-scoped session helpers for Next.js.
 *
 * `getCurrentSession()` reads the session from the cookie (web) or the
 * Authorization: Bearer header (mobile app) and validates the token.
 * `requireUser()` redirects to /login if no session.
 * `requireTier()` redirects /login if no session, /home if wrong tier.
 *
 * The mobile app stores its session token in SecureStore and sends it as a
 * Bearer header — same token format, same validation path, no cookies needed.
 */
import 'server-only';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import {
  SESSION_COOKIE_NAME,
  validateSessionToken,
  type SessionValidationResult,
} from '@keep-playing/auth';
import type { Tier } from '@keep-playing/shared';

export const getCurrentSession = cache(async (): Promise<SessionValidationResult> => {
  // Cookie first (web), then Bearer (mobile).
  let token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    const auth = headers().get('authorization');
    if (auth?.startsWith('Bearer ')) token = auth.slice('Bearer '.length).trim();
  }
  if (!token) return { session: null, user: null };
  return validateSessionToken(token);
});

export async function requireUser() {
  const { session, user } = await getCurrentSession();
  if (!session || !user) redirect('/login');
  return { session, user };
}

export async function requireTier(...allowed: Tier[]) {
  const { session, user } = await requireUser();
  if (!allowed.includes(user.tier)) redirect('/home');
  return { session, user };
}
