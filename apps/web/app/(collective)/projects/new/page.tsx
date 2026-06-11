import { redirect } from 'next/navigation';
import { Heading, Prose } from '@keep-playing/ui';
import { can } from '@keep-playing/auth';
import { requireUser } from '@/lib/session';
import { NewProjectForm } from './new-project-form';

export default async function NewProjectPage() {
  const { user } = await requireUser();
  if (!can('project.create', { userId: user.id, tier: user.tier })) {
    redirect('/projects');
  }
  return (
    <div className="max-w-2xl">
      <Heading level={2}>Start a project</Heading>
      <Prose className="mt-3 text-muted-strong">
        <p>
          A project is the central organising unit. Give it a name, decide what kind of work it
          is, and (optionally) a target ship date. You can write the brief and add contributors
          once it&apos;s open.
        </p>
      </Prose>
      <NewProjectForm />
    </div>
  );
}
