import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db, projectContributors } from '@keep-playing/db';
import { projectContributorAddSchema } from '@keep-playing/shared';
import { can } from '@keep-playing/auth';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';
import { getMembershipFor } from '@/lib/projects';

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: { id: string } }) {
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

  const body = await req.json();
  const parsed = projectContributorAddSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ title: 'Invalid input.' }, { status: 400 });
  }

  const exists = await db
    .select()
    .from(projectContributors)
    .where(
      and(
        eq(projectContributors.projectId, params.id),
        eq(projectContributors.userId, parsed.data.userId),
      ),
    )
    .limit(1);

  if (exists.length > 0) {
    // Update role if already a contributor.
    await db
      .update(projectContributors)
      .set({ role: parsed.data.role, leftAt: null })
      .where(
        and(
          eq(projectContributors.projectId, params.id),
          eq(projectContributors.userId, parsed.data.userId),
        ),
      );
  } else {
    await db.insert(projectContributors).values({
      projectId: params.id,
      userId: parsed.data.userId,
      role: parsed.data.role,
    });
  }

  await audit({
    userId: user.id,
    action: 'project.contributor.add',
    targetType: 'project',
    targetId: params.id,
    payload: { userId: parsed.data.userId, role: parsed.data.role },
  });

  return NextResponse.json({ ok: true });
}
