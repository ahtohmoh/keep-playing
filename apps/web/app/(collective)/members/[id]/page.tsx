import { notFound } from 'next/navigation';
import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { db, users } from '@keep-playing/db';
import { Heading, Prose, TierBadge } from '@keep-playing/ui';
import { TIER_LABEL, TIER_SHORT_DESCRIPTION } from '@keep-playing/shared';
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
        className="text-sm text-foreground-subtle hover:text-foreground transition-colors"
      >
        ← The Collective
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Heading level={2}>{m.displayName ?? m.fullName}</Heading>
          {m.displayName && m.fullName !== m.displayName && (
            <p className="mt-1 text-foreground-muted">{m.fullName}</p>
          )}
        </div>
        <TierBadge tier={m.tier} />
      </div>

      <Prose className="mt-6 text-foreground-muted max-w-2xl">
        <p>
          <span className="text-foreground">{TIER_LABEL[m.tier]}.</span>{' '}
          {TIER_SHORT_DESCRIPTION[m.tier]}
        </p>
      </Prose>

      <dl className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-sm">
        {m.craft && (
          <div>
            <dt className="text-foreground-subtle uppercase tracking-wide text-xs">Craft</dt>
            <dd className="mt-1 text-foreground">{m.craft}</dd>
          </div>
        )}
        {m.location && (
          <div>
            <dt className="text-foreground-subtle uppercase tracking-wide text-xs">Location</dt>
            <dd className="mt-1 text-foreground">{m.location}</dd>
          </div>
        )}
        <div>
          <dt className="text-foreground-subtle uppercase tracking-wide text-xs">Joined</dt>
          <dd className="mt-1 text-foreground">
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
          <h3 className="text-sm font-medium uppercase tracking-wide text-foreground-subtle mb-3">
            About
          </h3>
          <Prose>
            <p>{m.bio}</p>
          </Prose>
        </section>
      )}

      <section className="mt-14 border-t border-border pt-10">
        <h3 className="text-sm font-medium uppercase tracking-wide text-foreground-subtle mb-3">
          Legacy Plot
        </h3>
        <Prose className="text-foreground-muted max-w-2xl">
          <p>
            {isSelf ? 'Your' : `${m.displayName ?? m.fullName}'s`} Legacy Plot — projects shipped,
            artifacts touched, contributions made — appears here. Week 12 of the build.
          </p>
        </Prose>
      </section>
    </div>
  );
}
