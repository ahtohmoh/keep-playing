/**
 * The permission matrix.
 *
 * Every action × every tier × every context. See §5 of the build spec.
 *
 * Principle from the platform brief: "Permissions follow commitment. People
 * see the practice in proportion to the depth of their relationship with it."
 * The Founder sees everything. External Collaborators see only their own
 * engagement. The shape between is structural, not gatekept.
 */
import type { Tier, ContributionRole } from '@keep-playing/shared';

export type Action =
  // Projects
  | 'project.view'
  | 'project.create'
  | 'project.edit'
  | 'project.archive'
  // Milestones
  | 'milestone.create'
  | 'milestone.edit'
  | 'milestone.complete'
  // Decisions
  | 'decision.create'
  | 'decision.view'
  // Deliverables
  | 'deliverable.upload'
  | 'deliverable.delete'
  // Comments
  | 'comment.create'
  | 'comment.delete_own'
  | 'comment.delete_any'
  // Voice notes
  | 'voicenote.create'
  | 'voicenote.transcribe'
  // Members
  | 'member.view'
  | 'member.invite'
  | 'member.remove'
  // Knowledge
  | 'knowledge.view'
  | 'knowledge.edit'
  // Templates
  | 'template.use'
  | 'template.create'
  | 'template.edit'
  // Pipeline
  | 'pipeline.view_own'
  | 'pipeline.view_all'
  | 'pipeline.edit_own'
  | 'pipeline.acknowledge'
  // Dashboards
  | 'dashboard.view_practice'
  // AI
  | 'ai.use_layer';

export type PermissionContext = {
  userId: string;
  tier: Tier;
  // Project-scoped context (optional; required for project-scoped actions)
  projectId?: string;
  isProjectContributor?: boolean;
  contributionRole?: ContributionRole;
  // Target user for member-scoped actions
  targetUserId?: string;
};

/**
 * Single source of truth for every permission decision.
 *
 * Founder can do everything. Everything else follows the matrix below.
 *
 * Project-scoped actions require `projectId` and `isProjectContributor` to be
 * set in the context. Without them, the answer is conservative: no.
 */
export function can(action: Action, ctx: PermissionContext): boolean {
  // Founder can do everything.
  if (ctx.tier === 'founder') return true;

  switch (action) {
    // ────────────────────────── Projects ──────────────────────────
    case 'project.view':
      if (ctx.tier === 'resident') return true;
      if (ctx.tier === 'fellow') return ctx.isProjectContributor === true;
      if (ctx.tier === 'external_collaborator') return ctx.isProjectContributor === true;
      if (ctx.tier === 'correspondent') return false;
      return false;

    case 'project.create':
      return ctx.tier === 'resident';

    case 'project.edit':
      if (ctx.tier === 'resident' && ctx.isProjectContributor) {
        return ['lead', 'contributor'].includes(ctx.contributionRole ?? '');
      }
      return false;

    case 'project.archive':
      // Founder-only. Already handled above.
      return false;

    // ────────────────────────── Milestones ──────────────────────────
    case 'milestone.create':
    case 'milestone.edit':
      if (!ctx.isProjectContributor) return false;
      if (ctx.tier === 'resident') return ['lead', 'contributor'].includes(ctx.contributionRole ?? '');
      return false;

    case 'milestone.complete':
      if (!ctx.isProjectContributor) return false;
      return ['lead', 'contributor'].includes(ctx.contributionRole ?? '');

    // ────────────────────────── Decisions ──────────────────────────
    case 'decision.view':
      return can('project.view', ctx);

    case 'decision.create':
      // Anyone shaping the work records decisions: leads and contributors.
      if (!ctx.isProjectContributor) return false;
      return ['lead', 'contributor'].includes(ctx.contributionRole ?? '');

    // ────────────────────────── Deliverables ──────────────────────────
    case 'deliverable.upload':
      if (!ctx.isProjectContributor) return false;
      return ['lead', 'contributor'].includes(ctx.contributionRole ?? '');

    case 'deliverable.delete':
      // Project lead or Founder.
      return ctx.isProjectContributor === true && ctx.contributionRole === 'lead';

    // ────────────────────────── Comments ──────────────────────────
    case 'comment.create':
      // Anyone with view access can comment on what they can see.
      return can('project.view', ctx);

    case 'comment.delete_own':
      return true;

    case 'comment.delete_any':
      // Founder-only. Already handled above.
      return false;

    // ────────────────────────── Voice notes ──────────────────────────
    case 'voicenote.create':
      // All Collective tiers can leave voice notes.
      return ['resident', 'fellow', 'correspondent'].includes(ctx.tier);

    case 'voicenote.transcribe':
      // Same as create — transcription is opt-in per note.
      return can('voicenote.create', ctx);

    // ────────────────────────── Members ──────────────────────────
    case 'member.view':
      // Residents and Fellows see the directory. Correspondents see Founder only.
      // External Collaborators see only the project lead they're engaging with.
      return ['resident', 'fellow', 'correspondent'].includes(ctx.tier);

    case 'member.invite':
    case 'member.remove':
      // Founder-only. Already handled above.
      return false;

    // ────────────────────────── Knowledge ──────────────────────────
    case 'knowledge.view':
      // All Collective tiers see the base. Visibility per document is checked
      // at the document level via `visibleToTiers`.
      return ctx.tier !== 'external_collaborator';

    case 'knowledge.edit':
      // Founder-only. Already handled above.
      return false;

    // ────────────────────────── Templates ──────────────────────────
    case 'template.use':
      return ['resident', 'fellow', 'correspondent'].includes(ctx.tier);

    case 'template.create':
    case 'template.edit':
      // Founder + Residents can shape the template library.
      return ctx.tier === 'resident';

    // ────────────────────────── Pipeline ──────────────────────────
    case 'pipeline.view_own':
    case 'pipeline.edit_own':
      return ctx.tier === 'correspondent';

    case 'pipeline.view_all':
    case 'pipeline.acknowledge':
      // Founder-only. Already handled above.
      return false;

    // ────────────────────────── Dashboards ──────────────────────────
    case 'dashboard.view_practice':
      return ctx.tier === 'resident';

    // ────────────────────────── AI ──────────────────────────
    case 'ai.use_layer':
      return ['resident', 'fellow'].includes(ctx.tier);

    default: {
      // Exhaustiveness check — any new Action will fail to compile until handled.
      const _exhaustive: never = action;
      void _exhaustive;
      return false;
    }
  }
}

/** Throws if the action is not permitted in the given context. */
export function assertCan(action: Action, ctx: PermissionContext): void {
  if (!can(action, ctx)) {
    throw new PermissionDeniedError(action, ctx);
  }
}

export class PermissionDeniedError extends Error {
  constructor(
    public readonly action: Action,
    public readonly ctx: PermissionContext,
  ) {
    super(`Permission denied: ${action} for tier=${ctx.tier}`);
    this.name = 'PermissionDeniedError';
  }
}
