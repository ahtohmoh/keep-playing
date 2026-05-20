import { NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db, notifications } from '@keep-playing/db';
import { requireUser } from '@/lib/session';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { user } = await requireUser();
  const url = new URL(req.url);
  const unreadOnly = url.searchParams.get('unread') === '1';
  const where = unreadOnly
    ? and(eq(notifications.userId, user.id), eq(notifications.read, false))
    : eq(notifications.userId, user.id);
  const rows = await db
    .select()
    .from(notifications)
    .where(where)
    .orderBy(desc(notifications.createdAt))
    .limit(100);
  return NextResponse.json({ notifications: rows });
}
