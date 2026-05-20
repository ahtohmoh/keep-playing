'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Refresh the server component list when a new voice note is recorded.
 * Hooks into the global custom event emitted by VoiceNoteRecorder.
 */
export function VoicePageRefresh() {
  const router = useRouter();
  useEffect(() => {
    const handler = () => router.refresh();
    window.addEventListener('kp:voice-note-recorded', handler);
    return () => window.removeEventListener('kp:voice-note-recorded', handler);
  }, [router]);
  return null;
}
