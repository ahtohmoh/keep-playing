import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { TierBadge } from '@keep-playing/ui';
import { getCurrentSession } from '@/lib/session';
import { SignOutButton } from '@/components/sign-out-button';

export default async function CollectiveLayout({ children }: { children: ReactNode }) {
  const { user } = await getCurrentSession();
  if (!user) redirect('/login');

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-lg tracking-tight">
            Keep Playing
          </Link>
          <nav className="flex items-center gap-6 text-sm text-foreground-muted">
            <Link href="/projects" className="hover:text-foreground transition-colors">
              Projects
            </Link>
            <Link href="/members" className="hover:text-foreground transition-colors">
              Members
            </Link>
            <Link href="/voice" className="hover:text-foreground transition-colors">
              Voice
            </Link>
            <Link href="/knowledge" className="hover:text-foreground transition-colors">
              Knowledge
            </Link>
            <Link href="/constellation" className="hover:text-foreground transition-colors">
              Constellation
            </Link>
            <span className="text-foreground-subtle">|</span>
            <Link
              href={`/members/${user.id}`}
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <span>{user.displayName ?? user.fullName}</span>
              <TierBadge tier={user.tier} />
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <div className="flex-1 mx-auto w-full max-w-6xl px-6 py-10">{children}</div>
    </div>
  );
}
