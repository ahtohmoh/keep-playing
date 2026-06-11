import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Heading } from '@keep-playing/ui';
import { can } from '@keep-playing/auth';
import { requireUser } from '@/lib/session';
import { getMembershipFor, getProjectBySlug } from '@/lib/projects';
import { CommentThread } from '@/components/comment-thread';

export default async function ActivityPage({ params }: { params: { slug: string } }) {
  const { user } = await requireUser();
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();
  const m = await getMembershipFor(project.id, user.id);
  if (
    !can('project.view', {
      userId: user.id,
      tier: user.tier,
      projectId: project.id,
      isProjectContributor: m.isContributor,
    })
  ) {
    redirect('/projects');
  }

  return (
    <div className="max-w-2xl">
      <Link
        href={`/projects/${project.slug}`}
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        ← {project.title}
      </Link>
      <Heading level={2} className="mt-4">
        Activity
      </Heading>
      <div className="mt-8">
        <CommentThread targetType="project" targetId={project.id} />
      </div>
    </div>
  );
}
