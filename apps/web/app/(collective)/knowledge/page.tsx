import Link from 'next/link';
import { asc } from 'drizzle-orm';
import { db, knowledgeDocs } from '@keep-playing/db';
import { Heading, Prose } from '@keep-playing/ui';
import { requireUser } from '@/lib/session';

const CATEGORY_LABEL: Record<string, string> = {
  founding: 'Founding documents',
  strategy: 'Strategy',
  agreements: 'Agreements',
  operations: 'Operations',
};
const CATEGORY_ORDER = ['founding', 'strategy', 'agreements', 'operations'];

export default async function KnowledgePage() {
  const { user } = await requireUser();
  if (user.tier === 'external_collaborator') {
    return (
      <div>
        <Heading level={2}>Knowledge</Heading>
        <Prose className="mt-3 text-foreground-muted">
          <p>The knowledge base is not visible to External Collaborators.</p>
        </Prose>
      </div>
    );
  }

  const rows = await db.select().from(knowledgeDocs).orderBy(asc(knowledgeDocs.title));
  // Tier visibility: if visibleToTiers is set, filter; else open to all logged-in.
  const visible = rows.filter((d) => {
    const tiers = d.visibleToTiers as string[] | null;
    if (!tiers) return true;
    return tiers.includes(user.tier);
  });

  const grouped = new Map<string, typeof visible>();
  for (const d of visible) {
    const cat = d.category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(d);
  }

  return (
    <div>
      <Heading level={2}>Knowledge</Heading>
      <Prose className="mt-3 text-foreground-muted max-w-2xl">
        <p>
          The foundational stack of AhTohMoh — the documents the practice descends from. These
          supersede the platform when they conflict.
        </p>
      </Prose>

      <div className="mt-12 space-y-10">
        {CATEGORY_ORDER.map((cat) => {
          const list = grouped.get(cat);
          if (!list || list.length === 0) return null;
          return (
            <section key={cat}>
              <h3 className="text-sm font-medium uppercase tracking-wide text-foreground-subtle mb-3">
                {CATEGORY_LABEL[cat] ?? cat}
              </h3>
              <ul className="space-y-2">
                {list.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/knowledge/${d.slug}`}
                      className="block rounded-md border border-border bg-surface px-4 py-3 hover:border-border-emphasis transition-colors"
                    >
                      <p className="text-foreground">{d.title}</p>
                      <p className="mt-1 text-xs text-foreground-subtle">
                        Updated{' '}
                        {new Date(d.updatedAt).toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                        {' · '}v{d.version}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {visible.length === 0 && (
          <p className="text-foreground-muted text-sm">
            No documents in the knowledge base yet. Run <code className="text-accent">pnpm db:seed</code>{' '}
            after dropping markdown files into <code>packages/db/seeds/knowledge/</code>.
          </p>
        )}
      </div>
    </div>
  );
}
