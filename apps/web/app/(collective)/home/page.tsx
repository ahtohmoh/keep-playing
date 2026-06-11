import Link from 'next/link';
import { count, eq } from 'drizzle-orm';
import { db, projects, users } from '@keep-playing/db';
import { Heading, Prose } from '@keep-playing/ui';
import { TIER_SHORT_DESCRIPTION } from '@keep-playing/shared';
import { requireUser } from '@/lib/session';
import { currentSeason } from '@/lib/seasons';
import { catchUp } from '@/lib/catch-up';

export default async function CollectiveHome() {
  const { user } = await requireUser();

  const [activeProjects, members, items] = await Promise.all([
    db.select({ c: count() }).from(projects).where(eq(projects.status, 'active')),
    db.select({ c: count() }).from(users).where(eq(users.active, true)),
    catchUp(user),
  ]);

  return (
    <div>
      <Heading level={2}>
        {greeting()}, {user.displayName ?? user.fullName.split(' ')[0]}.
      </Heading>
      <Prose className="mt-3 text-muted-strong max-w-2xl">
        <p>{TIER_SHORT_DESCRIPTION[user.tier]}</p>
      </Prose>

      {/* The async loop — since you were here. */}
      <section className="mt-12">
        <h3 className="pencil mb-4">Since you were here</h3>
        {items.length === 0 ? (
          <p className="text-sm text-muted">
            Nothing moved while you were away. The practice is quiet.
          </p>
        ) : (
          <ul className="space-y-px">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.projectSlug ? `/projects/${item.projectSlug}` : '/projects'}
                  className="group flex items-baseline justify-between gap-4 border-l border-edge hover:border-hairline-strong pl-4 py-2.5 transition-colors"
                >
                  <span className="text-sm min-w-0">
                    <span className="text-ink">{item.actorName ?? 'Someone'}</span>{' '}
                    <span className="text-muted">{item.summary}</span>
                    {item.projectTitle && (
                      <>
                        {' '}
                        <span className="text-muted">on</span>{' '}
                        <span className="text-muted-strong group-hover:text-ink transition-colors">
                          {item.projectTitle}
                        </span>
                      </>
                    )}
                  </span>
                  <span className="meta shrink-0">{timeAgo(item.at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <dl className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Active projects" value={activeProjects[0]?.c ?? 0} href="/projects" />
        <Stat label="Collective" value={members[0]?.c ?? 0} href="/members" />
        <Stat
          label="Season"
          value={currentSeason().name.replace(/^The /, '')}
          href={null}
        />
        <Stat label="Tier" value={user.tier.replace('_', ' ')} href={null} />
      </dl>

      {user.tier === 'founder' && (
        <section className="mt-14 border-t border-edge pt-8">
          <h3 className="pencil mb-4">Founder actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/members/invite" className="cta-secondary">
              Invite a member
            </Link>
            <Link href="/projects/new" className="cta-secondary">
              Start a project
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
    <div className="rounded-lg card-quiet p-5 h-full">
      <p className="pencil-faint">{label}</p>
      <p className="mt-2 text-2xl font-light capitalize tabular-nums">{value}</p>
    </div>
  );
  if (href)
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  return inner;
}

function timeAgo(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(d).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 18) return 'Afternoon';
  return 'Evening';
}
