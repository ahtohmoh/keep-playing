import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, deliverables, projects } from '@keep-playing/db';
import { eq } from 'drizzle-orm';
import { can } from '@keep-playing/auth';
import { storage, deliverableKey, newObjectId } from '@keep-playing/storage';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';
import { getMembershipFor } from '@/lib/projects';

export const runtime = 'nodejs';

const initSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  milestoneId: z.string().uuid().optional(),
  filename: z.string().min(1).max(200),
  fileType: z.string().max(100).optional(),
  fileSize: z.number().int().nonnegative().optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser();
  const m = await getMembershipFor(params.id, user.id);
  if (
    !can('project.view', {
      userId: user.id,
      tier: user.tier,
      projectId: params.id,
      isProjectContributor: m.isContributor,
    })
  ) {
    return NextResponse.json({ title: 'Not visible.' }, { status: 403 });
  }
  const rows = await db.select().from(deliverables).where(eq(deliverables.projectId, params.id));
  return NextResponse.json({ deliverables: rows });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser();
  const m = await getMembershipFor(params.id, user.id);
  if (
    !can('deliverable.upload', {
      userId: user.id,
      tier: user.tier,
      projectId: params.id,
      isProjectContributor: m.isContributor,
      contributionRole: m.role ?? undefined,
    })
  ) {
    return NextResponse.json({ title: 'Not permitted.' }, { status: 403 });
  }
  const proj = await db.select().from(projects).where(eq(projects.id, params.id)).limit(1);
  if (proj.length === 0) return NextResponse.json({ title: 'Project not found.' }, { status: 404 });

  const body = await req.json();
  const parsed = initSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ title: 'Invalid input.', detail: parsed.error.message }, { status: 400 });
  }

  const deliverableId = newObjectId();
  const key = deliverableKey({
    projectId: params.id,
    deliverableId,
    version: 1,
    filename: parsed.data.filename,
  });

  const inserted = await db
    .insert(deliverables)
    .values({
      projectId: params.id,
      milestoneId: parsed.data.milestoneId,
      title: parsed.data.title,
      description: parsed.data.description,
      filePath: key,
      fileType: parsed.data.fileType,
      fileSize: parsed.data.fileSize,
      uploadedById: user.id,
    })
    .returning();
  const d = inserted[0]!;

  const upload = await storage().presignedUpload({ key, contentType: parsed.data.fileType });

  await audit({
    userId: user.id,
    action: 'deliverable.init',
    targetType: 'deliverable',
    targetId: d.id,
    payload: { projectId: params.id, title: parsed.data.title },
  });

  return NextResponse.json({ deliverable: d, upload });
}
