import Link from 'next/link';
import { Input } from '@keep-playing/ui';

export default function LoginPage() {
  return (
    <>
      <div className="sketch-bg" aria-hidden />

      <main className="page-shell">
        <header className="border-b border-edge">
          <div className="mx-auto max-w-6xl px-pad py-5 flex items-center justify-between">
            <Link href="/" className="font-ink text-2xl underline-grow">
              Keep Playing
            </Link>
            <span className="pencil-faint">Sign in</span>
          </div>
        </header>

        <section className="overflow-hidden flex items-center">
          <div className="mx-auto w-full max-w-md px-pad reveal">
            <p className="pencil-faint">Welcome back</p>
            <h1 className="mt-4 font-sans font-light text-[clamp(32px,4vw,52px)] leading-[1] tracking-[-0.02em]">
              The Collective is open to you.
            </h1>

            <form className="mt-12 space-y-7" action="/api/auth/login" method="post">
              <label className="block">
                <span className="pencil-faint">Email</span>
                <Input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="you@ahtohmoh.com"
                  className="mt-2"
                />
              </label>
              <label className="block">
                <span className="pencil-faint">Password</span>
                <Input
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  className="mt-2"
                />
              </label>
              <div className="pt-2">
                <button type="submit" className="cta-primary">
                  Continue
                </button>
              </div>
            </form>
          </div>
        </section>

        <footer className="border-t border-edge">
          <div className="mx-auto max-w-6xl px-pad py-4 flex flex-wrap items-center justify-between gap-3">
            <span className="pencil-faint">Invitation only</span>
            <Link href="/" className="pencil-faint underline-grow">
              ← Back
            </Link>
          </div>
        </footer>
      </main>
    </>
  );
}
