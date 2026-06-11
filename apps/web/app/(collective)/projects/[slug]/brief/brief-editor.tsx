'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Textarea } from '@keep-playing/ui';

export function BriefEditor({
  projectId,
  slug,
  initialBody,
}: {
  projectId: string;
  slug: string;
  initialBody: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ brief: { body } }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 1800);
    }
  }

  return (
    <div className="mt-8 space-y-4">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={20}
        placeholder="Write the brief. Intent, deliverables, timeline, contributors, constraints."
        className="font-mono text-sm leading-relaxed"
      />
      <div className="flex items-center gap-3">
        <Button onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save brief'}
        </Button>
        {saved && <span className="text-sm text-accent">Saved.</span>}
        <a
          href={`/projects/${slug}`}
          className="text-sm text-muted hover:text-ink transition-colors ml-auto"
        >
          Back to project
        </a>
      </div>
    </div>
  );
}
