import { redirect } from 'next/navigation';
import { Heading, Prose } from '@keep-playing/ui';
import { requireUser } from '@/lib/session';
import { InviteForm } from './invite-form';

export default async function InvitePage() {
  const { user } = await requireUser();
  if (user.tier !== 'founder') redirect('/members');

  return (
    <div className="max-w-2xl">
      <Heading level={2}>Invite a member</Heading>
      <Prose className="mt-3 text-muted-strong">
        <p>
          Issue an invitation for a Resident, Fellow, Correspondent, or External Collaborator. The
          invitee receives a link, sets a password, and enters the Onboarding Wizard.
        </p>
        <p>Invitations expire after fourteen days.</p>
      </Prose>

      <InviteForm />
    </div>
  );
}
