import { Heading, Prose } from '@keep-playing/ui';

/**
 * Home — context-aware dashboard.
 *
 * Stage 1, Week 2+: this branches by tier — the Founder sees the cross-practice
 * view, Residents see active projects, Fellows see their projects, Correspondents
 * see their pipeline.
 *
 * For now: placeholder.
 */
export default function CollectiveHome() {
  return (
    <div>
      <Heading level={2}>Welcome back.</Heading>
      <Prose className="mt-4 text-foreground-muted">
        <p>
          This is your home in Keep Playing. It will show the work in motion for you — your
          projects, your milestones, your voice notes, your conversations.
        </p>
        <p>The home view is wired up in Week 2 of the build.</p>
      </Prose>
    </div>
  );
}
