import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, templates, templateInstances } from '@keep-playing/db';
import { can } from '@keep-playing/auth';
import {
  renderTemplate,
  validateFilledData,
  type Template as TemplateDef,
  type FilledData,
} from '@keep-playing/templates';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const { user } = await requireUser();
  if (!can('template.use', { userId: user.id, tier: user.tier })) {
    return NextResponse.json({ title: 'Not permitted.' }, { status: 403 });
  }

  const rows = await db.select().from(templates).where(eq(templates.slug, params.slug)).limit(1);
  if (rows.length === 0) return NextResponse.json({ title: 'Template not found.' }, { status: 404 });
  const tmpl = rows[0]!;

  const body = (await req.json()) as { data: FilledData; projectId?: string };
  const def: TemplateDef = {
    slug: tmpl.slug,
    title: tmpl.title,
    body: tmpl.body,
    schema: tmpl.schema as TemplateDef['schema'],
  };

  const errors = validateFilledData(def, body.data ?? {});
  if (errors.length > 0) {
    return NextResponse.json({ title: 'Missing required fields.', errors }, { status: 400 });
  }

  const rendered = renderTemplate(tmpl.body, body.data ?? {});

  const inserted = await db
    .insert(templateInstances)
    .values({
      templateId: tmpl.id,
      projectId: body.projectId,
      filledData: body.data,
      generatedBody: rendered,
      createdById: user.id,
    })
    .returning();

  await audit({
    userId: user.id,
    action: 'template.generate',
    targetType: 'template',
    targetId: tmpl.id,
    payload: { slug: tmpl.slug, instanceId: inserted[0]!.id },
  });

  return NextResponse.json({ instance: inserted[0], body: rendered });
}
