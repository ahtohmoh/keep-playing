import Link from 'next/link';
import type { ReactNode } from 'react';
import { Eyebrow } from '@keep-playing/ui';

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
      <div className="mt-10">
        <Eyebrow>Stage {step} of 6</Eyebrow>
      </div>
      <h1 className="mt-3 font-ink text-[clamp(34px,4vw,56px)] leading-[1] text-ink capitalize">
        {title}
      </h1>
      <div className="mt-12">{children}</div>
      <div className="mt-16 flex items-center justify-between border-t border-hairline pt-6">
        {prev ? (
          <Link
            href={prev}
            className="text-[11px] uppercase tracking-eyebrow text-muted hover:text-ink transition-colors"
          >
            ← Back
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={next} className="cta-primary">
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
          className={`h-px ${
            n < step ? 'bg-ink' : n === step ? 'bg-ink/70' : 'bg-hairline'
          }`}
          title={STAGE_TITLES[n]}
        />
      ))}
    </ol>
  );
}
