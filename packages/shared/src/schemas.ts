/**
 * Zod schemas for request bodies and form inputs.
 *
 * These mirror the database schema where they map cleanly. Server route
 * handlers parse with these; client forms validate with these (via react-hook-form
 * + @hookform/resolvers/zod).
 */
import { z } from 'zod';
import {
  TIERS,
  PROJECT_TYPES,
  PROJECT_STATUSES,
  MILESTONE_STATUSES,
  CONTRIBUTION_ROLES,
} from './tiers';

// --- Auth ---

export const emailSchema = z.string().email().toLowerCase().trim();

export const signupSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(12, 'Use at least 12 characters.')
    .max(128, "That's longer than we need."),
  fullName: z.string().min(1).max(120),
  displayName: z.string().min(1).max(60).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const magicLinkSchema = z.object({
  email: emailSchema,
});

// --- Member profile ---

export const profileUpdateSchema = z.object({
  fullName: z.string().min(1).max(120).optional(),
  displayName: z.string().min(1).max(60).optional(),
  bio: z.string().max(1200).optional(),
  craft: z.string().max(120).optional(),
  location: z.string().max(120).optional(),
  whatsappNumber: z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/, 'Use E.164 format, e.g. +233...')
    .optional()
    .or(z.literal('')),
});

// --- Projects ---

export const projectCreateSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Lowercase, hyphenated, no spaces.'),
  title: z.string().min(1).max(200),
  type: z.enum(PROJECT_TYPES),
  description: z.string().max(2000).optional(),
  artifactNumber: z.number().int().positive().optional(),
  isExternalCommission: z.boolean().default(false),
  externalPartnerName: z.string().max(200).optional(),
  startDate: z.coerce.date().optional(),
  targetShipDate: z.coerce.date().optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial().extend({
  status: z.enum(PROJECT_STATUSES).optional(),
});

export const projectContributorAddSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(CONTRIBUTION_ROLES),
});

// --- Milestones ---

export const milestoneCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  ownerId: z.string().uuid().optional(),
  dueAt: z.coerce.date().optional(),
  orderIndex: z.number().int().nonnegative().default(0),
});

export const milestoneUpdateSchema = milestoneCreateSchema.partial().extend({
  status: z.enum(MILESTONE_STATUSES).optional(),
});

// --- Comments ---

export const commentCreateSchema = z.object({
  targetType: z.enum(['project', 'deliverable', 'milestone', 'voice_note']),
  targetId: z.string().uuid(),
  body: z.string().min(1).max(8000),
  parentCommentId: z.string().uuid().optional(),
});

// --- Voice notes ---

export const voiceNoteInitSchema = z.object({
  durationSeconds: z.number().int().positive().max(600),
  targetType: z.enum(['project', 'deliverable', 'milestone', 'comment']).optional(),
  targetId: z.string().uuid().optional(),
});

// --- Pipeline ---

export const pipelineEntrySchema = z.object({
  counterpartyName: z.string().min(1).max(200),
  counterpartyType: z.enum(['investor', 'strategic', 'regulator', 'commercial']).optional(),
  status: z.enum(['identified', 'in_conversation', 'proposal', 'closed', 'lost']),
  originationLevel: z.enum(['material', 'co', 'support']).optional(),
  expectedOutcome: z.string().max(2000).optional(),
  nextAction: z.string().max(500).optional(),
  nextActionDueAt: z.coerce.date().optional(),
  notes: z.string().max(4000).optional(),
});

// --- Founder invite ---

export const memberInviteSchema = z.object({
  email: emailSchema,
  fullName: z.string().min(1).max(120),
  displayName: z.string().max(60).optional(),
  tier: z.enum(TIERS),
  craft: z.string().max(120).optional(),
});

// --- Inferred types ---

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type MilestoneCreateInput = z.infer<typeof milestoneCreateSchema>;
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
export type VoiceNoteInitInput = z.infer<typeof voiceNoteInitSchema>;
export type PipelineEntryInput = z.infer<typeof pipelineEntrySchema>;
export type MemberInviteInput = z.infer<typeof memberInviteSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
