import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, users } from '@keep-playing/db';
import {
  decodeInviteToken,
  hashPassword,
  generateSessionToken,
  createSession,
  sessionCookie,
} from '@keep-playing/auth';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';

const bodySchema = z.object({
  token: z.string().min(20),
  password: z
    .string()
    .min(12, 'Use at least 12 characters.')
    .max(128, "That's longer than we need."),
});

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  const ct = req.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) body = await req.json();
  else body = Object.fromEntries((await req.formData()).entries());

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ title: 'Invalid input.', detail: parsed.error.message }, { status: 400 });
  }

  const decoded = decodeInviteToken(parsed.data.token);
  if (!decoded.ok) {
    return NextResponse.json({ title: decoded.reason }, { status: 400 });
  }

  // Don't re-create if email already exists.
  const existing = await db.select().from(users).where(eq(users.email, decoded.payload.email)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json(
      { title: 'A user with that email already exists.' },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const inserted = await db
    .insert(users)
    .values({
      email: decoded.payload.email,
      fullName: decoded.payload.fullName,
      displayName: decoded.payload.displayName,
      tier: decoded.payload.tier,
      craft: decoded.payload.craft,
      passwordHash,
    })
    .returning();
  const newUser = inserted[0]!;

  const sessionToken = generateSessionToken();
  await createSession(sessionToken, newUser.id);
  const cookie = sessionCookie(sessionToken);
  cookies().set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    path: cookie.path,
    maxAge: cookie.maxAge,
  });

  await audit({ userId: newUser.id, action: 'member.invite.accepted' });

  if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
    return NextResponse.redirect(new URL('/onboarding/welcome', req.url), { status: 303 });
  }
  return NextResponse.json({ ok: true, userId: newUser.id });
}
