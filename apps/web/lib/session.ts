/**
 * Request-scoped session helpers for Next.js.
 *
 * `getCurrentSession()` reads the session cookie and validates the token.
 * `requireUser()` redirects to /login if no session.
 * `requireTier()` redirects /login if no session and returns 403 if wrong tier.
 */
import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import {
  SESSION_COOKIE_NAME,
  validateSessionToken,
  type SessionValidationResult,
} from '@keep-playing/auth';
import type { Tier } from '@keep-playing/shared';

export const getCurrentSession = cache(async (): Promise<SessionValidationResult> => {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
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
