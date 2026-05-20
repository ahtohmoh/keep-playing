import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, voiceNotes } from '@keep-playing/db';
import { storage } from '@keep-playing/storage';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await requireUser();
  const rows = await db.select().from(voiceNotes).where(eq(voiceNotes.id, params.id)).limit(1);
  if (rows.length === 0) return NextResponse.json({ title: 'Not found.' }, { status: 404 });
  return NextResponse.json({ voiceNote: rows[0] });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser();
  const rows = await db.select().from(voiceNotes).where(eq(voiceNotes.id, params.id)).limit(1);
  if (rows.length === 0) return NextResponse.json({ title: 'Not found.' }, { status: 404 });
  const note = rows[0]!;
  if (note.authorId !== user.id && user.tier !== 'founder') {
    return NextResponse.json({ title: 'Not permitted.' }, { status: 403 });
  }
  await storage().delete(note.audioFilePath).catch(() => undefined);
  await db.delete(voiceNotes).where(eq(voiceNotes.id, params.id));
  await audit({
    userId: user.id,
    action: 'voicenote.delete',
    targetType: 'voice_note',
    targetId: params.id,
  });
  return NextResponse.json({ ok: true });
}
