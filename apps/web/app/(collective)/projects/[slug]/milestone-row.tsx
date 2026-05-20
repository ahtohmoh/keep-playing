'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Milestone } from '@keep-playing/db';

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In motion',
  complete: 'Complete',
  overdue: 'Overdue',
};

export function MilestoneRow({
  milestone,
  canEdit,
}: {
  milestone: Milestone;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!canEdit || busy) return;
    setBusy(true);
    const next = milestone.status === 'complete' ? 'pending' : 'complete';
    const res = await fetch(`/api/milestones/${milestone.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) startTransition(() => router.refresh());
  }

  const isDone = milestone.status === 'complete';

  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-surface px-4 py-3">
      <button
        type="button"
        onClick={toggle}
        disabled={!canEdit || busy}
        aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          isDone
            ? 'border-accent bg-accent text-background'
            : 'border-border-emphasis bg-transparent text-transparent hover:border-accent'
        } transition-colors`}
      >
        {isDone ? '✓' : ''}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${isDone ? 'text-foreground-muted line-through decoration-foreground-subtle' : 'text-foreground'}`}
        >
          {milestone.title}
        </p>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-foreground-subtle">
          <span>{statusLabel[milestone.status]}</span>
          {milestone.dueAt && (
            <span>
              Due{' '}
              {new Date(milestone.dueAt).toLocaleDateString('en-GB', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
