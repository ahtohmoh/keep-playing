import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, projects, briefRevisions } from '@keep-playing/db';
import { projectUpdateSchema } from '@keep-playing/shared';
import { can } from '@keep-playing/auth';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';
import { getMembershipFor } from '@/lib/projects';

export const runtime = 'nodejs';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser();
  const membership = await getMembershipFor(params.id, user.id);

  if (
    !can('project.edit', {
      userId: user.id,
      tier: user.tier,
      projectId: params.id,
      isProjectContributor: membership.isContributor,
      contributionRole: membership.role ?? undefined,
    })
  ) {
    return NextResponse.json({ title: 'Not permitted.' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = projectUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { title: 'Invalid update.', detail: parsed.error.message },
      { status: 400 },
    );
  }

  const { briefRevisionNote, ...patch } = parsed.data;

  // Brief edits are append-only history. Persist the outgoing brief before
  // it is replaced — process visible in the artifact.
  if (patch.brief !== undefined) {
    const existing = await db
      .select({ brief: projects.brief })
      .from(projects)
      .where(eq(projects.id, params.id))
      .limit(1);
    const previous = existing[0]?.brief;
    if (previous != null) {
      await db.insert(briefRevisions).values({
        projectId: params.id,
        brief: previous,
        revisedById: user.id,
        note: briefRevisionNote ?? null,
      });
    }
  }

  const updated = await db
    .update(projects)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(projects.id, params.id))
    .returning();

  await audit({
    userId: user.id,
    action: patch.brief !== undefined ? 'brief.update' : 'project.update',
    targetType: 'project',
    targetId: params.id,
    projectId: params.id,
    payload: parsed.data,
  });

  return NextResponse.json({ project: updated[0] });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser();
  if (user.tier !== 'founder') {
    return NextResponse.json({ title: 'Only the Founder can archive.' }, { status: 403 });
  }
  await db
    .update(projects)
    .set({ archivedAt: new Date(), status: 'archived' })
    .where(eq(projects.id, params.id));
  await audit({
    userId: user.id,
    action: 'project.archive',
    targetType: 'project',
    targetId: params.id,
    projectId: params.id,
  });
  return NextResponse.json({ ok: true });
}
