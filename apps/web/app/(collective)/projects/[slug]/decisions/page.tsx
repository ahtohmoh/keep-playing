import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { db, decisions, users } from '@keep-playing/db';
import { Heading, Prose } from '@keep-playing/ui';
import { can } from '@keep-playing/auth';
import { requireUser } from '@/lib/session';
import { getMembershipFor, getProjectBySlug } from '@/lib/projects';
import { DecisionForm } from './decision-form';

export default async function DecisionsPage({ params }: { params: { slug: string } }) {
  const { user } = await requireUser();
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();
  const membership = await getMembershipFor(project.id, user.id);

  const canView = can('decision.view', {
    userId: user.id,
    tier: user.tier,
    projectId: project.id,
    isProjectContributor: membership.isContributor,
  });
  if (!canView) redirect('/projects');

  const canCreate = can('decision.create', {
    userId: user.id,
    tier: user.tier,
    projectId: project.id,
    isProjectContributor: membership.isContributor,
    contributionRole: membership.role ?? undefined,
  });

  const rows = await db
    .select({ d: decisions, name: users.displayName, full: users.fullName })
    .from(decisions)
    .leftJoin(users, eq(decisions.decidedById, users.id))
    .where(eq(decisions.projectId, project.id))
    .orderBy(desc(decisions.decidedAt));

  const titleById = new Map(rows.map((r) => [r.d.id, r.d.title]));

  return (
    <div className="max-w-3xl">
      <Link
        href={`/projects/${project.slug}`}
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        ← {project.title}
      </Link>
      <Heading level={2} className="mt-4">
        Decisions
      </Heading>
      <Prose className="mt-3 text-muted-strong">
        <p>
          Decisions taken and decisions reversed. Both are texture. Record what was decided, in
          your own words, when it happens.
        </p>
      </Prose>

      {canCreate && (
        <DecisionForm
          projectId={project.id}
          priorDecisions={rows.map((r) => ({ id: r.d.id, title: r.d.title }))}
        />
      )}

      <ol className="mt-12 space-y-px">
        {rows.length === 0 ? (
          <p className="text-sm text-muted">No decisions recorded yet.</p>
        ) : (
          rows.map(({ d, name, full }) => (
            <li
              key={d.id}
              className="border-l border-edge hover:border-hairline-strong pl-5 py-4 transition-colors"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-ink">{d.title}</p>
                <span className="meta shrink-0">
                  {new Date(d.decidedAt).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              {d.reversesDecisionId && (
                <p className="mt-1.5 pencil-faint">
                  Reverses: {titleById.get(d.reversesDecisionId) ?? 'an earlier decision'}
                </p>
              )}
              {d.rationale && <p className="mt-2 text-sm text-muted-strong">{d.rationale}</p>}
              <p className="mt-2 text-xs text-muted">{name ?? full ?? 'Unknown'}</p>
            </li>
          ))
        )}
      </ol>
    </div>
  );
}
