/**
 * The five tiers of the Collective.
 *
 * Display labels and short descriptions live here so they can be used in UI
 * (member directory, onboarding, settings) without re-stating the brief.
 */

export const TIERS = ['founder', 'resident', 'fellow', 'correspondent', 'external_collaborator'] as const;

export type Tier = (typeof TIERS)[number];

export const TIER_LABEL: Record<Tier, string> = {
  founder: 'Founder',
  resident: 'Resident',
  fellow: 'Fellow',
  correspondent: 'Correspondent',
  external_collaborator: 'External Collaborator',
};

export const TIER_SHORT_DESCRIPTION: Record<Tier, string> = {
  founder: 'Sets direction. Issues briefs. Holds the standard.',
  resident: 'Leads projects. Sees the wider practice.',
  fellow: 'Delivers a specific project to standard.',
  correspondent: 'Maintains a Pipeline. Flags opportunities.',
  external_collaborator: 'Engages with one specific project.',
};

export const CONTRIBUTION_ROLES = ['lead', 'contributor', 'reviewer', 'observer'] as const;
export type ContributionRole = (typeof CONTRIBUTION_ROLES)[number];

export const PROJECT_TYPES = [
  'commissioned_engagement',
  'internal_investigation',
  'operational_sponsorship',
  'artifact',
  'prototype',
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PROJECT_TYPE_LABEL: Record<ProjectType, string> = {
  commissioned_engagement: 'Commissioned Engagement',
  internal_investigation: 'Internal Investigation',
  operational_sponsorship: 'Operational Sponsorship',
  artifact: 'Artifact',
  prototype: 'Prototype',
};

export const PROJECT_STATUSES = ['draft', 'active', 'on_hold', 'shipped', 'archived'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const MILESTONE_STATUSES = ['pending', 'in_progress', 'complete', 'overdue'] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];
