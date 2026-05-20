import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Heading, Prose } from '@keep-playing/ui';
import { getCurrentSession } from '@/lib/session';

export default async function OnboardingWelcomePage() {
  const { user } = await getCurrentSession();
  if (!user) redirect('/login');

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <Link href="/" className="font-serif text-xl tracking-tight">
            Keep Playing
          </Link>
        </div>
      </header>
      <section className="flex-1 mx-auto w-full max-w-prose px-6 py-24">
        <Heading level={1} variant="display">
          You&apos;re in.
        </Heading>
        <Prose className="mt-8 text-lg text-foreground-muted">
          <p>
            Welcome, {user.displayName ?? user.fullName}. The full Onboarding Wizard arrives in
            Week 11 of the build — six stages introducing AhTohMoh before introducing Keep Playing.
            For now, you can carry on to the app.
          </p>
        </Prose>
        <Link
          href="/"
          className="mt-10 inline-flex h-12 items-center justify-center rounded-lg bg-accent px-6 text-lg font-medium text-background hover:bg-accent-muted transition-colors"
        >
          Enter
        </Link>
      </section>
    </main>
  );
}
