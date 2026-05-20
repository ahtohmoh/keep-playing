import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getCurrentSession } from '@/lib/session';

/**
 * Onboarding shell. Calm, paced, no app chrome.
 * The progress indicator is global; the body is per-stage.
 */
export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const { user } = await getCurrentSession();
  if (!user) redirect('/login');

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl tracking-tight">
            Keep Playing
          </Link>
          <p className="text-xs uppercase tracking-wide text-foreground-subtle">Onboarding</p>
        </div>
      </header>
      <section className="flex-1 mx-auto w-full max-w-prose px-6 py-16">{children}</section>
      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-4 text-xs text-foreground-subtle">
          AhTohMoh · Accra
        </div>
      </footer>
    </main>
  );
}
