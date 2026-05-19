import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Authed shell. Once auth wires up (Week 2), this layout reads the session
 * and redirects unauthenticated visitors to /login. For now it renders the
 * shell so the route structure is exercised.
 */
export default function CollectiveLayout({ children }: { children: ReactNode }) {
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
            <Link href="/knowledge" className="hover:text-foreground transition-colors">
              Knowledge
            </Link>
            <Link href="/constellation" className="hover:text-foreground transition-colors">
              Constellation
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex-1 mx-auto w-full max-w-6xl px-6 py-10">{children}</div>
    </div>
  );
}
