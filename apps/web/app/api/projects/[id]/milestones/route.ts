import { NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { db, milestones } from '@keep-playing/db';
import { milestoneCreateSchema } from '@keep-playing/shared';
import { can } from '@keep-playing/auth';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';
import { getMembershipFor } from '@/lib/projects';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser();
  const m = await getMembershipFor(params.id, user.id);
  if (
    !can('project.view', {
      userId: user.id,
      tier: user.tier,
      projectId: params.id,
      isProjectContributor: m.isContributor,
    })
  ) {
    return NextResponse.json({ title: 'Not visible.' }, { status: 403 });
  }
  const rows = await db
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, params.id))
    .orderBy(asc(milestones.orderIndex));
  return NextResponse.json({ milestones: rows });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser();
  const m = await getMembershipFor(params.id, user.id);
  if (
    !can('milestone.create', {
      userId: user.id,
      tier: user.tier,
      projectId: params.id,
      isProjectContributor: m.isContributor,
      contributionRole: m.role ?? undefined,
    })
  ) {
    return NextResponse.json({ title: 'Not permitted.' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = milestoneCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ title: 'Invalid input.', detail: parsed.error.message }, { status: 400 });
  }

  const ordered = await db
    .select({ count: milestones.id })
    .from(milestones)
    .where(eq(milestones.projectId, params.id));

  const inserted = await db
    .insert(milestones)
    .values({
      projectId: params.id,
      title: parsed.data.title,
      description: parsed.data.description,
      ownerId: parsed.data.ownerId,
      dueAt: parsed.data.dueAt,
      orderIndex: ordered.length,
    })
    .returning();
  const ms = inserted[0]!;

  await audit({
    userId: user.id,
    action: 'milestone.create',
    targetType: 'milestone',
    targetId: ms.id,
    payload: { projectId: params.id, title: ms.title },
  });

  return NextResponse.json({ milestone: ms }, { status: 201 });
}
