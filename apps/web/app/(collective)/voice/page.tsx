import { desc, eq } from 'drizzle-orm';
import { db, voiceNotes, users } from '@keep-playing/db';
import { Heading, Prose } from '@keep-playing/ui';
import { requireUser } from '@/lib/session';
import { VoiceNoteRecorder } from '@/components/voice-note-recorder';
import { VoicePageRefresh } from './refresh';

export default async function VoicePage() {
  const { user } = await requireUser();

  const my = await db
    .select({ note: voiceNotes, author: users })
    .from(voiceNotes)
    .innerJoin(users, eq(voiceNotes.authorId, users.id))
    .where(eq(voiceNotes.authorId, user.id))
    .orderBy(desc(voiceNotes.createdAt))
    .limit(50);

  return (
    <div className="max-w-2xl">
      <Heading level={2}>Voice</Heading>
      <Prose className="mt-3 text-foreground-muted">
        <p>
          Capture thinking at the speed of speech. Voice notes are transcribed on demand and stay
          attached to the work.
        </p>
      </Prose>

      <div className="mt-8">
        <VoiceNoteRecorder />
        <VoicePageRefresh />
      </div>

      <h3 className="mt-14 text-sm font-medium uppercase tracking-wide text-foreground-subtle">
        Your notes
      </h3>
      <ul className="mt-4 space-y-3">
        {my.length === 0 ? (
          <li className="text-sm text-foreground-muted">No notes yet.</li>
        ) : (
          my.map(({ note }) => (
            <li key={note.id} className="rounded-md border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-3 text-xs text-foreground-subtle">
                <span>
                  {new Date(note.createdAt).toLocaleString()} · {note.durationSeconds}s
                </span>
                <span className="uppercase tracking-wide">{note.transcriptionStatus}</span>
              </div>
              {note.transcription && (
                <p className="mt-3 text-sm text-foreground whitespace-pre-wrap">
                  {note.transcription}
                </p>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
