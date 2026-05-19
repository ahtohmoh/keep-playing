import Link from 'next/link';
import { Heading, Prose } from '@keep-playing/ui';

export default function HomePage() {
  return (
    <main className="min-h-dvh flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl tracking-tight">
            Keep Playing
          </Link>
          <nav className="flex items-center gap-4 text-sm text-foreground-muted">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <section className="flex-1 mx-auto max-w-5xl px-6 py-24">
        <Heading level={1} variant="display" className="text-balance">
          The operating environment for AhTohMoh.
        </Heading>

        <Prose className="mt-8 text-lg text-foreground-muted">
          <p>
            Keep Playing is the platform on which AhTohMoh&apos;s Collective lives, works,
            communicates, and grows. It is not a project management tool. It is not a chat
            application. It is the place where a creative research practice happens, in software.
          </p>
          <p>
            One specific practice, encoded into every surface. Asynchronous by default. Quiet, not
            loud. Texture over status. Open-source under AGPL-3.0.
          </p>
        </Prose>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-6 text-lg font-medium text-background hover:bg-accent-muted transition-colors duration-quick ease-standard"
          >
            Sign in
          </Link>
          <Link
            href="https://github.com/ahtohmoh/keep-playing"
            className="text-sm text-foreground-muted hover:text-foreground transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            View the source
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-sm text-foreground-muted">
          <div>
            <p className="font-medium text-foreground">Stage 1 · Foundation</p>
            <p className="mt-1">
              Projects, briefs, milestones, deliverables, voice notes, WhatsApp notifications,
              templates, knowledge base, light gamification, Onboarding Wizard, founder dashboard.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Stage 2 · Maturity</p>
            <p className="mt-1">
              Claude AI Layer, External Collaborator surface, live screen-share, calendar
              integrations, AI-assisted templates, pipeline view.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Stage 3 · Mastery</p>
            <p className="mt-1">
              Walkie-talkie, advanced Legacy Plots, mobile companion, productisation, inter-platform
              connections.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">The practice</p>
            <p className="mt-1">
              One external commission per year. Work lived, not administered. Process visible in
              the artifact. Legacy through play.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-foreground-subtle flex flex-wrap items-center justify-between gap-3">
          <span>© AhTohMoh (WYETEY LTD), Accra.</span>
          <span>AGPL-3.0. Built for the Collective. Open to any practice that finds it useful.</span>
        </div>
      </footer>
    </main>
  );
}
