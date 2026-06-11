'use client';
/**
 * Cmd+K — the platform's intelligence surface.
 *
 * Navigate, search projects/members/knowledge, jump to actions. Pencil/mono
 * vocabulary, glass panel, no chrome. Opens with Cmd+K / Ctrl+K, closes with
 * Escape. Arrow keys + Enter to act.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Result = {
  kind: 'project' | 'member' | 'knowledge' | 'action';
  title: string;
  detail?: string;
  href: string;
};

const KIND_LABEL: Record<Result['kind'], string> = {
  action: 'GO',
  project: 'PRJ',
  member: 'MBR',
  knowledge: 'DOC',
};

const STATIC_ACTIONS: Result[] = [
  { kind: 'action', title: 'Home', detail: 'Since you were here', href: '/home' },
  { kind: 'action', title: 'Projects', href: '/projects' },
  { kind: 'action', title: 'New project', href: '/projects/new' },
  { kind: 'action', title: 'Members', href: '/members' },
  { kind: 'action', title: 'Voice', detail: 'Record a note', href: '/voice' },
  { kind: 'action', title: 'Templates', href: '/templates' },
  { kind: 'action', title: 'Knowledge', href: '/knowledge' },
  { kind: 'action', title: 'Constellation', href: '/constellation' },
  { kind: 'action', title: 'Notifications', href: '/notifications' },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [remote, setRemote] = useState<Result[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Open/close keybinding.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Focus on open; reset on close.
  useEffect(() => {
    if (open) {
      setQuery('');
      setRemote([]);
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Debounced remote search.
  useEffect(() => {
    if (!open) return;
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setRemote([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = (await res.json()) as { results: Result[] };
          setRemote(data.results);
        }
      } catch {
        // Quiet failure — the static actions still work.
      }
    }, 160);
    return () => clearTimeout(debounceRef.current);
  }, [query, open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const actions =
      q.length === 0
        ? STATIC_ACTIONS
        : STATIC_ACTIONS.filter((a) => a.title.toLowerCase().includes(q));
    return [...actions, ...remote].slice(0, 12);
  }, [query, remote]);

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, results.length - 1)));
  }, [results]);

  const go = useCallback(
    (r: Result | undefined) => {
      if (!r) return;
      setOpen(false);
      router.push(r.href as Parameters<typeof router.push>[0]);
    },
    [router],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <button
        aria-label="Close"
        className="absolute inset-0 bg-bg/70 backdrop-blur-[2px] cursor-default"
        onClick={() => setOpen(false)}
      />
      <div className="glass relative w-full max-w-xl overflow-hidden reveal">
        <div className="flex items-center gap-3 border-b border-edge px-5">
          <span className="pencil-faint shrink-0">⌘K</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                go(results[active]);
              }
            }}
            placeholder="Search the practice…"
            className="h-14 w-full bg-transparent text-ink font-sans font-light placeholder:text-faint focus:outline-none"
          />
        </div>
        <ul className="max-h-[40vh] overflow-y-auto nice-scroll py-2" role="listbox">
          {results.length === 0 ? (
            <li className="px-5 py-4 text-sm text-muted">Nothing matches. Try fewer letters.</li>
          ) : (
            results.map((r, i) => (
              <li key={`${r.kind}-${r.href}-${r.title}`} role="option" aria-selected={i === active}>
                <button
                  className={`flex w-full items-baseline gap-3 px-5 py-2.5 text-left transition-colors duration-instant ${
                    i === active ? 'bg-white/5' : ''
                  }`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r)}
                >
                  <span className="pencil-faint w-8 shrink-0">{KIND_LABEL[r.kind]}</span>
                  <span className="text-sm text-ink truncate">{r.title}</span>
                  {r.detail && (
                    <span className="text-xs text-muted truncate ml-auto">{r.detail}</span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="border-t border-edge px-5 py-2 flex items-center justify-between">
          <span className="pencil-faint">↑↓ move · ↵ open · esc close</span>
          <span className="pencil-faint">Keep Playing</span>
        </div>
      </div>
    </div>
  );
}
