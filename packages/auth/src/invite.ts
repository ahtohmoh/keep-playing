/**
 * Founder invitations.
 *
 * Stage 1: a signed token (HMAC-SHA256) encodes invitation payload + expiry.
 * No extra table. The Founder issues an invite; the invitee opens the URL,
 * sets a password, becomes a real user.
 *
 * In Stage 2 we can move to a DB-backed invitation table for revocation, etc.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Tier } from '@keep-playing/shared';

export type InvitePayload = {
  email: string;
  fullName: string;
  displayName?: string;
  tier: Tier;
  craft?: string;
  exp: number; // unix seconds
};

const SECRET = process.env.AUTH_SECRET ?? '';

function b64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64url');
}

function b64urlDecode(s: string): Buffer {
  return Buffer.from(s, 'base64url');
}

function sign(payload: string): string {
  if (!SECRET) throw new Error('AUTH_SECRET is not set; cannot sign invitations.');
  return b64url(createHmac('sha256', SECRET).update(payload).digest());
}

export function encodeInviteToken(p: InvitePayload): string {
  const json = JSON.stringify(p);
  const payload = b64url(json);
  return `${payload}.${sign(payload)}`;
}

export function decodeInviteToken(
  token: string,
): { ok: true; payload: InvitePayload } | { ok: false; reason: string } {
  const dot = token.indexOf('.');
  if (dot < 0) return { ok: false, reason: 'Malformed token.' };
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = sign(payload);
  if (sig.length !== expected.length) return { ok: false, reason: 'Bad signature.' };
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return { ok: false, reason: 'Bad signature.' };
  }

  try {
    const decoded = JSON.parse(b64urlDecode(payload).toString('utf8')) as InvitePayload;
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return { ok: false, reason: 'Invitation expired.' };
    }
    return { ok: true, payload: decoded };
  } catch {
    return { ok: false, reason: 'Malformed payload.' };
  }
}
