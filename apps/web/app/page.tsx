import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Caption } from '@keep-playing/ui';
import { getCurrentSession } from '@/lib/session';

export default async function HomePage() {
  // Signed-in members never see the doorstep — they go home.
  const { user } = await getCurrentSession();
  if (user) redirect('/home');

  return (
    <>
      <div className="sketch-bg" aria-hidden />

      <main className="page-shell">
        <header className="border-b border-edge">
          <div className="mx-auto max-w-6xl px-pad py-5 flex items-center justify-between">
            <Link href="/" className="font-ink text-2xl underline-grow">
              Keep Playing
            </Link>
            <Link href="/login" className="pencil text-ink underline-grow">
              Sign in
            </Link>
          </div>
        </header>

        <section className="overflow-hidden flex items-center">
          <div className="mx-auto max-w-6xl px-pad w-full">
            <div className="reveal">
              <p className="pencil-faint">The operating environment for AhTohMoh</p>

              <h1 className="mt-8 font-sans font-light text-[clamp(40px,7vw,96px)] leading-[1.02] tracking-[-0.025em] text-ink-strong max-w-[16ch]">
                A platform for one specific practice.
              </h1>

              <Caption className="mt-8 text-2xl max-w-[42ch] text-muted-strong">
                Keep Playing is what AhTohMoh feels like, as software.
              </Caption>

              <div className="mt-14 flex items-center gap-8">
                <Link href="/login" className="cta-primary">
                  Sign in
                </Link>
                <span className="meta inline-flex items-center gap-2">
                  <span className="pulse-dot" aria-hidden />
                  Invitation only
                </span>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-edge">
          <div className="mx-auto max-w-6xl px-pad py-4 flex flex-wrap items-center justify-between gap-3">
            <span className="pencil-faint">AhTohMoh · WYETEY LTD · Accra</span>
            <span className="pencil-faint">Legacy through play</span>
          </div>
        </footer>
      </main>
    </>
  );
}
