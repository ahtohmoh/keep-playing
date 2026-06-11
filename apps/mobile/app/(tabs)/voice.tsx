/**
 * Voice — the recorder as a primary surface (spec v1.1).
 * Records with expo-av, uploads via the same presigned flow the web uses.
 */
import { useRef, useState } from 'react';
import { View, Text, Pressable, SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import { api } from '@/lib/api';
import { THEME, PENCIL_FAINT } from '@/constants/Theme';

type Phase = 'idle' | 'recording' | 'uploading' | 'done' | 'error';

export default function Voice() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [seconds, setSeconds] = useState(0);
  const recRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  async function start() {
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) return;
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );
    recRef.current = recording;
    setSeconds(0);
    setPhase('recording');
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  async function stop() {
    clearInterval(timerRef.current);
    const rec = recRef.current;
    if (!rec) return;
    setPhase('uploading');
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      if (!uri) throw new Error('No recording URI');

      // Same flow as web: init -> presigned PUT -> queue transcription.
      const init = await api<{
        voiceNote: { id: string };
        upload: { uploadUrl: string; method: string };
      }>('/api/voice-notes', {
        method: 'POST',
        json: { durationSeconds: Math.max(1, seconds) },
      });

      const blob = await (await fetch(uri)).blob();
      const uploadUrl = init.upload.uploadUrl.startsWith('http')
        ? init.upload.uploadUrl
        : `${process.env.EXPO_PUBLIC_API_URL ?? 'https://app.keepplaying.studio'}${init.upload.uploadUrl}`;
      await fetch(uploadUrl, { method: 'PUT', body: blob });

      await api(`/api/voice-notes/${init.voiceNote.id}/transcribe`, { method: 'POST' });
      setPhase('done');
      setTimeout(() => setPhase('idle'), 2200);
    } catch {
      setPhase('error');
      setTimeout(() => setPhase('idle'), 2600);
    } finally {
      recRef.current = null;
    }
  }

  const recording = phase === 'recording';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 }}>
        <Text style={PENCIL_FAINT}>
          {phase === 'idle' && 'Thinking at the speed of speech'}
          {phase === 'recording' && `Recording · ${format(seconds)}`}
          {phase === 'uploading' && 'Uploading…'}
          {phase === 'done' && 'Saved. Transcribing.'}
          {phase === 'error' && 'Something slipped. Try again.'}
        </Text>

        <Pressable
          onPress={recording ? stop : start}
          disabled={phase === 'uploading'}
          style={({ pressed }) => ({
            width: 96,
            height: 96,
            borderRadius: 48,
            borderWidth: 1.5,
            borderColor: recording ? THEME.ink : THEME.hairlineStrong,
            backgroundColor: recording ? 'rgba(245,243,235,0.08)' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <View
            style={{
              width: recording ? 28 : 36,
              height: recording ? 28 : 36,
              borderRadius: recording ? 6 : 18,
              backgroundColor: THEME.ink,
            }}
          />
        </Pressable>

        <Text style={{ color: THEME.muted, fontSize: 13, textAlign: 'center', maxWidth: 260, lineHeight: 19 }}>
          {recording
            ? 'Tap to stop. The note uploads and transcribes itself.'
            : 'Tap to record a voice note. Attach it to a project later, or leave it standing alone.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

function format(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
