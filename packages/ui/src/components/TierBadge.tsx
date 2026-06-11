import { TIER_LABEL, type Tier } from '@keep-playing/shared';
import { cn } from '../cn';

/**
 * TierBadge — no chromatic accent. Tier is signalled through opacity weight,
 * matching the AhTohMoh website's ink hierarchy. Founder reads brightest;
 * external collaborator quietest.
 */
const styles: Record<Tier, string> = {
  founder: 'border-ink text-ink',
  resident: 'border-hairline-strong text-ink',
  fellow: 'border-hairline text-muted-strong',
  correspondent: 'border-hairline text-muted-strong',
  external_collaborator: 'border-hairline text-muted',
};

export function TierBadge({ tier, className }: { tier: Tier; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center border px-2.5 py-1 font-sans font-medium uppercase',
        'text-[10px] tracking-eyebrow',
        styles[tier],
        className,
      )}
    >
      {TIER_LABEL[tier]}
    </span>
  );
}
