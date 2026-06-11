import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { db, users } from '@keep-playing/db';
import { Prose, TierBadge } from '@keep-playing/ui';
import { requireUser } from '@/lib/session';
import { WizardFrame } from '../wizard-frame';

export default async function PeopleStage() {
  const { user } = await requireUser();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.active, true))
    .orderBy(asc(users.fullName));
  const founder = rows.find((u) => u.tier === 'founder');
  const others = rows.filter((u) => u.tier !== 'founder' && u.id !== user.id);

  return (
    <WizardFrame step={4} title="The people." next="/onboarding/project" prev="/onboarding/practice">
      <Prose className="text-muted-strong">
        <p className="text-ink">The Collective is small and intentional.</p>
        <p>
          You will work with these people — sometimes closely, sometimes at a distance. Each carries
          a tier, a craft, and a relationship with the practice.
        </p>
      </Prose>

      {founder && (
        <section className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted mb-3">
            Founder
          </h2>
          <Link
            href={`/members/${founder.id}`}
            target="_blank"
            className="block rounded-lg border border-edge-strong bg-paper2 p-5 hover:border-ink transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-ink font-medium text-lg">
                {founder.displayName ?? founder.fullName}
              </p>
              <TierBadge tier="founder" />
            </div>
            {founder.craft && <p className="mt-2 text-sm text-muted-strong">{founder.craft}</p>}
          </Link>
        </section>
      )}

      {others.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted mb-3">
            The rest of the Collective
          </h2>
          <ul className="space-y-2">
            {others.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/members/${m.id}`}
                  target="_blank"
                  className="flex items-center justify-between gap-3 rounded-md border border-edge card-quiet px-4 py-3 hover:border-hairline transition-colors"
                >
                  <div>
                    <p className="text-ink">{m.displayName ?? m.fullName}</p>
                    {m.craft && <p className="mt-0.5 text-xs text-muted">{m.craft}</p>}
                  </div>
                  <TierBadge tier={m.tier} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Prose className="mt-10 text-muted-strong">
        <p>
          When you open Keep Playing in everyday work, this is where you find each other. Voice
          notes, comments, and shared projects do the rest.
        </p>
      </Prose>
    </WizardFrame>
  );
}
