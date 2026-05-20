/**
 * Template engine for Keep Playing.
 *
 * Supports a small, opinionated syntax:
 *
 *   {{field}}                    simple substitution
 *   {{#each items}}...{{/each}}  iteration; inside the block, {{this}} = current item
 *   {{#if field}}...{{/if}}      conditional (truthy)
 *
 * No nested helpers beyond this. Stage 2 can swap to Handlebars proper if
 * richer logic is needed.
 */

export type TemplateField =
  | { type: 'string'; label: string; placeholder?: string; format?: 'textarea' }
  | { type: 'array'; label: string; items: { type: 'string' } };

export type TemplateSchema = {
  type: 'object';
  required?: string[];
  properties: Record<string, TemplateField>;
};

export type Template = {
  slug: string;
  title: string;
  category?: string;
  description?: string;
  schema: TemplateSchema;
  body: string;
};

export type FilledData = Record<string, string | string[] | undefined>;

/** Validate that required fields are present. */
export function validateFilledData(template: Template, data: FilledData): string[] {
  const errors: string[] = [];
  for (const req of template.schema.required ?? []) {
    const v = data[req];
    if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) {
      errors.push(`Field "${req}" is required.`);
    }
  }
  return errors;
}

/** Render a template body with the filled data. */
export function renderTemplate(body: string, data: FilledData): string {
  let out = body;

  // {{#each name}}...{{/each}}
  out = out.replace(
    /\{\{#each\s+([a-zA-Z0-9_]+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_m, key: string, inner: string) => {
      const items = data[key];
      if (!Array.isArray(items)) return '';
      return items
        .map((it) =>
          inner
            .replace(/\{\{this\}\}/g, String(it ?? ''))
            .replace(/\{\{\.\}\}/g, String(it ?? '')),
        )
        .join('');
    },
  );

  // {{#if name}}...{{/if}}
  out = out.replace(
    /\{\{#if\s+([a-zA-Z0-9_]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_m, key: string, inner: string) => {
      const v = data[key];
      if (v == null) return '';
      if (typeof v === 'string' && v.trim() === '') return '';
      if (Array.isArray(v) && v.length === 0) return '';
      return inner;
    },
  );

  // {{field}}
  out = out.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key: string) => {
    const v = data[key];
    if (v == null) return '';
    if (Array.isArray(v)) return v.join(', ');
    return String(v);
  });

  return out;
}
