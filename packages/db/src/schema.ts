/**
 * Keep Playing — Drizzle schema.
 *
 * The shape of the world. Every entity in §4 of the build spec lives here.
 * Permissions are computed at query time from `users.tier` and project
 * membership — see `packages/auth/src/permissions.ts`. The audit log is
 * append-only and captures every state-changing action.
 */
import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  pgEnum,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ────────────────────────────────────────────────────────────────────
// Enums
// ────────────────────────────────────────────────────────────────────

export const tierEnum = pgEnum('tier', [
  'founder',
  'resident',
  'fellow',
  'correspondent',
  'external_collaborator',
]);

export const projectTypeEnum = pgEnum('project_type', [
  'commissioned_engagement', // External commission (one/year)
  'internal_investigation', // AhTohMoh-initiated
  'operational_sponsorship', // Piqabu, DHF, etc
  'artifact', // Numbered AhTohMoh · 00X output
  'prototype', // Experimental builds
]);

export const projectStatusEnum = pgEnum('project_status', [
  'draft',
  'active',
  'on_hold',
  'shipped',
  'archived',
]);

export const milestoneStatusEnum = pgEnum('milestone_status', [
  'pending',
  'in_progress',
  'complete',
  'overdue',
]);

export const contributionRoleEnum = pgEnum('contribution_role', [
  'lead',
  'contributor',
  'reviewer',
  'observer',
]);

export const transcriptionStatusEnum = pgEnum('transcription_status', [
  'pending',
  'processing',
  'complete',
  'failed',
]);

export const pipelineStatusEnum = pgEnum('pipeline_status', [
  'identified',
  'in_conversation',
  'proposal',
  'closed',
  'lost',
]);

// ────────────────────────────────────────────────────────────────────
// Users
// ────────────────────────────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    fullName: text('full_name').notNull(),
    displayName: text('display_name'), // e.g. "Krasumashi"
    tier: tierEnum('tier').notNull(),
    whatsappNumber: text('whatsapp_number'), // E.164 format
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    craft: text('craft'), // e.g. "Visualisation", "Editorial"
    location: text('location'),
    signedAgreementUrl: text('signed_agreement_url'),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    onboardingCompletedAt: timestamp('onboarding_completed_at'),
    active: boolean('active').default(true).notNull(),
    passwordHash: text('password_hash'), // Argon2id; null for OAuth-only users (Stage 2)
    metadata: jsonb('metadata'),
  },
  (t) => ({
    tierIdx: index('users_tier_idx').on(t.tier),
    activeIdx: index('users_active_idx').on(t.active),
  }),
);

// ────────────────────────────────────────────────────────────────────
// Projects
// ────────────────────────────────────────────────────────────────────

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(), // e.g. "trotro-away"
    title: text('title').notNull(),
    artifactNumber: integer('artifact_number'), // e.g. 001 for "AhTohMoh · 001"
    type: projectTypeEnum('type').notNull(),
    status: projectStatusEnum('status').default('draft').notNull(),
    description: text('description'),
    brief: jsonb('brief'), // Rich brief content
    startDate: timestamp('start_date'),
    targetShipDate: timestamp('target_ship_date'),
    shippedAt: timestamp('shipped_at'),
    externalPartnerName: text('external_partner_name'),
    isExternalCommission: boolean('is_external_commission').default(false).notNull(),
    createdById: uuid('created_by_id')
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    archivedAt: timestamp('archived_at'),
    metadata: jsonb('metadata'),
  },
  (t) => ({
    statusIdx: index('projects_status_idx').on(t.status),
    typeIdx: index('projects_type_idx').on(t.type),
    artifactNumberIdx: index('projects_artifact_number_idx').on(t.artifactNumber),
  }),
);

// ────────────────────────────────────────────────────────────────────
// Project Contributors (many-to-many)
// ────────────────────────────────────────────────────────────────────

export const projectContributors = pgTable(
  'project_contributors',
  {
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    role: contributionRoleEnum('role').notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    leftAt: timestamp('left_at'),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.projectId, t.userId] }),
    userIdx: index('project_contributors_user_idx').on(t.userId),
  }),
);

// ────────────────────────────────────────────────────────────────────
// Milestones
// ────────────────────────────────────────────────────────────────────

export const milestones = pgTable(
  'milestones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    title: text('title').notNull(),
    description: text('description'),
    ownerId: uuid('owner_id').references(() => users.id),
    status: milestoneStatusEnum('status').default('pending').notNull(),
    dueAt: timestamp('due_at'),
    completedAt: timestamp('completed_at'),
    orderIndex: integer('order_index').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    projectIdx: index('milestones_project_idx').on(t.projectId),
    statusIdx: index('milestones_status_idx').on(t.status),
    dueAtIdx: index('milestones_due_at_idx').on(t.dueAt),
  }),
);

// ────────────────────────────────────────────────────────────────────
// Deliverables
// ────────────────────────────────────────────────────────────────────

export const deliverables = pgTable(
  'deliverables',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    milestoneId: uuid('milestone_id').references(() => milestones.id),
    title: text('title').notNull(),
    description: text('description'),
    filePath: text('file_path'), // R2 object key
    fileType: text('file_type'), // MIME type
    fileSize: integer('file_size'), // bytes
    version: integer('version').default(1).notNull(),
    uploadedById: uuid('uploaded_by_id')
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    projectIdx: index('deliverables_project_idx').on(t.projectId),
    milestoneIdx: index('deliverables_milestone_idx').on(t.milestoneId),
  }),
);

// ────────────────────────────────────────────────────────────────────
// Comments
// ────────────────────────────────────────────────────────────────────

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: uuid('author_id')
      .references(() => users.id)
      .notNull(),
    targetType: text('target_type').notNull(), // 'project'|'deliverable'|'milestone'|'voice_note'
    targetId: uuid('target_id').notNull(),
    body: text('body').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    parentCommentId: uuid('parent_comment_id'),
  },
  (t) => ({
    targetIdx: index('comments_target_idx').on(t.targetType, t.targetId),
    authorIdx: index('comments_author_idx').on(t.authorId),
  }),
);

// ────────────────────────────────────────────────────────────────────
// Voice Notes
// ────────────────────────────────────────────────────────────────────

export const voiceNotes = pgTable(
  'voice_notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: uuid('author_id')
      .references(() => users.id)
      .notNull(),
    targetType: text('target_type'),
    targetId: uuid('target_id'),
    audioFilePath: text('audio_file_path').notNull(),
    durationSeconds: integer('duration_seconds').notNull(),
    transcription: text('transcription'),
    transcriptionStatus: transcriptionStatusEnum('transcription_status')
      .default('pending')
      .notNull(),
    transcriptionRequestedAt: timestamp('transcription_requested_at'),
    transcriptionCompletedAt: timestamp('transcription_completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    authorIdx: index('voice_notes_author_idx').on(t.authorId),
    targetIdx: index('voice_notes_target_idx').on(t.targetType, t.targetId),
  }),
);

// ────────────────────────────────────────────────────────────────────
// Templates
// ────────────────────────────────────────────────────────────────────

export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  schema: jsonb('schema').notNull(), // Field definitions
  body: text('body').notNull(), // Handlebars template body
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const templateInstances = pgTable(
  'template_instances',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    templateId: uuid('template_id')
      .references(() => templates.id)
      .notNull(),
    projectId: uuid('project_id').references(() => projects.id),
    filledData: jsonb('filled_data').notNull(),
    generatedBody: text('generated_body').notNull(),
    createdById: uuid('created_by_id')
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    projectIdx: index('template_instances_project_idx').on(t.projectId),
    templateIdx: index('template_instances_template_idx').on(t.templateId),
  }),
);

// ────────────────────────────────────────────────────────────────────
// Knowledge Base
// ────────────────────────────────────────────────────────────────────

export const knowledgeDocs = pgTable(
  'knowledge_docs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    category: text('category').notNull(),
    body: text('body').notNull(), // Markdown
    version: integer('version').default(1).notNull(),
    isPublic: boolean('is_public').default(false).notNull(),
    visibleToTiers: jsonb('visible_to_tiers'), // null = all members
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    categoryIdx: index('knowledge_docs_category_idx').on(t.category),
  }),
);

// ────────────────────────────────────────────────────────────────────
// Pipeline (Correspondents)
// ────────────────────────────────────────────────────────────────────

export const pipelineEntries = pgTable(
  'pipeline_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    correspondentId: uuid('correspondent_id')
      .references(() => users.id)
      .notNull(),
    counterpartyName: text('counterparty_name').notNull(),
    counterpartyType: text('counterparty_type'), // 'investor'|'strategic'|'regulator'|'commercial'
    status: pipelineStatusEnum('status').notNull(),
    originationLevel: text('origination_level'), // 'material'|'co'|'support'
    expectedOutcome: text('expected_outcome'),
    nextAction: text('next_action'),
    nextActionDueAt: timestamp('next_action_due_at'),
    notes: text('notes'),
    acknowledgedByFounderAt: timestamp('acknowledged_by_founder_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    correspondentIdx: index('pipeline_correspondent_idx').on(t.correspondentId),
    statusIdx: index('pipeline_status_idx').on(t.status),
  }),
);

// ────────────────────────────────────────────────────────────────────
// Notifications
// ────────────────────────────────────────────────────────────────────

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    type: text('type').notNull(),
    title: text('title').notNull(),
    body: text('body'),
    link: text('link'),
    read: boolean('read').default(false).notNull(),
    sentToWhatsApp: boolean('sent_to_whatsapp').default(false).notNull(),
    whatsappSentAt: timestamp('whatsapp_sent_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('notifications_user_idx').on(t.userId),
    readIdx: index('notifications_read_idx').on(t.read),
  }),
);

// ────────────────────────────────────────────────────────────────────
// Sessions (Lucia)
// ────────────────────────────────────────────────────────────────────

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  (t) => ({
    userIdx: index('sessions_user_idx').on(t.userId),
  }),
);

// ────────────────────────────────────────────────────────────────────
// Audit Log
// ────────────────────────────────────────────────────────────────────

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    action: text('action').notNull(),
    targetType: text('target_type'),
    targetId: uuid('target_id'),
    payload: jsonb('payload'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('audit_log_user_idx').on(t.userId),
    targetIdx: index('audit_log_target_idx').on(t.targetType, t.targetId),
    createdAtIdx: index('audit_log_created_at_idx').on(t.createdAt),
  }),
);

// ────────────────────────────────────────────────────────────────────
// Relations
// ────────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  contributions: many(projectContributors),
  ownedMilestones: many(milestones),
  voiceNotes: many(voiceNotes),
  comments: many(comments),
  notifications: many(notifications),
  pipelineEntries: many(pipelineEntries),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  createdBy: one(users, { fields: [projects.createdById], references: [users.id] }),
  contributors: many(projectContributors),
  milestones: many(milestones),
  deliverables: many(deliverables),
}));

export const projectContributorsRelations = relations(projectContributors, ({ one }) => ({
  project: one(projects, {
    fields: [projectContributors.projectId],
    references: [projects.id],
  }),
  user: one(users, { fields: [projectContributors.userId], references: [users.id] }),
}));

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
  project: one(projects, { fields: [milestones.projectId], references: [projects.id] }),
  owner: one(users, { fields: [milestones.ownerId], references: [users.id] }),
  deliverables: many(deliverables),
}));

export const deliverablesRelations = relations(deliverables, ({ one }) => ({
  project: one(projects, { fields: [deliverables.projectId], references: [projects.id] }),
  milestone: one(milestones, {
    fields: [deliverables.milestoneId],
    references: [milestones.id],
  }),
  uploadedBy: one(users, { fields: [deliverables.uploadedById], references: [users.id] }),
}));

export const voiceNotesRelations = relations(voiceNotes, ({ one }) => ({
  author: one(users, { fields: [voiceNotes.authorId], references: [users.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
}));

export const pipelineEntriesRelations = relations(pipelineEntries, ({ one }) => ({
  correspondent: one(users, {
    fields: [pipelineEntries.correspondentId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

// ────────────────────────────────────────────────────────────────────
// Type exports
// ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Milestone = typeof milestones.$inferSelect;
export type NewMilestone = typeof milestones.$inferInsert;
export type Deliverable = typeof deliverables.$inferSelect;
export type NewDeliverable = typeof deliverables.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type VoiceNote = typeof voiceNotes.$inferSelect;
export type NewVoiceNote = typeof voiceNotes.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type TemplateInstance = typeof templateInstances.$inferSelect;
export type NewTemplateInstance = typeof templateInstances.$inferInsert;
export type KnowledgeDoc = typeof knowledgeDocs.$inferSelect;
export type NewKnowledgeDoc = typeof knowledgeDocs.$inferInsert;
export type PipelineEntry = typeof pipelineEntries.$inferSelect;
export type NewPipelineEntry = typeof pipelineEntries.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;

export type Tier = (typeof tierEnum.enumValues)[number];
export type ProjectType = (typeof projectTypeEnum.enumValues)[number];
export type ProjectStatus = (typeof projectStatusEnum.enumValues)[number];
export type MilestoneStatus = (typeof milestoneStatusEnum.enumValues)[number];
export type ContributionRole = (typeof contributionRoleEnum.enumValues)[number];
export type TranscriptionStatus = (typeof transcriptionStatusEnum.enumValues)[number];
export type PipelineStatus = (typeof pipelineStatusEnum.enumValues)[number];
