'use client';
import { useState } from 'react';
import { Button, Card, Input } from '@keep-playing/ui';
import { TIER_LABEL, TIERS, type Tier } from '@keep-playing/shared';

export function InviteForm() {
  const [tier, setTier] = useState<Tier>('fellow');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ inviteUrl: string; expiresAt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);

    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/invite', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        fullName: form.get('fullName'),
        displayName: form.get('displayName') || undefined,
        tier,
        craft: form.get('craft') || undefined,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { title?: string };
      setError(data.title ?? 'Could not issue invitation.');
      return;
    }

    const data = (await res.json()) as { inviteUrl: string; expiresAt: string };
    setResult(data);
  }

  if (result) {
    return (
      <Card className="mt-8">
        <p className="text-foreground">Invitation ready.</p>
        <p className="mt-2 text-sm text-foreground-muted">
          Share this link directly. It expires{' '}
          {new Date(result.expiresAt).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          .
        </p>
        <pre className="mt-4 overflow-x-auto rounded-md bg-background p-3 text-xs text-foreground-muted border border-border">
          {result.inviteUrl}
        </pre>
        <div className="mt-4 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigator.clipboard.writeText(result.inviteUrl)}
          >
            Copy link
          </Button>
          <Button type="button" variant="ghost" onClick={() => setResult(null)}>
            Issue another
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm text-foreground-muted">Full name</span>
          <Input name="fullName" required placeholder="e.g. Chineyenwa Okoro-Onu" className="mt-1" />
        </label>
        <label className="block">
          <span className="text-sm text-foreground-muted">Display name (optional)</span>
          <Input name="displayName" placeholder="e.g. Chineyenwa" className="mt-1" />
        </label>
        <label className="block">
          <span className="text-sm text-foreground-muted">Email</span>
          <Input type="email" name="email" required className="mt-1" />
        </label>
        <label className="block">
          <span className="text-sm text-foreground-muted">Tier</span>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as Tier)}
            className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-base text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          >
            {TIERS.filter((t) => t !== 'founder').map((t) => (
              <option key={t} value={t}>
                {TIER_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-foreground-muted">Craft (optional)</span>
          <Input name="craft" placeholder="e.g. Visualisation" className="mt-1" />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Issuing...' : 'Issue invitation'}
        </Button>
      </form>
    </Card>
  );
}
