import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';
import { db, milestones } from '@keep-playing/db';
import { Heading, Prose, TierBadge } from '@keep-playing/ui';
import { PROJECT_TYPE_LABEL } from '@keep-playing/shared';
import { can } from '@keep-playing/auth';
import { requireUser } from '@/lib/session';
import {
  getContributorsForProject,
  getMembershipFor,
  getProjectBySlug,
} from '@/lib/projects';
import { markProjectSeen } from '@/lib/catch-up';
import { MilestoneRow } from './milestone-row';

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const { user } = await requireUser();
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  const membership = await getMembershipFor(project.id, user.id);
  const visible = can('project.view', {
    userId: user.id,
    tier: user.tier,
    projectId: project.id,
    isProjectContributor: membership.isContributor,
  });
  if (!visible) redirect('/projects');

  // Catch-up marker — this visit resets "since you were here" for this project.
  await markProjectSeen(user.id, project.id);

  const [contributors, milestoneList] = await Promise.all([
    getContributorsForProject(project.id),
    db.select().from(milestones).where(eq(milestones.projectId, project.id)).orderBy(asc(milestones.orderIndex)),
  ]);

  const canEdit = can('project.edit', {
    userId: user.id,
    tier: user.tier,
    projectId: project.id,
    isProjectContributor: membership.isContributor,
    contributionRole: membership.role ?? undefined,
  });

  return (
    <div>
      <Link
        href="/projects"
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        ← Projects
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">
            {PROJECT_TYPE_LABEL[project.type]}
            {project.artifactNumber != null && (
              <span className="font-mono text-accent ml-2">
                · {String(project.artifactNumber).padStart(3, '0')}
              </span>
            )}
          </p>
          <Heading level={2} className="mt-1">
            {project.title}
          </Heading>
          {project.description && (
            <p className="mt-2 text-muted-strong max-w-2xl">{project.description}</p>
          )}
        </div>
        <span className="text-xs uppercase tracking-wide text-muted">
          {project.status}
        </span>
      </div>

      <nav className="mt-10 flex gap-6 text-sm border-b border-hairline pb-3">
        <span className="text-ink border-b-2 border-ink pb-3 -mb-3">Brief</span>
        <Link
          href={`/projects/${project.slug}/milestones`}
          className="text-muted-strong hover:text-ink transition-colors"
        >
          Milestones <span className="text-muted">{milestoneList.length}</span>
        </Link>
        <Link
          href={`/projects/${project.slug}/deliverables`}
          className="text-muted-strong hover:text-ink transition-colors"
        >
          Deliverables
        </Link>
        <Link
          href={`/projects/${project.slug}/activity`}
          className="text-muted-strong hover:text-ink transition-colors"
        >
          Activity
        </Link>
      </nav>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2">
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted mb-4">
            Brief
          </h3>
          {project.brief ? (
            <Prose>
              <p>{String((project.brief as { body?: string }).body ?? '')}</p>
            </Prose>
          ) : (
            <Prose className="text-muted-strong">
              <p>No brief written yet.</p>
              {canEdit && (
                <p>
                  <Link href={`/projects/${project.slug}/brief`} className="text-accent">
                    Write the brief →
                  </Link>
                </p>
              )}
            </Prose>
          )}

          {milestoneList.length > 0 && (
            <div className="mt-12">
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted mb-4">
                Next up
              </h3>
              <div className="space-y-2">
                {milestoneList.slice(0, 5).map((m) => (
                  <MilestoneRow key={m.id} milestone={m} canEdit={canEdit} />
                ))}
              </div>
            </div>
          )}
        </section>

        <aside>
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted mb-4">
            Contributors
          </h3>
          <ul className="space-y-3">
            {contributors.map((c) => (
              <li key={c.userId} className="flex items-center justify-between gap-2">
                <Link
                  href={`/members/${c.userId}`}
                  className="text-sm text-ink hover:text-accent transition-colors"
                >
                  {c.user.displayName ?? c.user.fullName}
                </Link>
                <span className="text-xs text-muted uppercase tracking-wide">
                  {c.role}
                </span>
              </li>
            ))}
          </ul>

          {project.targetShipDate && (
            <div className="mt-10">
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted mb-2">
                Target ship date
              </h3>
              <p className="text-ink">
                {new Date(project.targetShipDate).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          {project.externalPartnerName && (
            <div className="mt-10">
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted mb-2">
                Commissioning partner
              </h3>
              <p className="text-ink">{project.externalPartnerName}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
