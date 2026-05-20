import { NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db, templates } from '@keep-playing/db';
import { can } from '@keep-playing/auth';
import { requireUser } from '@/lib/session';

export const runtime = 'nodejs';

export async function GET() {
  const { user } = await requireUser();
  if (!can('template.use', { userId: user.id, tier: user.tier })) {
    return NextResponse.json({ title: 'Not visible.' }, { status: 403 });
  }
  const rows = await db.select().from(templates).orderBy(asc(templates.title));
  return NextResponse.json({ templates: rows });
}
