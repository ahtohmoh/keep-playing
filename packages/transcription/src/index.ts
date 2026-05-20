/**
 * Voice note transcription via OpenAI Whisper.
 *
 * If OPENAI_API_KEY is not set, returns a stub transcription so dev flows
 * still complete end-to-end.
 */

export type TranscriptionResult =
  | { ok: true; text: string; durationSeconds?: number }
  | { ok: false; reason: string };

const WHISPER_ENDPOINT = 'https://api.openai.com/v1/audio/transcriptions';

export async function transcribeAudio(opts: {
  audio: Buffer | Blob;
  filename: string;
  contentType?: string;
  language?: string;
}): Promise<TranscriptionResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      ok: true,
      text: '[Dev mode: transcription stubbed. Set OPENAI_API_KEY to use Whisper.]',
    };
  }

  const model = process.env.TRANSCRIPTION_MODEL ?? 'whisper-1';
  const form = new FormData();
  const blob =
    opts.audio instanceof Blob
      ? opts.audio
      : new Blob([new Uint8Array(opts.audio)], { type: opts.contentType ?? 'audio/webm' });
  form.append('file', blob, opts.filename);
  form.append('model', model);
  if (opts.language) form.append('language', opts.language);

  const res = await fetch(WHISPER_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    return { ok: false, reason: `Whisper API error ${res.status}: ${detail.slice(0, 200)}` };
  }

  const data = (await res.json()) as { text?: string; duration?: number };
  return { ok: true, text: data.text ?? '', durationSeconds: data.duration };
}
