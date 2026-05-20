import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, milestones } from '@keep-playing/db';
import { milestoneUpdateSchema } from '@keep-playing/shared';
import { can } from '@keep-playing/auth';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';
import { getMembershipFor } from '@/lib/projects';

export const runtime = 'nodejs';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser();
  const rows = await db.select().from(milestones).where(eq(milestones.id, params.id)).limit(1);
  if (rows.length === 0) {
    return NextResponse.json({ title: 'Not found.' }, { status: 404 });
  }
  const ms = rows[0]!;

  const membership = await getMembershipFor(ms.projectId, user.id);
  const action = 'status' in (await req.clone().json().catch(() => ({}))) ? 'milestone.complete' : 'milestone.edit';
  if (
    !can(action, {
      userId: user.id,
      tier: user.tier,
      projectId: ms.projectId,
      isProjectContributor: membership.isContributor,
      contributionRole: membership.role ?? undefined,
    })
  ) {
    return NextResponse.json({ title: 'Not permitted.' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = milestoneUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ title: 'Invalid input.', detail: parsed.error.message }, { status: 400 });
  }

  const patch: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.status === 'complete') patch.completedAt = new Date();
  if (parsed.data.status === 'pending' || parsed.data.status === 'in_progress')
    patch.completedAt = null;

  const updated = await db
    .update(milestones)
    .set(patch)
    .where(eq(milestones.id, params.id))
    .returning();

  await audit({
    userId: user.id,
    action,
    targetType: 'milestone',
    targetId: params.id,
    payload: parsed.data,
  });

  return NextResponse.json({ milestone: updated[0] });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser();
  const rows = await db.select().from(milestones).where(eq(milestones.id, params.id)).limit(1);
  if (rows.length === 0) return NextResponse.json({ title: 'Not found.' }, { status: 404 });
  const ms = rows[0]!;

  const membership = await getMembershipFor(ms.projectId, user.id);
  if (
    !can('milestone.edit', {
      userId: user.id,
      tier: user.tier,
      projectId: ms.projectId,
      isProjectContributor: membership.isContributor,
      contributionRole: membership.role ?? undefined,
    })
  ) {
    return NextResponse.json({ title: 'Not permitted.' }, { status: 403 });
  }

  await db.delete(milestones).where(eq(milestones.id, params.id));
  await audit({ userId: user.id, action: 'milestone.delete', targetType: 'milestone', targetId: params.id });
  return NextResponse.json({ ok: true });
}
