import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, pipelineEntries } from '@keep-playing/db';
import { notify } from '@keep-playing/notifications';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser();
  if (user.tier !== 'founder') {
    return NextResponse.json({ title: 'Founder only.' }, { status: 403 });
  }
  const updated = await db
    .update(pipelineEntries)
    .set({ acknowledgedByFounderAt: new Date() })
    .where(eq(pipelineEntries.id, params.id))
    .returning();
  if (updated[0]) {
    await notify(updated[0].correspondentId, {
      type: 'pipeline_acknowledged',
      title: 'Pipeline entry acknowledged.',
      body: updated[0].counterpartyName,
      link: '/pipeline',
      sendEmail: true, sendWhatsApp: true,
    });
  }
  await audit({
    userId: user.id,
    action: 'pipeline.acknowledge',
    targetType: 'pipeline_entry',
    targetId: params.id,
  });
  return NextResponse.json({ entry: updated[0] });
}
