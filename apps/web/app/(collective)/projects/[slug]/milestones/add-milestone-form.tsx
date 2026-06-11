'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Textarea, Button } from '@keep-playing/ui';

export function AddMilestoneForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);
    const res = await fetch(`/api/projects/${projectId}/milestones`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: data.get('title'),
        description: data.get('description') || undefined,
        dueAt: data.get('dueAt') || undefined,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      form.reset();
      router.refresh();
    }
  }

  return (
    <Card className="mt-10">
      <h3 className="text-sm font-medium uppercase tracking-wide text-muted">
        Add a milestone
      </h3>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <Input name="title" required placeholder="e.g. Brief delivered" />
        <Textarea name="description" placeholder="Notes (optional)" />
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex-1 block">
            <span className="text-xs text-muted">Due (optional)</span>
            <Input type="date" name="dueAt" className="mt-1" />
          </label>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add milestone'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
