'use client';
/**
 * Bottom tab bar — mobile only (spec §15).
 * Home · Projects · Voice · Constellation · You.
 * Pencil labels, no icons-without-words, active tab in full ink.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/home', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/voice', label: 'Voice' },
  { href: '/constellation', label: 'Stars' },
] as const;

export function MobileTabBar({ userId }: { userId: string }) {
  const pathname = usePathname();

  const tabs = [...TABS, { href: `/members/${userId}`, label: 'You' } as const];

  return (
    <nav
      aria-label="Primary, mobile"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-edge bg-paper2/90 backdrop-blur-glass"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {tabs.map((t) => {
          const active =
            t.href === '/home' ? pathname === '/home' : pathname.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href as never}
                className={`flex flex-col items-center justify-center h-14 transition-colors duration-quick ${
                  active ? 'text-ink' : 'text-faint hover:text-muted'
                }`}
              >
                <span
                  className={`h-1 w-1 rounded-full mb-1.5 transition-opacity ${
                    active ? 'bg-ink opacity-100' : 'opacity-0'
                  }`}
                  aria-hidden
                />
                <span className="pencil">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
