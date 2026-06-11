import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Heading } from '@keep-playing/ui';
import { can } from '@keep-playing/auth';
import { requireUser } from '@/lib/session';
import { getMembershipFor, getProjectBySlug } from '@/lib/projects';
import { BriefEditor } from './brief-editor';

export default async function BriefPage({ params }: { params: { slug: string } }) {
  const { user } = await requireUser();
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();
  const membership = await getMembershipFor(project.id, user.id);
  const canEdit = can('project.edit', {
    userId: user.id,
    tier: user.tier,
    projectId: project.id,
    isProjectContributor: membership.isContributor,
    contributionRole: membership.role ?? undefined,
  });
  if (!canEdit) redirect(`/projects/${project.slug}`);

  const body = (project.brief as { body?: string } | null)?.body ?? '';

  return (
    <div className="max-w-3xl">
      <Link
        href={`/projects/${project.slug}`}
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        ← {project.title}
      </Link>
      <Heading level={2} className="mt-4">
        Brief
      </Heading>
      <BriefEditor projectId={project.id} slug={project.slug} initialBody={body} />
    </div>
  );
}
