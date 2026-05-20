import Link from 'next/link';
import { Heading, Prose } from '@keep-playing/ui';
import { PROJECT_TYPE_LABEL, type ProjectStatus } from '@keep-playing/shared';
import { requireUser } from '@/lib/session';
import { listVisibleProjects } from '@/lib/projects';
import { can } from '@keep-playing/auth';

const statusOrder: ProjectStatus[] = ['active', 'draft', 'on_hold', 'shipped', 'archived'];

export default async function ProjectsPage() {
  const { user } = await requireUser();
  const projectList = await listVisibleProjects(user);
  const canCreate = can('project.create', { userId: user.id, tier: user.tier });

  const grouped = new Map<ProjectStatus, typeof projectList>(
    statusOrder.map((s) => [s, [] as typeof projectList]),
  );
  for (const p of projectList) grouped.get(p.status as ProjectStatus)?.push(p);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading level={2}>Projects</Heading>
          <Prose className="mt-3 text-foreground-muted max-w-2xl">
            <p>
              {projectList.length === 0
                ? 'No projects visible to you yet.'
                : `${projectList.length} project${projectList.length === 1 ? '' : 's'} in motion.`}
            </p>
          </Prose>
        </div>
        {canCreate && (
          <Link
            href="/projects/new"
            className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-4 text-sm hover:border-border-emphasis transition-colors"
          >
            New project
          </Link>
        )}
      </div>

      <div className="mt-12 space-y-12">
        {statusOrder.map((status) => {
          const list = grouped.get(status) ?? [];
          if (list.length === 0) return null;
          return (
            <section key={status}>
              <h3 className="text-sm font-medium uppercase tracking-wide text-foreground-subtle mb-4">
                {statusLabel(status)} <span className="ml-2 text-foreground-subtle">· {list.length}</span>
              </h3>
              <div className="space-y-3">
                {list.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.slug}`}
                    className="block rounded-lg border border-border bg-surface p-5 hover:border-border-emphasis transition-colors duration-quick"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-medium text-foreground">
                          {p.artifactNumber != null && (
                            <span className="font-mono text-accent mr-2">
                              · {String(p.artifactNumber).padStart(3, '0')}
                            </span>
                          )}
                          {p.title}
                        </h4>
                        {p.description && (
                          <p className="mt-1 text-sm text-foreground-muted">{p.description}</p>
                        )}
                      </div>
                      <span className="text-xs uppercase tracking-wide text-foreground-subtle">
                        {PROJECT_TYPE_LABEL[p.type]}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function statusLabel(s: ProjectStatus): string {
  switch (s) {
    case 'active':
      return 'In motion';
    case 'draft':
      return 'Drafts';
    case 'on_hold':
      return 'On hold';
    case 'shipped':
      return 'Shipped';
    case 'archived':
      return 'Archived';
  }
}
