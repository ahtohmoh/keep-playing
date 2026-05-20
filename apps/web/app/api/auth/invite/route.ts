import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, users } from '@keep-playing/db';
import { encodeInviteToken } from '@keep-playing/auth';
import { memberInviteSchema } from '@keep-playing/shared';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';

const INVITE_TTL_DAYS = 14;

export async function POST(req: Request) {
  const { user } = await requireUser();
  if (user.tier !== 'founder') {
    return NextResponse.json({ title: 'Only the Founder can invite.', status: 403 }, { status: 403 });
  }

  const body = await req.json();
  const parsed = memberInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ title: 'Invalid invite.', detail: parsed.error.message }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ title: 'A user with that email already exists.' }, { status: 409 });
  }

  const exp = Math.floor(Date.now() / 1000) + INVITE_TTL_DAYS * 24 * 60 * 60;
  const token = encodeInviteToken({ ...parsed.data, exp });
  const url = new URL(`/onboarding/accept?token=${encodeURIComponent(token)}`, req.url);

  await audit({
    userId: user.id,
    action: 'member.invite.issued',
    payload: { email: parsed.data.email, tier: parsed.data.tier },
  });

  return NextResponse.json({ inviteUrl: url.toString(), expiresAt: new Date(exp * 1000).toISOString() });
}
