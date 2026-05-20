import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { db, users } from '@keep-playing/db';
import { Heading, Prose, TierBadge } from '@keep-playing/ui';
import { TIER_LABEL, TIERS, type Tier } from '@keep-playing/shared';
import { requireUser } from '@/lib/session';

export default async function MembersPage() {
  await requireUser();

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.active, true))
    .orderBy(asc(users.fullName));

  const grouped = new Map<Tier, typeof rows>(TIERS.map((t) => [t, [] as typeof rows]));
  for (const u of rows) {
    grouped.get(u.tier)!.push(u);
  }

  return (
    <div>
      <Heading level={2}>The Collective</Heading>
      <Prose className="mt-3 text-foreground-muted">
        <p>
          {rows.length} {rows.length === 1 ? 'member' : 'members'}. People appear here in
          proportion to the depth of their relationship with the practice.
        </p>
      </Prose>

      <div className="mt-12 space-y-12">
        {TIERS.map((tier) => {
          const list = grouped.get(tier)!;
          if (list.length === 0) return null;
          return (
            <section key={tier}>
              <h3 className="text-sm font-medium uppercase tracking-wide text-foreground-subtle mb-4">
                {TIER_LABEL[tier]}
                <span className="ml-2 text-foreground-subtle">· {list.length}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((m) => (
                  <Link
                    key={m.id}
                    href={`/members/${m.id}`}
                    className="block rounded-lg border border-border bg-surface p-5 hover:border-border-emphasis transition-colors duration-quick"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-foreground">
                        {m.displayName ?? m.fullName}
                      </span>
                      <TierBadge tier={m.tier} />
                    </div>
                    {m.craft && (
                      <p className="mt-2 text-sm text-foreground-muted">{m.craft}</p>
                    )}
                    {m.location && (
                      <p className="mt-1 text-xs text-foreground-subtle">{m.location}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
