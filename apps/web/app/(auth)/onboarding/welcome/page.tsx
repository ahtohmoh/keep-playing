import { Prose } from '@keep-playing/ui';
import { requireUser } from '@/lib/session';
import { WizardFrame } from '../wizard-frame';

export default async function Welcome() {
  const { user } = await requireUser();
  return (
    <WizardFrame step={1} title="You&apos;re in." next="/onboarding/tier">
      <Prose className="text-lg text-muted-strong">
        <p className="text-ink">
          Welcome, {user.displayName ?? user.fullName.split(' ')[0]}.
        </p>
        <p>
          We are AhTohMoh. A creative research and experimentation agency in Accra, Ghana. You have
          signed an agreement, which means you are now part of the Collective.
        </p>
        <p>
          Before you do anything in here, we want you to know who we are and how we work. This will
          take about thirty minutes. Do not skip it. The practice is what we are building together.
        </p>
        <p>When you are ready, keep going.</p>
      </Prose>
    </WizardFrame>
  );
}
