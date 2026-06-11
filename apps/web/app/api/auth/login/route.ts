import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db, users } from '@keep-playing/db';
import {
  verifyPassword,
  generateSessionToken,
  createSession,
  sessionCookie,
} from '@keep-playing/auth';
import { loginSchema } from '@keep-playing/shared';
import { audit } from '@/lib/audit';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  // 5 attempts per 15 minutes per IP (spec §20).
  const rl = rateLimit({ key: `login:${clientIp(req)}`, limit: 5, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { title: 'Too many attempts. Take a breath.', status: 429 },
      { status: 429, headers: { 'retry-after': String(rl.retryAfterSeconds) } },
    );
  }

  let body: Record<string, unknown>;
  const ct = req.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    body = await req.json();
  } else {
    const form = await req.formData();
    body = Object.fromEntries(form.entries());
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Invalid input', detail: parsed.error.message, status: 400 },
      { status: 400 },
    );
  }

  const rows = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  const user = rows[0];

  if (!user || !user.passwordHash) {
    return NextResponse.json(
      { title: 'No such account', status: 401 },
      { status: 401 },
    );
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    await audit({ userId: user.id, action: 'auth.login.failed' });
    return NextResponse.json({ title: 'Incorrect password', status: 401 }, { status: 401 });
  }

  if (!user.active) {
    return NextResponse.json({ title: 'Account inactive', status: 403 }, { status: 403 });
  }

  const token = generateSessionToken();
  await createSession(token, user.id);
  const cookie = sessionCookie(token);
  cookies().set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    path: cookie.path,
    maxAge: cookie.maxAge,
    domain: cookie.domain,
  });

  await audit({ userId: user.id, action: 'auth.login.success' });

  // If submitted via HTML form, redirect; else JSON.
  if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
    const dest = user.onboardingCompletedAt ? '/home' : '/onboarding/welcome';
    return NextResponse.redirect(new URL(dest, req.url), { status: 303 });
  }

  // JSON clients (the mobile app) get the token for Bearer auth.
  return NextResponse.json({
    ok: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      displayName: user.displayName,
      tier: user.tier,
      onboardingCompletedAt: user.onboardingCompletedAt,
    },
  });
}
