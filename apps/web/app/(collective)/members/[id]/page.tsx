import { notFound } from 'next/navigation';
import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { db, projectContributors, projects, users } from '@keep-playing/db';
import { Heading, Prose, TierBadge } from '@keep-playing/ui';
import { TIER_LABEL, TIER_SHORT_DESCRIPTION, PROJECT_TYPE_LABEL } from '@keep-playing/shared';
import { requireUser } from '@/lib/session';

export default async function MemberPage({ params }: { params: { id: string } }) {
  const { user: viewer } = await requireUser();
  const rows = await db.select().from(users).where(eq(users.id, params.id)).limit(1);
  if (rows.length === 0) notFound();
  const m = rows[0]!;
  const isSelf = viewer.id === m.id;

  return (
    <div>
      <Link
        href="/members"
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        ← The Collective
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Heading level={2}>{m.displayName ?? m.fullName}</Heading>
          {m.displayName && m.fullName !== m.displayName && (
            <p className="mt-1 text-muted-strong">{m.fullName}</p>
          )}
        </div>
        <TierBadge tier={m.tier} />
      </div>

      <Prose className="mt-6 text-muted-strong max-w-2xl">
        <p>
          <span className="text-ink">{TIER_LABEL[m.tier]}.</span>{' '}
          {TIER_SHORT_DESCRIPTION[m.tier]}
        </p>
      </Prose>

      <dl className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-sm">
        {m.craft && (
          <div>
            <dt className="text-muted uppercase tracking-wide text-xs">Craft</dt>
            <dd className="mt-1 text-ink">{m.craft}</dd>
          </div>
        )}
        {m.location && (
          <div>
            <dt className="text-muted uppercase tracking-wide text-xs">Location</dt>
            <dd className="mt-1 text-ink">{m.location}</dd>
          </div>
        )}
        <div>
          <dt className="text-muted uppercase tracking-wide text-xs">Joined</dt>
          <dd className="mt-1 text-ink">
            {new Date(m.joinedAt).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </dd>
        </div>
      </dl>

      {m.bio && (
        <section className="mt-10 max-w-2xl">
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted mb-3">
            About
          </h3>
          <Prose>
            <p>{m.bio}</p>
          </Prose>
        </section>
      )}

      <section className="mt-14 border-t border-hairline pt-10">
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted mb-3">
          Legacy Plot
        </h3>
        <LegacyPlot userId={m.id} isSelf={isSelf} fallbackName={m.displayName ?? m.fullName} />
      </section>
    </div>
  );
}

async function LegacyPlot({
  userId,
  isSelf,
  fallbackName,
}: {
  userId: string;
  isSelf: boolean;
  fallbackName: string;
}) {
  const rows = await db
    .select({ project: projects, role: projectContributors.role, joinedAt: projectContributors.joinedAt })
    .from(projectContributors)
    .innerJoin(projects, eq(projectContributors.projectId, projects.id))
    .where(eq(projectContributors.userId, userId))
    .orderBy(desc(projectContributors.joinedAt));

  if (rows.length === 0) {
    return (
      <Prose className="text-muted-strong max-w-2xl">
        <p>
          {isSelf ? 'Your' : `${fallbackName}'s`} Plot will grow with each project shipped, each
          artifact touched, each contribution made.
        </p>
      </Prose>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map(({ project: p, role, joinedAt }) => (
        <Link
          key={p.id}
          href={`/projects/${p.slug}`}
          className="block rounded-md border border-edge card-quiet px-4 py-3 hover:border-hairline transition-colors"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-ink">
              {p.artifactNumber != null && (
                <span className="font-mono text-accent mr-2">
                  · {String(p.artifactNumber).padStart(3, '0')}
                </span>
              )}
              {p.title}
            </p>
            <span className="text-xs uppercase tracking-wide text-muted">
              {role} · {p.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {PROJECT_TYPE_LABEL[p.type]} ·{' '}
            {new Date(joinedAt).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'short',
            })}
          </p>
        </Link>
      ))}
    </div>
  );
}
