import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db, pipelineEntries } from '@keep-playing/db';
import { pipelineEntrySchema } from '@keep-playing/shared';
import { can } from '@keep-playing/auth';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';

export async function GET() {
  const { user } = await requireUser();
  if (user.tier === 'founder') {
    const rows = await db.select().from(pipelineEntries).orderBy(desc(pipelineEntries.updatedAt));
    return NextResponse.json({ entries: rows });
  }
  if (!can('pipeline.view_own', { userId: user.id, tier: user.tier })) {
    return NextResponse.json({ title: 'Not visible.' }, { status: 403 });
  }
  const rows = await db
    .select()
    .from(pipelineEntries)
    .where(eq(pipelineEntries.correspondentId, user.id))
    .orderBy(desc(pipelineEntries.updatedAt));
  return NextResponse.json({ entries: rows });
}

export async function POST(req: Request) {
  const { user } = await requireUser();
  if (!can('pipeline.edit_own', { userId: user.id, tier: user.tier })) {
    return NextResponse.json({ title: 'Not permitted.' }, { status: 403 });
  }
  const body = await req.json();
  const parsed = pipelineEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ title: 'Invalid input.', detail: parsed.error.message }, { status: 400 });
  }
  const inserted = await db
    .insert(pipelineEntries)
    .values({ ...parsed.data, correspondentId: user.id })
    .returning();
  await audit({
    userId: user.id,
    action: 'pipeline.create',
    targetType: 'pipeline_entry',
    targetId: inserted[0]!.id,
  });
  return NextResponse.json({ entry: inserted[0] }, { status: 201 });
}
