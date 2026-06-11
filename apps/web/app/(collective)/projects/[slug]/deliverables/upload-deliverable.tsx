'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Textarea, Button } from '@keep-playing/ui';

export function UploadDeliverable({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setError('Choose a file first.');
      return;
    }
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const initRes = await fetch(`/api/projects/${projectId}/deliverables`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: form.get('title'),
        description: form.get('description') || undefined,
        filename: file.name,
        fileType: file.type || undefined,
        fileSize: file.size,
      }),
    });
    if (!initRes.ok) {
      setError('Could not initialise upload.');
      setSubmitting(false);
      return;
    }
    const { upload } = (await initRes.json()) as {
      upload: { uploadUrl: string; method: 'PUT' | 'POST'; headers?: Record<string, string> };
    };

    const putRes = await fetch(upload.uploadUrl, {
      method: upload.method,
      headers: upload.headers,
      body: file,
    });
    if (!putRes.ok) {
      setError('Upload failed.');
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setFile(null);
    (e.currentTarget as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <Card className="mt-10">
      <h3 className="text-sm font-medium uppercase tracking-wide text-muted">
        Upload a deliverable
      </h3>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <Input name="title" required placeholder="Title (e.g. Brief v3)" />
        <Textarea name="description" placeholder="Notes (optional)" />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-ink file:mr-4 file:rounded-md file:border-0 file:bg-paper2 file:px-4 file:py-2 file:text-sm file:text-ink hover:file:bg-border"
        />
        {error && <p className="text-sm text-ink">{error}</p>}
        <Button type="submit" disabled={submitting || !file}>
          {submitting ? 'Uploading...' : 'Upload'}
        </Button>
      </form>
    </Card>
  );
}
