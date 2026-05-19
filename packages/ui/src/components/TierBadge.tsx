import { TIER_LABEL, type Tier } from '@keep-playing/shared';
import { cn } from '../cn';

const styles: Record<Tier, string> = {
  founder: 'border-accent text-accent',
  resident: 'border-border-emphasis text-foreground',
  fellow: 'border-border text-foreground-muted',
  correspondent: 'border-border text-foreground-muted',
  external_collaborator: 'border-border text-foreground-subtle',
};

export function TierBadge({ tier, className }: { tier: Tier; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide',
        styles[tier],
        className,
      )}
    >
      {TIER_LABEL[tier]}
    </span>
  );
}
