import { Prose, TierBadge } from '@keep-playing/ui';
import { TIER_LABEL, TIER_SHORT_DESCRIPTION } from '@keep-playing/shared';
import { requireUser } from '@/lib/session';
import { WizardFrame } from '../wizard-frame';

const TIER_EXPECTATIONS: Record<string, string[]> = {
  founder: [
    'Set the direction and hold the standard.',
    'Issue briefs and approve shipped work.',
    'Decide what the practice will and will not do.',
  ],
  resident: [
    'Lead at least one project at any given time.',
    'See the wider practice, not just your own work.',
    'Help newer members find their footing.',
    'Bring craft, judgment, and conviction.',
  ],
  fellow: [
    'Deliver one specific project to standard.',
    'Communicate clearly and asynchronously.',
    'Treat the brief as the contract.',
    'Make the work, not the report.',
  ],
  correspondent: [
    'Keep a pipeline of opportunities for AhTohMoh.',
    'Flag what is worth a conversation.',
    'Stay in touch with the Founder.',
    'No volume targets. Quality earns acknowledgement.',
  ],
  external_collaborator: [
    'Engage with one specific commission or project.',
    'Trust the team. Give clear feedback when it is asked for.',
    'Respect the practice that the team brings to your work.',
  ],
};

export default async function TierStage() {
  const { user } = await requireUser();
  const expectations = TIER_EXPECTATIONS[user.tier] ?? [];

  return (
    <WizardFrame step={2} title="Your tier." next="/onboarding/practice" prev="/onboarding/welcome">
      <div className="flex items-center gap-3">
        <TierBadge tier={user.tier} />
        <p className="text-foreground">{TIER_LABEL[user.tier]}</p>
      </div>

      <Prose className="mt-6 text-foreground-muted">
        <p>{TIER_SHORT_DESCRIPTION[user.tier]}</p>
      </Prose>

      <h2 className="mt-10 text-sm font-medium uppercase tracking-wide text-foreground-subtle">
        What we expect
      </h2>
      <ul className="mt-3 space-y-2 list-disc pl-6 text-foreground-muted">
        {expectations.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>

      <h2 className="mt-10 text-sm font-medium uppercase tracking-wide text-foreground-subtle">
        Your agreement
      </h2>
      <Prose className="mt-3 text-foreground-muted">
        {user.signedAgreementUrl ? (
          <p>
            Your signed agreement is{' '}
            <a href={user.signedAgreementUrl} className="text-accent" rel="noreferrer">
              on file
            </a>
            . Open it any time from Settings.
          </p>
        ) : (
          <p>
            Your tier agreement lives off-platform for now. Krasumashi will share the signed copy
            with you. Once attached, it lives in your profile.
          </p>
        )}
      </Prose>
    </WizardFrame>
  );
}
