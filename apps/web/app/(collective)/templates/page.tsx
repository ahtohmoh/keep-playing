import Link from 'next/link';
import { asc } from 'drizzle-orm';
import { db, templates } from '@keep-playing/db';
import { Heading, Prose } from '@keep-playing/ui';
import { can } from '@keep-playing/auth';
import { requireUser } from '@/lib/session';

export default async function TemplatesPage() {
  const { user } = await requireUser();
  if (!can('template.use', { userId: user.id, tier: user.tier })) {
    return (
      <div>
        <Heading level={2}>Templates</Heading>
        <Prose className="mt-3 text-muted-strong">
          <p>The template library isn&apos;t visible to your tier.</p>
        </Prose>
      </div>
    );
  }
  const rows = await db.select().from(templates).orderBy(asc(templates.title));

  return (
    <div>
      <Heading level={2}>Templates</Heading>
      <Prose className="mt-3 text-muted-strong max-w-2xl">
        <p>
          Briefs, proposals, concept notes, status reports. Generate from a template, fill the
          fields, get a draft in the practice&apos;s voice.
        </p>
      </Prose>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map((t) => (
          <Link
            key={t.id}
            href={`/templates/${t.slug}`}
            className="block rounded-lg border border-edge card-quiet p-5 hover:border-hairline transition-colors"
          >
            <p className="text-ink font-medium">{t.title}</p>
            {t.description && (
              <p className="mt-1 text-sm text-muted-strong">{t.description}</p>
            )}
            {t.category && (
              <p className="mt-2 text-xs text-muted uppercase tracking-wide">
                {t.category}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
