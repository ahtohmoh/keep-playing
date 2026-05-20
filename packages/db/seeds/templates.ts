/**
 * Seed templates — 7 starter templates from §11 of the build spec.
 */
import { db } from '../src/client';
import { templates } from '../src/schema';

const PROJECT_BRIEF = {
  slug: 'project-brief',
  title: 'Project Brief',
  category: 'project',
  description: 'The founding document for any project. Intent, deliverables, timeline.',
  schema: {
    type: 'object',
    required: ['project_name', 'intent', 'deliverables', 'timeline'],
    properties: {
      project_name: { type: 'string', label: 'Project name', placeholder: 'e.g. Kente Logic v2' },
      intent: {
        type: 'string',
        label: 'Intent — what question are we answering?',
        format: 'textarea',
      },
      deliverables: { type: 'array', label: 'Deliverables', items: { type: 'string' } },
      timeline: { type: 'string', label: 'Expected timeline', format: 'textarea' },
      contributors: { type: 'array', label: 'Contributing members', items: { type: 'string' } },
      constraints: {
        type: 'string',
        label: 'Constraints and assumptions',
        format: 'textarea',
      },
    },
  },
  body: `# {{project_name}}

## Intent

{{intent}}

## Deliverables

{{#each deliverables}}
- {{this}}
{{/each}}

## Timeline

{{timeline}}

{{#if contributors}}
## Contributors

{{#each contributors}}
- {{this}}
{{/each}}
{{/if}}

{{#if constraints}}
## Constraints

{{constraints}}
{{/if}}
`,
};

const ARTIFACT_CONCEPT = {
  slug: 'artifact-concept-note',
  title: 'Artifact Concept Note',
  category: 'project',
  description: 'A concept note for a numbered AhTohMoh artifact.',
  schema: {
    type: 'object',
    required: ['artifact_name', 'thesis', 'form', 'audience'],
    properties: {
      artifact_name: { type: 'string', label: 'Working name' },
      thesis: { type: 'string', label: 'Thesis — what this artifact argues', format: 'textarea' },
      form: { type: 'string', label: 'Form — what shape it takes', format: 'textarea' },
      audience: { type: 'string', label: 'Who is this for?', format: 'textarea' },
      provocations: { type: 'array', label: 'Provocations', items: { type: 'string' } },
    },
  },
  body: `# {{artifact_name}}

## Thesis

{{thesis}}

## Form

{{form}}

## Audience

{{audience}}

{{#if provocations}}
## Provocations

{{#each provocations}}
- {{this}}
{{/each}}
{{/if}}
`,
};

const ENGAGEMENT_PROPOSAL = {
  slug: 'engagement-proposal',
  title: 'Engagement Proposal',
  category: 'engagement',
  description: 'An external commission pitch.',
  schema: {
    type: 'object',
    required: ['partner_name', 'partner_context', 'proposal', 'timeline', 'price'],
    properties: {
      partner_name: { type: 'string', label: 'Commissioning partner' },
      partner_context: { type: 'string', label: 'Their context', format: 'textarea' },
      proposal: { type: 'string', label: 'What we propose to make', format: 'textarea' },
      timeline: { type: 'string', label: 'Timeline', format: 'textarea' },
      price: { type: 'string', label: 'Price (USD)' },
    },
  },
  body: `# Proposal: {{partner_name}}

## Their context

{{partner_context}}

## What we propose

{{proposal}}

## Timeline

{{timeline}}

## Price

USD {{price}}
`,
};

const SPONSORSHIP_PROPOSAL = {
  slug: 'sponsorship-proposal',
  title: 'Sponsorship Proposal',
  category: 'engagement',
  description: 'An Operational Sponsorship engagement proposal.',
  schema: {
    type: 'object',
    required: ['sponsor_name', 'beneficiary', 'value', 'scope'],
    properties: {
      sponsor_name: { type: 'string', label: 'Sponsor' },
      beneficiary: { type: 'string', label: 'Beneficiary entity' },
      value: { type: 'string', label: 'Value provided', format: 'textarea' },
      scope: { type: 'string', label: 'Scope and limits', format: 'textarea' },
    },
  },
  body: `# Sponsorship: {{sponsor_name}} -> {{beneficiary}}

## Value

{{value}}

## Scope

{{scope}}
`,
};

const PIPELINE_REPORT = {
  slug: 'pipeline-report',
  title: 'Pipeline Report (Monthly)',
  category: 'reporting',
  description: 'A Correspondent\'s monthly pipeline report.',
  schema: {
    type: 'object',
    required: ['period', 'highlights'],
    properties: {
      period: { type: 'string', label: 'Period (e.g. May 2026)' },
      highlights: { type: 'array', label: 'Highlights', items: { type: 'string' } },
      new_entries: { type: 'array', label: 'New entries this period', items: { type: 'string' } },
      changes: { type: 'string', label: 'Status changes', format: 'textarea' },
    },
  },
  body: `# Pipeline Report — {{period}}

## Highlights

{{#each highlights}}
- {{this}}
{{/each}}

{{#if new_entries}}
## New entries

{{#each new_entries}}
- {{this}}
{{/each}}
{{/if}}

{{#if changes}}
## Status changes

{{changes}}
{{/if}}
`,
};

const STATUS_UPDATE = {
  slug: 'status-update',
  title: 'Status Update',
  category: 'reporting',
  description: 'A project milestone delivery update.',
  schema: {
    type: 'object',
    required: ['project_name', 'milestone', 'summary'],
    properties: {
      project_name: { type: 'string', label: 'Project' },
      milestone: { type: 'string', label: 'Milestone' },
      summary: { type: 'string', label: 'Summary', format: 'textarea' },
      shipped: { type: 'array', label: 'Shipped', items: { type: 'string' } },
      next: { type: 'array', label: 'Next', items: { type: 'string' } },
    },
  },
  body: `# {{project_name}} — {{milestone}}

{{summary}}

{{#if shipped}}
## Shipped

{{#each shipped}}
- {{this}}
{{/each}}
{{/if}}

{{#if next}}
## Next

{{#each next}}
- {{this}}
{{/each}}
{{/if}}
`,
};

const ONBOARDING_PACK = {
  slug: 'onboarding-pack',
  title: 'Onboarding Pack',
  category: 'onboarding',
  description: 'A per-tier onboarding pack for a new Collective member.',
  schema: {
    type: 'object',
    required: ['member_name', 'tier', 'first_project'],
    properties: {
      member_name: { type: 'string', label: 'Member' },
      tier: { type: 'string', label: 'Tier' },
      first_project: { type: 'string', label: 'First project they\'re joining' },
      welcome_note: { type: 'string', label: 'Welcome note from the Founder', format: 'textarea' },
    },
  },
  body: `# Welcome, {{member_name}}.

You are joining AhTohMoh as a {{tier}}.

Your first project: {{first_project}}.

{{#if welcome_note}}
---

{{welcome_note}}
{{/if}}
`,
};

const SEEDS = [
  PROJECT_BRIEF,
  ARTIFACT_CONCEPT,
  ENGAGEMENT_PROPOSAL,
  SPONSORSHIP_PROPOSAL,
  PIPELINE_REPORT,
  STATUS_UPDATE,
  ONBOARDING_PACK,
];

export async function seedTemplates() {
  for (const t of SEEDS) {
    await db
      .insert(templates)
      .values({
        slug: t.slug,
        title: t.title,
        category: t.category,
        description: t.description,
        schema: t.schema,
        body: t.body,
      })
      .onConflictDoUpdate({
        target: templates.slug,
        set: {
          title: t.title,
          category: t.category,
          description: t.description,
          schema: t.schema,
          body: t.body,
          updatedAt: new Date(),
        },
      });
    // eslint-disable-next-line no-console
    console.log(`  - ${t.slug}`);
  }
}

// Allow running this file directly.
if (import.meta.url === `file://${process.argv[1]}`) {
  await seedTemplates();
  process.exit(0);
}
