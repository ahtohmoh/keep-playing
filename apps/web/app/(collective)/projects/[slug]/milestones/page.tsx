import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';
import { db, milestones } from '@keep-playing/db';
import { Heading } from '@keep-playing/ui';
import { can } from '@keep-playing/auth';
import { requireUser } from '@/lib/session';
import { getMembershipFor, getProjectBySlug } from '@/lib/projects';
import { MilestoneRow } from '../milestone-row';
import { AddMilestoneForm } from './add-milestone-form';

export default async function MilestonesPage({ params }: { params: { slug: string } }) {
  const { user } = await requireUser();
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();
  const membership = await getMembershipFor(project.id, user.id);
  if (
    !can('project.view', {
      userId: user.id,
      tier: user.tier,
      projectId: project.id,
      isProjectContributor: membership.isContributor,
    })
  ) {
    redirect('/projects');
  }
  const canEdit = can('milestone.create', {
    userId: user.id,
    tier: user.tier,
    projectId: project.id,
    isProjectContributor: membership.isContributor,
    contributionRole: membership.role ?? undefined,
  });
  const list = await db
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, project.id))
    .orderBy(asc(milestones.orderIndex));

  return (
    <div>
      <Link
        href={`/projects/${project.slug}`}
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        ← {project.title}
      </Link>
      <Heading level={2} className="mt-4">
        Milestones
      </Heading>

      <div className="mt-8 space-y-3">
        {list.length === 0 ? (
          <p className="text-muted-strong text-sm">No milestones yet.</p>
        ) : (
          list.map((m) => <MilestoneRow key={m.id} milestone={m} canEdit={canEdit} />)
        )}
      </div>

      {canEdit && <AddMilestoneForm projectId={project.id} />}
    </div>
  );
}
