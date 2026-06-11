import { NextResponse } from 'next/server';
import { db, voiceNotes } from '@keep-playing/db';
import { voiceNoteInitSchema } from '@keep-playing/shared';
import { can } from '@keep-playing/auth';
import { storage, voiceNoteKey, newObjectId } from '@keep-playing/storage';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { user } = await requireUser();
  if (!can('voicenote.create', { userId: user.id, tier: user.tier })) {
    return NextResponse.json({ title: 'Not permitted.' }, { status: 403 });
  }
  const body = await req.json();
  const parsed = voiceNoteInitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ title: 'Invalid input.', detail: parsed.error.message }, { status: 400 });
  }

  const noteId = newObjectId();
  const key = voiceNoteKey(noteId, 'webm');

  // Insert DB row first; presigned upload is single-use, so client must follow up.
  const inserted = await db
    .insert(voiceNotes)
    .values({
      authorId: user.id,
      audioFilePath: key,
      durationSeconds: parsed.data.durationSeconds,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
    })
    .returning();
  const note = inserted[0]!;

  const upload = await storage().presignedUpload({ key, contentType: 'audio/webm' });

  await audit({
    userId: user.id,
    action: 'voicenote.create',
    targetType: 'voice_note',
    targetId: note.id,
    projectId: parsed.data.targetType === 'project' ? parsed.data.targetId : undefined,
  });

  return NextResponse.json({ voiceNote: note, upload });
}
