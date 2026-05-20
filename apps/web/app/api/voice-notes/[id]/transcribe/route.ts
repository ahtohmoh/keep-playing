import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, voiceNotes } from '@keep-playing/db';
import { can } from '@keep-playing/auth';
import { storage, localStore } from '@keep-playing/storage';
import { transcribeAudio } from '@keep-playing/transcription';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const maxDuration = 60; // seconds

async function fetchAudio(key: string): Promise<Buffer> {
  if (storage().backend === 'local') {
    return localStore.read(key);
  }
  const url = await storage().presignedDownload({ key, ttlSeconds: 60 });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not fetch audio: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser();
  if (!can('voicenote.transcribe', { userId: user.id, tier: user.tier })) {
    return NextResponse.json({ title: 'Not permitted.' }, { status: 403 });
  }
  const rows = await db.select().from(voiceNotes).where(eq(voiceNotes.id, params.id)).limit(1);
  if (rows.length === 0) return NextResponse.json({ title: 'Not found.' }, { status: 404 });
  const note = rows[0]!;

  if (note.transcriptionStatus === 'complete' && note.transcription) {
    return NextResponse.json({ voiceNote: note });
  }

  await db
    .update(voiceNotes)
    .set({ transcriptionStatus: 'processing', transcriptionRequestedAt: new Date() })
    .where(eq(voiceNotes.id, note.id));

  try {
    const audio = await fetchAudio(note.audioFilePath);
    const result = await transcribeAudio({ audio, filename: 'note.webm', contentType: 'audio/webm' });
    if (!result.ok) {
      await db
        .update(voiceNotes)
        .set({ transcriptionStatus: 'failed' })
        .where(eq(voiceNotes.id, note.id));
      return NextResponse.json({ title: result.reason }, { status: 502 });
    }
    const updated = await db
      .update(voiceNotes)
      .set({
        transcription: result.text,
        transcriptionStatus: 'complete',
        transcriptionCompletedAt: new Date(),
      })
      .where(eq(voiceNotes.id, note.id))
      .returning();
    await audit({
      userId: user.id,
      action: 'voicenote.transcribe',
      targetType: 'voice_note',
      targetId: note.id,
    });
    return NextResponse.json({ voiceNote: updated[0] });
  } catch (err) {
    await db
      .update(voiceNotes)
      .set({ transcriptionStatus: 'failed' })
      .where(eq(voiceNotes.id, note.id));
    return NextResponse.json({ title: (err as Error).message }, { status: 500 });
  }
}
