import Link from 'next/link';
import { count, eq } from 'drizzle-orm';
import { db, projects, users } from '@keep-playing/db';
import { Heading, Prose } from '@keep-playing/ui';
import { TIER_SHORT_DESCRIPTION } from '@keep-playing/shared';
import { requireUser } from '@/lib/session';
import { currentSeason } from '@/lib/seasons';

export default async function CollectiveHome() {
  const { user } = await requireUser();

  const [activeProjects, members] = await Promise.all([
    db.select({ c: count() }).from(projects).where(eq(projects.status, 'active')),
    db.select({ c: count() }).from(users).where(eq(users.active, true)),
  ]);

  return (
    <div>
      <Heading level={2}>
        {greeting()}, {user.displayName ?? user.fullName.split(' ')[0]}.
      </Heading>
      <Prose className="mt-3 text-foreground-muted max-w-2xl">
        <p>{TIER_SHORT_DESCRIPTION[user.tier]}</p>
      </Prose>

      <dl className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        <Stat label="Active projects" value={activeProjects[0]?.c ?? 0} href="/projects" />
        <Stat label="Collective members" value={members[0]?.c ?? 0} href="/members" />
        <Stat label="Voice notes" value="—" href={null} />
        <Stat label="Current season" value={currentSeason().name.replace(/^The /, '')} href={null} />
      </dl>

      {user.tier === 'founder' && (
        <section className="mt-14 border-t border-border pt-10">
          <h3 className="text-sm font-medium uppercase tracking-wide text-foreground-subtle mb-3">
            Founder actions
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/members/invite"
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm hover:border-border-emphasis transition-colors"
            >
              Invite a member
            </Link>
            <Link
              href="/projects/new"
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm hover:border-border-emphasis transition-colors"
            >
              Start a new project
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number | string;
  href: string | null;
}) {
  const inner = (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-xs uppercase tracking-wide text-foreground-subtle">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
    </div>
  );
  if (href)
    return (
      <Link href={href} className="block hover:border-border-emphasis">
        {inner}
      </Link>
    );
  return inner;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 18) return 'Afternoon';
  return 'Evening';
}
