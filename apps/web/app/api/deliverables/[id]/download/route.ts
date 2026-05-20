import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, deliverables } from '@keep-playing/db';
import { can } from '@keep-playing/auth';
import { storage } from '@keep-playing/storage';
import { requireUser } from '@/lib/session';
import { getMembershipFor } from '@/lib/projects';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser();
  const rows = await db.select().from(deliverables).where(eq(deliverables.id, params.id)).limit(1);
  if (rows.length === 0) return NextResponse.json({ title: 'Not found.' }, { status: 404 });
  const d = rows[0]!;
  const m = await getMembershipFor(d.projectId, user.id);
  if (
    !can('project.view', {
      userId: user.id,
      tier: user.tier,
      projectId: d.projectId,
      isProjectContributor: m.isContributor,
    })
  ) {
    return NextResponse.json({ title: 'Not visible.' }, { status: 403 });
  }
  if (!d.filePath) return NextResponse.json({ title: 'No file.' }, { status: 404 });
  const url = await storage().presignedDownload({ key: d.filePath });
  return NextResponse.redirect(url, { status: 302 });
}
