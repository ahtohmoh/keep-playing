import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, templates } from '@keep-playing/db';
import { Heading, Prose } from '@keep-playing/ui';
import { requireUser } from '@/lib/session';
import type { TemplateSchema } from '@keep-playing/templates';
import { TemplateForm } from './template-form';

export default async function TemplatePage({ params }: { params: { slug: string } }) {
  await requireUser();
  const rows = await db.select().from(templates).where(eq(templates.slug, params.slug)).limit(1);
  if (rows.length === 0) notFound();
  const t = rows[0]!;
  const schema = t.schema as TemplateSchema;

  return (
    <div className="max-w-3xl">
      <Link
        href="/templates"
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        ← Templates
      </Link>
      <Heading level={2} className="mt-4">
        {t.title}
      </Heading>
      {t.description && (
        <Prose className="mt-3 text-muted-strong">
          <p>{t.description}</p>
        </Prose>
      )}
      <TemplateForm slug={t.slug} schema={schema} />
    </div>
  );
}
