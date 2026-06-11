import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { eq, desc } from 'drizzle-orm';
import { db, deliverables, users } from '@keep-playing/db';
import { Heading } from '@keep-playing/ui';
import { can } from '@keep-playing/auth';
import { requireUser } from '@/lib/session';
import { getMembershipFor, getProjectBySlug } from '@/lib/projects';
import { UploadDeliverable } from './upload-deliverable';

export default async function DeliverablesPage({ params }: { params: { slug: string } }) {
  const { user } = await requireUser();
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();
  const membership = await getMembershipFor(project.id, user.id);
  if (
    !can('project.view', {
      userId: user.id,
      tier: user.tier,
      projectId: project.id,
      isProjectContributor: membership.isContributor,
    })
  ) {
    redirect('/projects');
  }
  const canUpload = can('deliverable.upload', {
    userId: user.id,
    tier: user.tier,
    projectId: project.id,
    isProjectContributor: membership.isContributor,
    contributionRole: membership.role ?? undefined,
  });

  const list = await db
    .select({
      d: deliverables,
      uploader: users,
    })
    .from(deliverables)
    .innerJoin(users, eq(deliverables.uploadedById, users.id))
    .where(eq(deliverables.projectId, project.id))
    .orderBy(desc(deliverables.createdAt));

  return (
    <div>
      <Link
        href={`/projects/${project.slug}`}
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        ← {project.title}
      </Link>
      <Heading level={2} className="mt-4">
        Deliverables
      </Heading>

      <div className="mt-8 space-y-3">
        {list.length === 0 ? (
          <p className="text-muted-strong text-sm">Nothing delivered yet.</p>
        ) : (
          list.map(({ d, uploader }) => (
            <div
              key={d.id}
              className="flex items-center justify-between gap-4 rounded-md border border-edge card-quiet px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-ink font-medium truncate">{d.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {uploader.displayName ?? uploader.fullName} ·{' '}
                  {new Date(d.createdAt).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                  {d.fileSize != null && ` · ${formatBytes(d.fileSize)}`}
                </p>
              </div>
              <a
                href={`/api/deliverables/${d.id}/download`}
                className="text-sm text-accent hover:opacity-80 transition-opacity"
              >
                Download
              </a>
            </div>
          ))
        )}
      </div>

      {canUpload && <UploadDeliverable projectId={project.id} />}
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
