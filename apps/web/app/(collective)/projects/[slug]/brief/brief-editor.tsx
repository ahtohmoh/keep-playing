'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Textarea } from '@keep-playing/ui';

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
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty = body !== initialBody;

  async function onSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        brief: { body },
        briefRevisionNote: note.trim() || undefined,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setNote('');
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
      {dirty && (
        <label className="block reveal">
          <span className="pencil-faint">Why this revision? (optional, becomes history)</span>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={300}
            placeholder="e.g. Narrowed the deliverables after the client call"
            className="mt-2"
          />
        </label>
      )}
      <div className="flex items-center gap-3">
        <Button onClick={onSave} disabled={saving || !dirty}>
          {saving ? 'Saving…' : 'Save brief'}
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
