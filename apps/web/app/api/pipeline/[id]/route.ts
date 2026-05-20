import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, pipelineEntries } from '@keep-playing/db';
import { pipelineEntrySchema } from '@keep-playing/shared';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser();
  const rows = await db.select().from(pipelineEntries).where(eq(pipelineEntries.id, params.id)).limit(1);
  if (rows.length === 0) return NextResponse.json({ title: 'Not found.' }, { status: 404 });
  const e = rows[0]!;
  if (user.tier !== 'founder' && e.correspondentId !== user.id) {
    return NextResponse.json({ title: 'Not permitted.' }, { status: 403 });
  }
  const body = await req.json();
  const parsed = pipelineEntrySchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ title: 'Invalid input.' }, { status: 400 });
  }
  const updated = await db
    .update(pipelineEntries)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(pipelineEntries.id, params.id))
    .returning();
  await audit({ userId: user.id, action: 'pipeline.update', targetType: 'pipeline_entry', targetId: params.id });
  return NextResponse.json({ entry: updated[0] });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser();
  const rows = await db.select().from(pipelineEntries).where(eq(pipelineEntries.id, params.id)).limit(1);
  if (rows.length === 0) return NextResponse.json({ title: 'Not found.' }, { status: 404 });
  const e = rows[0]!;
  if (user.tier !== 'founder' && e.correspondentId !== user.id) {
    return NextResponse.json({ title: 'Not permitted.' }, { status: 403 });
  }
  await db.delete(pipelineEntries).where(eq(pipelineEntries.id, params.id));
  await audit({ userId: user.id, action: 'pipeline.delete', targetType: 'pipeline_entry', targetId: params.id });
  return NextResponse.json({ ok: true });
}
