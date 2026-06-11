import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { db, projectContributors, projects } from '@keep-playing/db';
import { Prose } from '@keep-playing/ui';
import { PROJECT_TYPE_LABEL } from '@keep-playing/shared';
import { requireUser } from '@/lib/session';
import { WizardFrame } from '../wizard-frame';

export default async function FirstProjectStage() {
  const { user } = await requireUser();

  const rows = await db
    .select({ p: projects, role: projectContributors.role })
    .from(projectContributors)
    .innerJoin(projects, eq(projectContributors.projectId, projects.id))
    .where(eq(projectContributors.userId, user.id))
    .limit(3);

  const hasProjects = rows.length > 0;
  const first = rows[0];

  return (
    <WizardFrame
      step={5}
      title={hasProjects ? 'Your first project.' : 'No project yet.'}
      next="/onboarding/tools"
      prev="/onboarding/people"
    >
      {hasProjects ? (
        <>
          <Prose className="text-muted-strong">
            <p className="text-ink">
              You are joining {first ? `"${first.p.title}"` : 'a project'}. Meet the project before
              the platform. The brief, the milestones, the team — they tell you more about how
              AhTohMoh works than any tour will.
            </p>
          </Prose>

          <ul className="mt-8 space-y-3">
            {rows.map(({ p, role }) => (
              <li key={p.id}>
                <Link
                  href={`/projects/${p.slug}`}
                  target="_blank"
                  className="block rounded-lg border border-edge card-quiet p-5 hover:border-hairline transition-colors"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="text-ink font-medium">{p.title}</p>
                    <span className="text-xs uppercase tracking-wide text-muted">
                      {role}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {PROJECT_TYPE_LABEL[p.type]}
                  </p>
                  {p.description && (
                    <p className="mt-2 text-sm text-muted-strong">{p.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <Prose className="mt-10 text-muted-strong">
            <p>Open it. Read the brief. Then come back.</p>
          </Prose>
        </>
      ) : (
        <Prose className="text-muted-strong">
          <p className="text-ink">You are not assigned to a project yet.</p>
          <p>
            That is fine. AhTohMoh will be in touch when there is work for your craft. In the
            meantime, the knowledge base is open to you and the Collective is yours to meet.
          </p>
        </Prose>
      )}
    </WizardFrame>
  );
}
