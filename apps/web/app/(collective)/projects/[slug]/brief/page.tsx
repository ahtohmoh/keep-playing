import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { db, briefRevisions, users } from '@keep-playing/db';
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
      <BriefHistory projectId={project.id} />
    </div>
  );
}

async function BriefHistory({ projectId }: { projectId: string }) {
  const rows = await db
    .select({ rev: briefRevisions, name: users.displayName, full: users.fullName })
    .from(briefRevisions)
    .leftJoin(users, eq(briefRevisions.revisedById, users.id))
    .where(eq(briefRevisions.projectId, projectId))
    .orderBy(desc(briefRevisions.createdAt))
    .limit(20);

  if (rows.length === 0) return null;

  return (
    <section className="mt-16 border-t border-edge pt-8">
      <h3 className="pencil mb-5">Revision history</h3>
      <ol className="space-y-4">
        {rows.map(({ rev, name, full }) => {
          const text = (rev.brief as { body?: string } | null)?.body ?? '';
          return (
            <li key={rev.id} className="border-l border-edge pl-5 py-1">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <span className="text-sm text-muted-strong">
                  {name ?? full ?? 'Unknown'}
                  {rev.note && <span className="text-muted"> — {rev.note}</span>}
                </span>
                <span className="meta shrink-0">
                  {new Date(rev.createdAt).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <details className="mt-1.5">
                <summary className="pencil-faint cursor-pointer hover:text-muted-strong transition-colors">
                  View this version
                </summary>
                <pre className="mt-3 whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-strong card-quiet rounded-lg p-4 max-h-80 overflow-y-auto nice-scroll">
                  {text || '(empty brief)'}
                </pre>
              </details>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
