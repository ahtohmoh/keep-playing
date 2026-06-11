import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { db, pipelineEntries, users } from '@keep-playing/db';
import { Heading, Prose } from '@keep-playing/ui';
import { requireUser } from '@/lib/session';
import { PipelineList } from './pipeline-list';

export default async function PipelinePage() {
  const { user } = await requireUser();

  let entries;
  if (user.tier === 'founder') {
    entries = await db
      .select({ e: pipelineEntries, correspondent: users })
      .from(pipelineEntries)
      .innerJoin(users, eq(pipelineEntries.correspondentId, users.id))
      .orderBy(desc(pipelineEntries.updatedAt));
  } else if (user.tier === 'correspondent') {
    entries = await db
      .select({ e: pipelineEntries, correspondent: users })
      .from(pipelineEntries)
      .innerJoin(users, eq(pipelineEntries.correspondentId, users.id))
      .where(eq(pipelineEntries.correspondentId, user.id))
      .orderBy(desc(pipelineEntries.updatedAt));
  } else {
    redirect('/home');
  }

  return (
    <div>
      <Heading level={2}>Pipeline</Heading>
      <Prose className="mt-3 text-muted-strong max-w-2xl">
        <p>
          {user.tier === 'founder'
            ? 'Every Correspondent pipeline entry in one view. Acknowledge those that need a signal.'
            : 'Track counterparties, conversations, and outcomes. The Founder sees what you flag here.'}
        </p>
      </Prose>

      <PipelineList
        viewerTier={user.tier}
        entries={entries.map(({ e, correspondent }) => ({
          ...e,
          correspondentName: correspondent.displayName ?? correspondent.fullName,
          nextActionDueAt: e.nextActionDueAt?.toISOString() ?? null,
          acknowledgedByFounderAt: e.acknowledgedByFounderAt?.toISOString() ?? null,
          createdAt: e.createdAt.toISOString(),
          updatedAt: e.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
