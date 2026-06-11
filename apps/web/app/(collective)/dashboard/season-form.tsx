'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@keep-playing/ui';

export function SeasonForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSaving(true);
    const res = await fetch('/api/seasons', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        theme: form.get('theme') || undefined,
        startsAt: form.get('startsAt'),
        endsAt: form.get('endsAt'),
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
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Name a season
      </Button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4 card-quiet rounded-lg p-5 max-w-md reveal">
      <label className="block">
        <span className="pencil-faint">Name</span>
        <Input name="name" required maxLength={120} placeholder="The First Spring" className="mt-2" />
      </label>
      <label className="block">
        <span className="pencil-faint">Theme (optional)</span>
        <Input name="theme" maxLength={300} className="mt-2" />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="pencil-faint">Starts</span>
          <Input name="startsAt" type="date" required className="mt-2" />
        </label>
        <label className="block">
          <span className="pencil-faint">Ends</span>
          <Input name="endsAt" type="date" required className="mt-2" />
        </label>
      </div>
      <div className="flex gap-3">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? 'Naming…' : 'Name it'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
