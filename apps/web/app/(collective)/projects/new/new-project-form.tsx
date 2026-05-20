'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Textarea, Button } from '@keep-playing/ui';
import { PROJECT_TYPE_LABEL, PROJECT_TYPES, type ProjectType } from '@keep-playing/shared';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

export function NewProjectForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [type, setType] = useState<ProjectType>('internal_investigation');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function onTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title,
        slug,
        type,
        description: form.get('description') || undefined,
        targetShipDate: form.get('targetShipDate') || undefined,
        isExternalCommission: type === 'commissioned_engagement',
        externalPartnerName: form.get('externalPartnerName') || undefined,
      }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { title?: string };
      setError(data.title ?? 'Could not create the project.');
      setSubmitting(false);
      return;
    }
    const data = (await res.json()) as { slug: string };
    router.push(`/projects/${data.slug}`);
  }

  return (
    <Card className="mt-8">
      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm text-foreground-muted">Title</span>
          <Input
            required
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. Kente Logic v2"
            className="mt-1"
          />
        </label>
        <label className="block">
          <span className="text-sm text-foreground-muted">Slug</span>
          <Input
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="kente-logic-v2"
            className="mt-1 font-mono"
          />
        </label>
        <label className="block">
          <span className="text-sm text-foreground-muted">Type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ProjectType)}
            className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-base text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          >
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {PROJECT_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-foreground-muted">Short description (optional)</span>
          <Textarea name="description" placeholder="One or two sentences." className="mt-1" />
        </label>
        {type === 'commissioned_engagement' && (
          <label className="block">
            <span className="text-sm text-foreground-muted">Commissioning partner</span>
            <Input name="externalPartnerName" placeholder="e.g. The Met" className="mt-1" />
          </label>
        )}
        <label className="block">
          <span className="text-sm text-foreground-muted">Target ship date (optional)</span>
          <Input type="date" name="targetShipDate" className="mt-1" />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Opening...' : 'Open project'}
        </Button>
      </form>
    </Card>
  );
}
