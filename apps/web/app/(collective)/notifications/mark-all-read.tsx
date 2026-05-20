'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function MarkAllRead() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    setBusy(false);
    router.refresh();
  }
  return (
    <button
      onClick={go}
      disabled={busy}
      className="text-sm text-foreground-muted hover:text-foreground transition-colors"
    >
      Mark all read
    </button>
  );
}
