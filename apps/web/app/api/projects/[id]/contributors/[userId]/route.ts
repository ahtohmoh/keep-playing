import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db, projectContributors } from '@keep-playing/db';
import { can } from '@keep-playing/auth';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';
import { getMembershipFor } from '@/lib/projects';

export const runtime = 'nodejs';

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; userId: string } },
) {
  const { user } = await requireUser();
  const m = await getMembershipFor(params.id, user.id);
  if (
    !can('project.edit', {
      userId: user.id,
      tier: user.tier,
      projectId: params.id,
      isProjectContributor: m.isContributor,
      contributionRole: m.role ?? undefined,
    })
  ) {
    return NextResponse.json({ title: 'Not permitted.' }, { status: 403 });
  }
  await db
    .delete(projectContributors)
    .where(
      and(
        eq(projectContributors.projectId, params.id),
        eq(projectContributors.userId, params.userId),
      ),
    );
  await audit({
    userId: user.id,
    action: 'project.contributor.remove',
    targetType: 'project',
    targetId: params.id,
    projectId: params.id,
    payload: { userId: params.userId },
  });
  return NextResponse.json({ ok: true });
}
