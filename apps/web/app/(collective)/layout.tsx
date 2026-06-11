import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { TierBadge } from '@keep-playing/ui';
import { getCurrentSession } from '@/lib/session';
import { SignOutButton } from '@/components/sign-out-button';
import { CommandPalette } from '@/components/command-palette';
import { currentSeason } from '@/lib/seasons';

const NAV_LINK =
  'pencil text-muted hover:text-ink transition-colors duration-quick underline-grow';
const NAV_LINK_ACTIVE = 'pencil text-ink';

export default async function CollectiveLayout({ children }: { children: ReactNode }) {
  const { user } = await getCurrentSession();
  if (!user) redirect('/login');
  const season = currentSeason();

  return (
    <>
      <div className="grid-bg" aria-hidden />
      <CommandPalette />
      <div className="page-shell">
        <header className="border-b border-edge">
          <div className="mx-auto max-w-7xl px-pad py-4 flex items-center justify-between gap-6">
            <Link href="/home" className="font-ink text-2xl shrink-0">
              Keep Playing
            </Link>
            <nav
              aria-label="Primary"
              className="flex items-center gap-5 sm:gap-6 overflow-x-auto whitespace-nowrap nice-scroll"
            >
              {user.tier === 'founder' && (
                <Link href="/dashboard" className={NAV_LINK}>
                  Dashboard
                </Link>
              )}
              <Link href="/projects" className={NAV_LINK}>
                Projects
              </Link>
              <Link href="/members" className={NAV_LINK}>
                Members
              </Link>
              <Link href="/voice" className={NAV_LINK}>
                Voice
              </Link>
              <Link href="/templates" className={NAV_LINK}>
                Templates
              </Link>
              <Link href="/knowledge" className={NAV_LINK}>
                Knowledge
              </Link>
              {(user.tier === 'correspondent' || user.tier === 'founder') && (
                <Link href="/pipeline" className={NAV_LINK}>
                  Pipeline
                </Link>
              )}
              <Link href="/constellation" className={NAV_LINK}>
                Constellation
              </Link>
            </nav>
            <div className="flex items-center gap-4 shrink-0">
              <span className="pencil-faint hidden md:inline" title="Command palette">
                ⌘K
              </span>
              <Link
                href={`/members/${user.id}`}
                className="flex items-center gap-2 pencil text-ink hover:opacity-80 transition-opacity"
              >
                <span>{user.displayName ?? user.fullName.split(' ')[0]}</span>
                <TierBadge tier={user.tier} />
              </Link>
              <SignOutButton />
            </div>
          </div>
        </header>

        <main className="overflow-y-auto nice-scroll">
          <div className="mx-auto w-full max-w-7xl px-pad py-10 reveal">{children}</div>
        </main>

        <footer className="border-t border-edge">
          <div className="mx-auto max-w-7xl px-pad py-3 flex items-center justify-between gap-3">
            <span className="pencil-faint flex items-center gap-2">
              <span className="pulse-dot" aria-hidden />
              {season.name}
            </span>
            <span className="pencil-faint">AhTohMoh · Accra</span>
          </div>
        </footer>
      </div>
    </>
  );
}
