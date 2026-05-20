'use client';
import { useState } from 'react';
import { Button, Card, Input, Textarea } from '@keep-playing/ui';
import type { TemplateSchema, FilledData } from '@keep-playing/templates';

export function TemplateForm({ slug, schema }: { slug: string; schema: TemplateSchema }) {
  const [data, setData] = useState<FilledData>({});
  const [arrayDrafts, setArrayDrafts] = useState<Record<string, string>>({});
  const [generated, setGenerated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function setField(name: string, value: string | string[]) {
    setData((d) => ({ ...d, [name]: value }));
  }

  function addArrayItem(name: string) {
    const draft = (arrayDrafts[name] ?? '').trim();
    if (!draft) return;
    const current = (data[name] as string[] | undefined) ?? [];
    setField(name, [...current, draft]);
    setArrayDrafts((s) => ({ ...s, [name]: '' }));
  }

  function removeArrayItem(name: string, idx: number) {
    const current = (data[name] as string[] | undefined) ?? [];
    setField(
      name,
      current.filter((_, i) => i !== idx),
    );
  }

  async function generate() {
    setError(null);
    setBusy(true);
    const res = await fetch(`/api/templates/${slug}/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    setBusy(false);
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { title?: string; errors?: string[] };
      setError(err.errors?.join(', ') ?? err.title ?? 'Could not generate.');
      return;
    }
    const result = (await res.json()) as { body: string };
    setGenerated(result.body);
  }

  return (
    <div className="mt-8 space-y-6">
      {Object.entries(schema.properties).map(([name, field]) => {
        const required = schema.required?.includes(name);
        if (field.type === 'string') {
          return (
            <label key={name} className="block">
              <span className="text-sm text-foreground-muted">
                {field.label}
                {required && <span className="text-accent ml-1">*</span>}
              </span>
              {field.format === 'textarea' ? (
                <Textarea
                  value={(data[name] as string | undefined) ?? ''}
                  onChange={(e) => setField(name, e.target.value)}
                  placeholder={field.placeholder}
                  className="mt-1"
                />
              ) : (
                <Input
                  value={(data[name] as string | undefined) ?? ''}
                  onChange={(e) => setField(name, e.target.value)}
                  placeholder={field.placeholder}
                  className="mt-1"
                />
              )}
            </label>
          );
        }
        // array
        const items = (data[name] as string[] | undefined) ?? [];
        return (
          <div key={name}>
            <span className="text-sm text-foreground-muted">
              {field.label}
              {required && <span className="text-accent ml-1">*</span>}
            </span>
            {items.length > 0 && (
              <ul className="mt-2 space-y-1">
                {items.map((it, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm"
                  >
                    <span>{it}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem(name, i)}
                      className="text-foreground-subtle hover:text-danger"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2 flex gap-2">
              <Input
                value={arrayDrafts[name] ?? ''}
                onChange={(e) => setArrayDrafts((s) => ({ ...s, [name]: e.target.value }))}
                placeholder="Add an item"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArrayItem(name);
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={() => addArrayItem(name)}>
                Add
              </Button>
            </div>
          </div>
        );
      })}

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button onClick={generate} disabled={busy}>
        {busy ? 'Generating...' : 'Generate'}
      </Button>

      {generated && (
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-foreground-subtle">
              Generated
            </h3>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(generated)}
            >
              Copy
            </Button>
          </div>
          <pre className="mt-4 whitespace-pre-wrap font-mono text-sm text-foreground-muted">
            {generated}
          </pre>
        </Card>
      )}
    </div>
  );
}
