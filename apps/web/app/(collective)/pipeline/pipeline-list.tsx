'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, Textarea } from '@keep-playing/ui';
import type { Tier } from '@keep-playing/shared';

type Entry = {
  id: string;
  correspondentId: string;
  correspondentName: string;
  counterpartyName: string;
  counterpartyType: string | null;
  status: string;
  originationLevel: string | null;
  expectedOutcome: string | null;
  nextAction: string | null;
  nextActionDueAt: string | null;
  notes: string | null;
  acknowledgedByFounderAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUSES = ['identified', 'in_conversation', 'proposal', 'closed', 'lost'] as const;

const STATUS_LABEL: Record<(typeof STATUSES)[number], string> = {
  identified: 'Identified',
  in_conversation: 'In conversation',
  proposal: 'Proposal',
  closed: 'Closed',
  lost: 'Lost',
};

export function PipelineList({
  viewerTier,
  entries,
}: {
  viewerTier: Tier;
  entries: Entry[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function ack(id: string) {
    await fetch(`/api/pipeline/${id}/acknowledge`, { method: 'POST' });
    router.refresh();
  }

  async function createEntry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    const res = await fetch('/api/pipeline', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        counterpartyName: form.get('counterpartyName'),
        counterpartyType: form.get('counterpartyType') || undefined,
        status: form.get('status'),
        expectedOutcome: form.get('expectedOutcome') || undefined,
        nextAction: form.get('nextAction') || undefined,
        notes: form.get('notes') || undefined,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setShowForm(false);
      router.refresh();
    }
  }

  const grouped = new Map<string, Entry[]>();
  for (const e of entries) {
    if (!grouped.has(e.status)) grouped.set(e.status, []);
    grouped.get(e.status)!.push(e);
  }

  return (
    <div className="mt-10">
      {viewerTier === 'correspondent' && (
        <div className="mb-8">
          {!showForm ? (
            <Button onClick={() => setShowForm(true)}>New entry</Button>
          ) : (
            <Card>
              <form className="space-y-3" onSubmit={createEntry}>
                <Input name="counterpartyName" required placeholder="Counterparty name" />
                <select
                  name="counterpartyType"
                  defaultValue=""
                  className="h-10 w-full rounded-md border border-edge card-quiet px-3 text-base text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
                >
                  <option value="">Type (optional)</option>
                  <option value="investor">Investor</option>
                  <option value="strategic">Strategic</option>
                  <option value="regulator">Regulator</option>
                  <option value="commercial">Commercial</option>
                </select>
                <select
                  name="status"
                  defaultValue="identified"
                  className="h-10 w-full rounded-md border border-edge card-quiet px-3 text-base text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
                <Input name="expectedOutcome" placeholder="Expected outcome (optional)" />
                <Input name="nextAction" placeholder="Next action (optional)" />
                <Textarea name="notes" placeholder="Notes" />
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-muted-strong text-sm">Nothing in the pipeline yet.</p>
      ) : (
        <div className="space-y-10">
          {STATUSES.map((s) => {
            const list = grouped.get(s) ?? [];
            if (list.length === 0) return null;
            return (
              <section key={s}>
                <h3 className="text-sm font-medium uppercase tracking-wide text-muted mb-3">
                  {STATUS_LABEL[s]}
                  <span className="ml-2 text-muted">· {list.length}</span>
                </h3>
                <div className="space-y-3">
                  {list.map((e) => (
                    <Card key={e.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <div>
                          <p className="text-ink font-medium">{e.counterpartyName}</p>
                          {viewerTier === 'founder' && (
                            <p className="mt-1 text-xs text-muted">
                              {e.correspondentName}
                              {e.counterpartyType && ` · ${e.counterpartyType}`}
                            </p>
                          )}
                        </div>
                        {viewerTier === 'founder' && !e.acknowledgedByFounderAt && (
                          <Button type="button" variant="secondary" onClick={() => ack(e.id)}>
                            Acknowledge
                          </Button>
                        )}
                        {e.acknowledgedByFounderAt && (
                          <span className="text-xs text-accent">Acknowledged</span>
                        )}
                      </div>
                      {(e.expectedOutcome || e.nextAction || e.notes) && (
                        <div className="mt-3 space-y-1 text-sm text-muted-strong">
                          {e.expectedOutcome && (
                            <p>
                              <span className="text-muted">Outcome: </span>
                              {e.expectedOutcome}
                            </p>
                          )}
                          {e.nextAction && (
                            <p>
                              <span className="text-muted">Next: </span>
                              {e.nextAction}
                            </p>
                          )}
                          {e.notes && <p className="text-muted-strong">{e.notes}</p>}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
