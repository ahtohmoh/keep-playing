'use client';
import { useEffect, useRef, useState } from 'react';
import { Button, Card } from '@keep-playing/ui';

type Status = 'idle' | 'recording' | 'uploading' | 'transcribing' | 'done' | 'error';

export function VoiceNoteRecorder({
  targetType,
  targetId,
  onDone,
}: {
  targetType?: 'project' | 'deliverable' | 'milestone' | 'comment';
  targetId?: string;
  onDone?: (noteId: string, transcription: string | null) => void;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [seconds, setSeconds] = useState(0);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function start() {
    setError(null);
    setTranscription(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = onStop;
      recorder.start();
      recorderRef.current = recorder;
      setStatus('recording');
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err) {
      setError(`Microphone not available: ${(err as Error).message}`);
      setStatus('error');
    }
  }

  function stop() {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (timerRef.current) clearInterval(timerRef.current);
  }

  async function onStop() {
    setStatus('uploading');
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

    try {
      // 1. Get presigned URL
      const initRes = await fetch('/api/voice-notes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          durationSeconds: seconds,
          targetType,
          targetId,
        }),
      });
      if (!initRes.ok) throw new Error('Could not initialise voice note.');
      const init = (await initRes.json()) as {
        voiceNote: { id: string };
        upload: { uploadUrl: string; method: 'PUT' | 'POST'; headers?: Record<string, string> };
      };

      // 2. Upload audio
      const putRes = await fetch(init.upload.uploadUrl, {
        method: init.upload.method,
        headers: init.upload.headers,
        body: blob,
      });
      if (!putRes.ok) throw new Error('Upload failed.');

      // 3. Transcribe
      setStatus('transcribing');
      const tRes = await fetch(`/api/voice-notes/${init.voiceNote.id}/transcribe`, {
        method: 'POST',
      });
      if (!tRes.ok) throw new Error('Transcription failed.');
      const tData = (await tRes.json()) as { voiceNote: { transcription: string | null } };
      setTranscription(tData.voiceNote.transcription);
      setStatus('done');
      onDone?.(init.voiceNote.id, tData.voiceNote.transcription);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kp:voice-note-recorded'));
      }
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }
  }

  function reset() {
    setStatus('idle');
    setSeconds(0);
    setTranscription(null);
    setError(null);
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-ink">Voice note</h3>
          <p className="mt-1 text-xs text-muted-strong">
            {status === 'recording'
              ? 'Recording. Stop when you&apos;re done.'
              : status === 'uploading'
                ? 'Uploading...'
                : status === 'transcribing'
                  ? 'Transcribing...'
                  : status === 'done'
                    ? `${seconds}s recorded.`
                    : status === 'error'
                      ? error
                      : 'Capture thinking at the speed of speech.'}
          </p>
        </div>
        {status === 'idle' && <Button onClick={start}>Record</Button>}
        {status === 'recording' && (
          <Button variant="danger" onClick={stop}>
            Stop ({formatTime(seconds)})
          </Button>
        )}
        {(status === 'uploading' || status === 'transcribing') && (
          <Button disabled>{status === 'uploading' ? 'Uploading...' : 'Transcribing...'}</Button>
        )}
        {(status === 'done' || status === 'error') && (
          <Button variant="secondary" onClick={reset}>
            New note
          </Button>
        )}
      </div>

      {transcription && (
        <div className="mt-4 rounded-md border border-edge bg-paper p-3 text-sm text-muted-strong whitespace-pre-wrap">
          {transcription}
        </div>
      )}
    </Card>
  );
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}
