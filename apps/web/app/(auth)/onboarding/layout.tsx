import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getCurrentSession } from '@/lib/session';

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const { user } = await getCurrentSession();
  if (!user) redirect('/login');

  return (
    <>
      <div className="sketch-bg" aria-hidden />
      <main className="page-shell">
        <header className="border-b border-edge">
          <div className="mx-auto max-w-5xl px-pad py-5 flex items-center justify-between">
            <Link href="/" className="font-ink text-2xl">
              Keep Playing
            </Link>
            <span className="pencil-faint">Onboarding</span>
          </div>
        </header>
        <section className="overflow-y-auto nice-scroll">
          <div className="mx-auto w-full max-w-prose px-pad py-16 reveal">{children}</div>
        </section>
        <footer className="border-t border-edge">
          <div className="mx-auto max-w-5xl px-pad py-4">
            <span className="pencil-faint">AhTohMoh · Accra</span>
          </div>
        </footer>
      </main>
    </>
  );
}
