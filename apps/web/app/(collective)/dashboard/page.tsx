import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and, asc, count, eq, isNotNull, lt, ne } from 'drizzle-orm';
import {
  db,
  milestones,
  projects,
  users,
  pipelineEntries,
  notifications,
} from '@keep-playing/db';
import { Heading, Prose, TierBadge } from '@keep-playing/ui';
import { TIER_LABEL, PROJECT_TYPE_LABEL } from '@keep-playing/shared';
import { requireUser } from '@/lib/session';
import { currentSeason, seasonProgress } from '@/lib/seasons';

export default async function FounderDashboard() {
  const { user } = await requireUser();
  if (user.tier !== 'founder') redirect('/');

  const season = currentSeason();
  const progress = Math.round(seasonProgress() * 100);

  const [
    activeProjects,
    overdueMilestones,
    upcomingMilestones,
    unackPipeline,
    memberCount,
    recentActivity,
  ] = await Promise.all([
    db.select().from(projects).where(eq(projects.status, 'active')).orderBy(asc(projects.updatedAt)),
    db
      .select({ ms: milestones, p: projects })
      .from(milestones)
      .innerJoin(projects, eq(milestones.projectId, projects.id))
      .where(
        and(
          ne(milestones.status, 'complete'),
          isNotNull(milestones.dueAt),
          lt(milestones.dueAt, new Date()),
        ),
      )
      .orderBy(asc(milestones.dueAt))
      .limit(8),
    db
      .select({ ms: milestones, p: projects })
      .from(milestones)
      .innerJoin(projects, eq(milestones.projectId, projects.id))
      .where(and(ne(milestones.status, 'complete'), isNotNull(milestones.dueAt)))
      .orderBy(asc(milestones.dueAt))
      .limit(8),
    db
      .select({ pl: pipelineEntries, c: users })
      .from(pipelineEntries)
      .innerJoin(users, eq(pipelineEntries.correspondentId, users.id))
      .where(and(ne(pipelineEntries.status, 'closed'), ne(pipelineEntries.status, 'lost'))),
    db.select({ c: count() }).from(users).where(eq(users.active, true)),
    db
      .select({ c: count() })
      .from(notifications)
      .where(eq(notifications.userId, user.id)),
  ]);

  return (
    <div>
      <Heading level={2}>Founder dashboard</Heading>
      <Prose className="mt-3 text-foreground-muted">
        <p>
          {season.name}. {progress}% through. The practice in one view.
        </p>
      </Prose>

      <dl className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Active projects" value={activeProjects.length} />
        <Stat label="Overdue milestones" value={overdueMilestones.length} tone={overdueMilestones.length > 0 ? 'warning' : 'plain'} />
        <Stat label="Collective" value={memberCount[0]?.c ?? 0} />
        <Stat label="Pipeline" value={unackPipeline.length} />
      </dl>

      <section className="mt-14">
        <h3 className="text-sm font-medium uppercase tracking-wide text-foreground-subtle mb-3">
          Overdue milestones
        </h3>
        {overdueMilestones.length === 0 ? (
          <p className="text-foreground-muted text-sm">Nothing overdue.</p>
        ) : (
          <ul className="space-y-2">
            {overdueMilestones.map(({ ms, p }) => (
              <li
                key={ms.id}
                className="flex items-baseline justify-between gap-3 rounded-md border border-warning/30 bg-surface px-4 py-3"
              >
                <div>
                  <Link
                    href={`/projects/${p.slug}/milestones`}
                    className="text-foreground hover:text-accent transition-colors"
                  >
                    {ms.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-foreground-subtle">{p.title}</p>
                </div>
                <span className="text-xs text-warning">
                  due{' '}
                  {ms.dueAt &&
                    new Date(ms.dueAt).toLocaleDateString('en-GB', {
                      month: 'short',
                      day: 'numeric',
                    })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-14">
        <h3 className="text-sm font-medium uppercase tracking-wide text-foreground-subtle mb-3">
          Coming up
        </h3>
        {upcomingMilestones.length === 0 ? (
          <p className="text-foreground-muted text-sm">No upcoming deadlines.</p>
        ) : (
          <ul className="space-y-2">
            {upcomingMilestones.map(({ ms, p }) => (
              <li
                key={ms.id}
                className="flex items-baseline justify-between gap-3 rounded-md border border-border bg-surface px-4 py-3"
              >
                <div>
                  <Link
                    href={`/projects/${p.slug}/milestones`}
                    className="text-foreground hover:text-accent transition-colors"
                  >
                    {ms.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-foreground-subtle">{p.title}</p>
                </div>
                <span className="text-xs text-foreground-subtle">
                  {ms.dueAt &&
                    new Date(ms.dueAt).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-14">
        <h3 className="text-sm font-medium uppercase tracking-wide text-foreground-subtle mb-3">
          Active projects
        </h3>
        <ul className="space-y-2">
          {activeProjects.map((p) => (
            <li
              key={p.id}
              className="flex items-baseline justify-between gap-3 rounded-md border border-border bg-surface px-4 py-3"
            >
              <Link
                href={`/projects/${p.slug}`}
                className="text-foreground hover:text-accent transition-colors"
              >
                {p.title}
              </Link>
              <span className="text-xs text-foreground-subtle">{PROJECT_TYPE_LABEL[p.type]}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h3 className="text-sm font-medium uppercase tracking-wide text-foreground-subtle mb-3">
          Pipeline awaiting acknowledgement
        </h3>
        {unackPipeline.length === 0 ? (
          <p className="text-foreground-muted text-sm">All caught up.</p>
        ) : (
          <ul className="space-y-2">
            {unackPipeline.slice(0, 8).map(({ pl, c }) => (
              <li
                key={pl.id}
                className="flex items-baseline justify-between gap-3 rounded-md border border-border bg-surface px-4 py-3"
              >
                <div>
                  <Link
                    href="/pipeline"
                    className="text-foreground hover:text-accent transition-colors"
                  >
                    {pl.counterpartyName}
                  </Link>
                  <p className="mt-0.5 text-xs text-foreground-subtle">
                    {c.displayName ?? c.fullName} · {pl.status.replace('_', ' ')}
                  </p>
                </div>
                {pl.acknowledgedByFounderAt && (
                  <TierBadge tier={user.tier} />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = 'plain',
}: {
  label: string;
  value: number | string;
  tone?: 'plain' | 'warning';
}) {
  return (
    <div
      className={`rounded-lg border p-5 ${tone === 'warning' ? 'border-warning/40 bg-surface' : 'border-border bg-surface'}`}
    >
      <p className="text-xs uppercase tracking-wide text-foreground-subtle">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
