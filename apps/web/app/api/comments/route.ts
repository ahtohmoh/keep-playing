import { NextResponse } from 'next/server';
import { and, asc, eq } from 'drizzle-orm';
import { db, comments, deliverables, milestones, voiceNotes } from '@keep-playing/db';
import { commentCreateSchema } from '@keep-playing/shared';
import { can } from '@keep-playing/auth';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';
import { getMembershipFor } from '@/lib/projects';

export const runtime = 'nodejs';

async function projectForTarget(
  type: 'project' | 'deliverable' | 'milestone' | 'voice_note',
  id: string,
): Promise<string | null> {
  if (type === 'project') return id;
  if (type === 'deliverable') {
    const r = await db.select({ p: deliverables.projectId }).from(deliverables).where(eq(deliverables.id, id)).limit(1);
    return r[0]?.p ?? null;
  }
  if (type === 'milestone') {
    const r = await db.select({ p: milestones.projectId }).from(milestones).where(eq(milestones.id, id)).limit(1);
    return r[0]?.p ?? null;
  }
  if (type === 'voice_note') {
    const r = await db
      .select({ t: voiceNotes.targetType, i: voiceNotes.targetId })
      .from(voiceNotes)
      .where(eq(voiceNotes.id, id))
      .limit(1);
    if (!r[0]) return null;
    if (r[0].t === 'project' && r[0].i) return r[0].i;
    return null;
  }
  return null;
}

export async function GET(req: Request) {
  const { user } = await requireUser();
  const url = new URL(req.url);
  const targetType = url.searchParams.get('targetType') as 'project' | 'deliverable' | 'milestone' | 'voice_note' | null;
  const targetId = url.searchParams.get('targetId');
  if (!targetType || !targetId) {
    return NextResponse.json({ title: 'targetType and targetId required.' }, { status: 400 });
  }
  const projectId = await projectForTarget(targetType, targetId);
  const m = projectId ? await getMembershipFor(projectId, user.id) : { isContributor: false, role: null };
  if (
    projectId &&
    !can('project.view', {
      userId: user.id,
      tier: user.tier,
      projectId,
      isProjectContributor: m.isContributor,
    })
  ) {
    return NextResponse.json({ title: 'Not visible.' }, { status: 403 });
  }
  const rows = await db
    .select()
    .from(comments)
    .where(and(eq(comments.targetType, targetType), eq(comments.targetId, targetId)))
    .orderBy(asc(comments.createdAt));
  return NextResponse.json({ comments: rows });
}

export async function POST(req: Request) {
  const { user } = await requireUser();
  const body = await req.json();
  const parsed = commentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ title: 'Invalid input.', detail: parsed.error.message }, { status: 400 });
  }
  const projectId = await projectForTarget(parsed.data.targetType, parsed.data.targetId);
  if (!projectId) return NextResponse.json({ title: 'Target not found.' }, { status: 404 });

  const m = await getMembershipFor(projectId, user.id);
  if (
    !can('comment.create', {
      userId: user.id,
      tier: user.tier,
      projectId,
      isProjectContributor: m.isContributor,
    })
  ) {
    return NextResponse.json({ title: 'Not permitted.' }, { status: 403 });
  }

  const inserted = await db
    .insert(comments)
    .values({
      authorId: user.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      body: parsed.data.body,
      parentCommentId: parsed.data.parentCommentId,
    })
    .returning();

  await audit({
    userId: user.id,
    action: 'comment.create',
    targetType: parsed.data.targetType,
    targetId: parsed.data.targetId,
    projectId,
  });

  return NextResponse.json({ comment: inserted[0] }, { status: 201 });
}
