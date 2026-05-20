import Link from 'next/link';
import { and, eq, isNotNull, asc } from 'drizzle-orm';
import { db, projects } from '@keep-playing/db';
import { Heading, Prose } from '@keep-playing/ui';
import { requireUser } from '@/lib/session';
import { ConstellationMap } from './constellation-map';

export default async function ConstellationPage() {
  await requireUser();

  const shipped = await db
    .select()
    .from(projects)
    .where(and(isNotNull(projects.artifactNumber), eq(projects.status, 'shipped')))
    .orderBy(asc(projects.artifactNumber));

  return (
    <div>
      <Heading level={2}>The Constellation</Heading>
      <Prose className="mt-3 text-foreground-muted max-w-2xl">
        <p>
          Every artifact AhTohMoh has shipped. Numbered, named, in motion. Each new arrival joins
          the constellation with quiet ceremony.
        </p>
      </Prose>

      {shipped.length === 0 ? (
        <p className="mt-10 text-foreground-muted text-sm">
          No shipped artifacts yet. The first one joins the constellation the moment its status
          becomes <span className="text-accent">shipped</span>.
        </p>
      ) : (
        <div className="mt-10">
          <ConstellationMap
            points={shipped.map((p) => ({
              id: p.id,
              slug: p.slug,
              title: p.title,
              artifactNumber: p.artifactNumber!,
              shippedAt: p.shippedAt?.toISOString() ?? null,
            }))}
          />

          <ul className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-3">
            {shipped.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/projects/${p.slug}`}
                  className="block rounded-lg border border-border bg-surface p-4 hover:border-border-emphasis transition-colors"
                >
                  <p>
                    <span className="font-mono text-accent mr-2">
                      · {String(p.artifactNumber!).padStart(3, '0')}
                    </span>
                    <span className="text-foreground">{p.title}</span>
                  </p>
                  {p.description && (
                    <p className="mt-1 text-sm text-foreground-muted">{p.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
