import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db, decisions, users } from '@keep-playing/db';
import { decisionCreateSchema } from '@keep-playing/shared';
import { can } from '@keep-playing/auth';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';
import { getMembershipFor } from '@/lib/projects';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser();
  const membership = await getMembershipFor(params.id, user.id);
  if (
    !can('decision.view', {
      userId: user.id,
      tier: user.tier,
      projectId: params.id,
      isProjectContributor: membership.isContributor,
    })
  ) {
    return NextResponse.json({ title: 'Not visible.' }, { status: 403 });
  }

  const rows = await db
    .select({ decision: decisions, deciderName: users.displayName, deciderFull: users.fullName })
    .from(decisions)
    .leftJoin(users, eq(decisions.decidedById, users.id))
    .where(eq(decisions.projectId, params.id))
    .orderBy(desc(decisions.decidedAt));

  return NextResponse.json({
    decisions: rows.map((r) => ({
      ...r.decision,
      deciderName: r.deciderName ?? r.deciderFull ?? null,
    })),
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser();
  const membership = await getMembershipFor(params.id, user.id);
  if (
    !can('decision.create', {
      userId: user.id,
      tier: user.tier,
      projectId: params.id,
      isProjectContributor: membership.isContributor,
      contributionRole: membership.role ?? undefined,
    })
  ) {
    return NextResponse.json({ title: 'Not permitted.' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = decisionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { title: 'Invalid decision.', detail: parsed.error.message },
      { status: 400 },
    );
  }

  // A reversal must point at a decision in the same project.
  if (parsed.data.reversesDecisionId) {
    const target = await db
      .select({ projectId: decisions.projectId })
      .from(decisions)
      .where(eq(decisions.id, parsed.data.reversesDecisionId))
      .limit(1);
    if (target.length === 0 || target[0]!.projectId !== params.id) {
      return NextResponse.json({ title: 'Reversed decision not found here.' }, { status: 400 });
    }
  }

  const inserted = await db
    .insert(decisions)
    .values({
      projectId: params.id,
      decidedById: user.id,
      title: parsed.data.title,
      rationale: parsed.data.rationale,
      reversesDecisionId: parsed.data.reversesDecisionId,
    })
    .returning();

  await audit({
    userId: user.id,
    action: 'decision.create',
    targetType: 'decision',
    targetId: inserted[0]!.id,
    projectId: params.id,
  });

  return NextResponse.json({ decision: inserted[0] }, { status: 201 });
}
