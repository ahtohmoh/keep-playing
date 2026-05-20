import Link from 'next/link';
import { asc, inArray } from 'drizzle-orm';
import { db, knowledgeDocs } from '@keep-playing/db';
import { Prose } from '@keep-playing/ui';
import { requireUser } from '@/lib/session';
import { WizardFrame } from '../wizard-frame';

/**
 * Stage 3 of the Wizard.
 *
 * Per the brief: "A guided read through the Founding Document, the Profile,
 * and the Brand Strategy. Not in summary. In full." The Wizard frames the
 * read but does not replace it.
 */
const REQUIRED_READS = ['platform-brief', 'build-spec', 'founding-document', 'company-profile', 'brand-strategy'];

export default async function PracticeStage() {
  await requireUser();
  const available = await db
    .select({ slug: knowledgeDocs.slug, title: knowledgeDocs.title, category: knowledgeDocs.category })
    .from(knowledgeDocs)
    .where(inArray(knowledgeDocs.slug, REQUIRED_READS))
    .orderBy(asc(knowledgeDocs.title));

  return (
    <WizardFrame step={3} title="The practice." next="/onboarding/people" prev="/onboarding/tier">
      <Prose className="text-foreground-muted">
        <p className="text-foreground">Read these in order. Not in summary. In full.</p>
        <p>
          The practice does not live in the platform. It lives in these documents and in the work
          that flows from them. The platform is downstream of both.
        </p>
      </Prose>

      <ol className="mt-10 space-y-3 list-decimal pl-6">
        {available.length === 0 ? (
          <Prose className="text-foreground-muted">
            <p>
              The foundational documents have not been seeded yet. Drop them into{' '}
              <code>packages/db/seeds/knowledge/</code> and run <code>pnpm db:seed</code>. Then
              continue.
            </p>
          </Prose>
        ) : (
          available.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/knowledge/${d.slug}`}
                target="_blank"
                className="text-accent hover:opacity-80 transition-opacity"
              >
                {d.title}
              </Link>
              <p className="text-sm text-foreground-subtle mt-1">{d.category}</p>
            </li>
          ))
        )}
      </ol>

      <Prose className="mt-10 text-foreground-muted">
        <p>
          When you have read them, come back here and continue. We will not stop you, but the
          practice will catch you out later if you skip this.
        </p>
      </Prose>
    </WizardFrame>
  );
}
