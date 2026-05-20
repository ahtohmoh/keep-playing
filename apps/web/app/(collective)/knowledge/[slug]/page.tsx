import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, knowledgeDocs } from '@keep-playing/db';
import { Prose } from '@keep-playing/ui';
import { requireUser } from '@/lib/session';
import { renderMarkdown } from '@/lib/markdown';

export default async function KnowledgeDocPage({ params }: { params: { slug: string } }) {
  const { user } = await requireUser();
  if (user.tier === 'external_collaborator') notFound();
  const rows = await db.select().from(knowledgeDocs).where(eq(knowledgeDocs.slug, params.slug)).limit(1);
  if (rows.length === 0) notFound();
  const doc = rows[0]!;

  const tiers = doc.visibleToTiers as string[] | null;
  if (tiers && !tiers.includes(user.tier)) notFound();

  const html = renderMarkdown(doc.body);

  return (
    <article className="max-w-prose">
      <Link
        href="/knowledge"
        className="text-sm text-foreground-subtle hover:text-foreground transition-colors"
      >
        ← Knowledge
      </Link>
      <Prose
        className="mt-6"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <p className="mt-12 text-xs text-foreground-subtle">
        Version {doc.version} · Updated{' '}
        {new Date(doc.updatedAt).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
    </article>
  );
}
