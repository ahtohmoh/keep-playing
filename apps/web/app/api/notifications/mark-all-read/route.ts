import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db, notifications } from '@keep-playing/db';
import { requireUser } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST() {
  const { user } = await requireUser();
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, user.id), eq(notifications.read, false)));
  return NextResponse.json({ ok: true });
}
