import Link from 'next/link';
import { Heading, Prose } from '@keep-playing/ui';

export default function NotFound() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6">
      <Heading level={2}>Nothing here.</Heading>
      <Prose className="mt-3 text-foreground-muted text-center">
        <p>That page does not exist, or you do not have access to it.</p>
      </Prose>
      <Link
        href="/"
        className="mt-8 text-sm text-accent hover:opacity-80 transition-opacity"
      >
        Take me home
      </Link>
    </main>
  );
}
