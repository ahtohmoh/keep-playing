'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { Heading, Prose } from '@keep-playing/ui';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6">
      <Heading level={2}>Something went wrong.</Heading>
      <Prose className="mt-3 text-muted-strong text-center max-w-md">
        <p>
          The platform hit an error. The team has been notified through the audit log. You can try
          again or come back in a minute.
        </p>
      </Prose>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="inline-flex h-10 items-center rounded-md border border-edge card-quiet px-4 text-sm hover:border-hairline transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-sm text-muted-strong hover:text-ink transition-colors self-center"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
