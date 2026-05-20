import Link from 'next/link';
import type { ReactNode } from 'react';
import { Heading } from '@keep-playing/ui';

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

const STAGE_TITLES: Record<WizardStep, string> = {
  1: 'Welcome',
  2: 'Your Tier',
  3: 'The Practice',
  4: 'The People',
  5: 'Your First Project',
  6: 'Tools and Discipline',
};

export function WizardFrame({
  step,
  title,
  children,
  next,
  nextLabel = 'Continue',
  prev,
}: {
  step: WizardStep;
  title: string;
  children: ReactNode;
  next?: string;
  nextLabel?: string;
  prev?: string;
}) {
  return (
    <article>
      <Progress step={step} />
      <p className="mt-10 text-xs uppercase tracking-wide text-foreground-subtle">
        Stage {step} of 6
      </p>
      <Heading level={1} variant="display" className="mt-2 text-balance">
        {title}
      </Heading>
      <div className="mt-10">{children}</div>
      <div className="mt-14 flex items-center justify-between">
        {prev ? (
          <Link
            href={prev}
            className="text-sm text-foreground-subtle hover:text-foreground transition-colors"
          >
            ← Back
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={next}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-6 text-base font-medium text-background hover:bg-accent-muted transition-colors"
          >
            {nextLabel}
          </Link>
        )}
      </div>
    </article>
  );
}

function Progress({ step }: { step: WizardStep }) {
  return (
    <ol className="grid grid-cols-6 gap-2" aria-label="Onboarding progress">
      {([1, 2, 3, 4, 5, 6] as WizardStep[]).map((n) => (
        <li
          key={n}
          aria-current={n === step ? 'step' : undefined}
          className={`h-1 rounded-full ${
            n < step
              ? 'bg-accent'
              : n === step
                ? 'bg-accent/70'
                : 'bg-border'
          }`}
          title={STAGE_TITLES[n]}
        />
      ))}
    </ol>
  );
}
