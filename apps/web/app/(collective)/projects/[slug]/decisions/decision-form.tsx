'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Textarea } from '@keep-playing/ui';

export function DecisionForm({
  projectId,
  priorDecisions,
}: {
  projectId: string;
  priorDecisions: Array<{ id: string; title: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSaving(true);
    const res = await fetch(`/api/projects/${projectId}/decisions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: form.get('title'),
        rationale: form.get('rationale') || undefined,
        reversesDecisionId: form.get('reversesDecisionId') || undefined,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <div className="mt-8">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Record a decision
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5 card-quiet rounded-lg p-6 reveal">
      <label className="block">
        <span className="pencil-faint">What was decided</span>
        <Input
          name="title"
          required
          maxLength={300}
          placeholder="e.g. Ship the kente engine as a web demo, not a video"
          className="mt-2"
        />
      </label>
      <label className="block">
        <span className="pencil-faint">Why (optional)</span>
        <Textarea
          name="rationale"
          maxLength={4000}
          rows={3}
          placeholder="The reasoning, in your own words."
          className="mt-2"
        />
      </label>
      {priorDecisions.length > 0 && (
        <label className="block">
          <span className="pencil-faint">Reverses an earlier decision (optional)</span>
          <select
            name="reversesDecisionId"
            defaultValue=""
            className="mt-2 h-10 w-full bg-transparent text-ink border-b border-hairline focus:border-ink focus:outline-none"
          >
            <option value="">No</option>
            {priorDecisions.map((d) => (
              <option key={d.id} value={d.id} className="bg-paper text-ink">
                {d.title}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Recording…' : 'Record'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
