CREATE TYPE "public"."contribution_role" AS ENUM('lead', 'contributor', 'reviewer', 'observer');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('pending', 'in_progress', 'complete', 'overdue');--> statement-breakpoint
CREATE TYPE "public"."pipeline_status" AS ENUM('identified', 'in_conversation', 'proposal', 'closed', 'lost');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'active', 'on_hold', 'shipped', 'archived');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('commissioned_engagement', 'internal_investigation', 'operational_sponsorship', 'artifact', 'prototype');--> statement-breakpoint
CREATE TYPE "public"."tier" AS ENUM('founder', 'resident', 'fellow', 'correspondent', 'external_collaborator');--> statement-breakpoint
CREATE TYPE "public"."transcription_status" AS ENUM('pending', 'processing', 'complete', 'failed');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" uuid,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"parent_comment_id" uuid
);
--> statement-breakpoint
CREATE TABLE "deliverables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"milestone_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"file_path" text,
	"file_type" text,
	"file_size" integer,
	"version" integer DEFAULT 1 NOT NULL,
	"uploaded_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_docs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"body" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"visible_to_tiers" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "knowledge_docs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"owner_id" uuid,
	"status" "milestone_status" DEFAULT 'pending' NOT NULL,
	"due_at" timestamp,
	"completed_at" timestamp,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"link" text,
	"read" boolean DEFAULT false NOT NULL,
	"sent_to_whatsapp" boolean DEFAULT false NOT NULL,
	"whatsapp_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"correspondent_id" uuid NOT NULL,
	"counterparty_name" text NOT NULL,
	"counterparty_type" text,
	"status" "pipeline_status" NOT NULL,
	"origination_level" text,
	"expected_outcome" text,
	"next_action" text,
	"next_action_due_at" timestamp,
	"notes" text,
	"acknowledged_by_founder_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_contributors" (
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "contribution_role" NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp,
	CONSTRAINT "project_contributors_project_id_user_id_pk" PRIMARY KEY("project_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"artifact_number" integer,
	"type" "project_type" NOT NULL,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"description" text,
	"brief" jsonb,
	"start_date" timestamp,
	"target_ship_date" timestamp,
	"shipped_at" timestamp,
	"external_partner_name" text,
	"is_external_commission" boolean DEFAULT false NOT NULL,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp,
	"metadata" jsonb,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"project_id" uuid,
	"filled_data" jsonb NOT NULL,
	"generated_body" text NOT NULL,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"schema" jsonb NOT NULL,
	"body" text NOT NULL,
	"category" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"display_name" text,
	"tier" "tier" NOT NULL,
	"whatsapp_number" text,
	"avatar_url" text,
	"bio" text,
	"craft" text,
	"location" text,
	"signed_agreement_url" text,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"onboarding_completed_at" timestamp,
	"active" boolean DEFAULT true NOT NULL,
	"password_hash" text,
	"metadata" jsonb,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "voice_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"target_type" text,
	"target_id" uuid,
	"audio_file_path" text NOT NULL,
	"duration_seconds" integer NOT NULL,
	"transcription" text,
	"transcription_status" "transcription_status" DEFAULT 'pending' NOT NULL,
	"transcription_requested_at" timestamp,
	"transcription_completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_entries" ADD CONSTRAINT "pipeline_entries_correspondent_id_users_id_fk" FOREIGN KEY ("correspondent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_contributors" ADD CONSTRAINT "project_contributors_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_contributors" ADD CONSTRAINT "project_contributors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_instances" ADD CONSTRAINT "template_instances_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_instances" ADD CONSTRAINT "template_instances_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_instances" ADD CONSTRAINT "template_instances_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_notes" ADD CONSTRAINT "voice_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_user_idx" ON "audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_log_target_idx" ON "audit_log" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "comments_target_idx" ON "comments" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "comments_author_idx" ON "comments" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "deliverables_project_idx" ON "deliverables" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "deliverables_milestone_idx" ON "deliverables" USING btree ("milestone_id");--> statement-breakpoint
CREATE INDEX "knowledge_docs_category_idx" ON "knowledge_docs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "milestones_project_idx" ON "milestones" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "milestones_status_idx" ON "milestones" USING btree ("status");--> statement-breakpoint
CREATE INDEX "milestones_due_at_idx" ON "milestones" USING btree ("due_at");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" USING btree ("read");--> statement-breakpoint
CREATE INDEX "pipeline_correspondent_idx" ON "pipeline_entries" USING btree ("correspondent_id");--> statement-breakpoint
CREATE INDEX "pipeline_status_idx" ON "pipeline_entries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_contributors_user_idx" ON "project_contributors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "projects_type_idx" ON "projects" USING btree ("type");--> statement-breakpoint
CREATE INDEX "projects_artifact_number_idx" ON "projects" USING btree ("artifact_number");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "template_instances_project_idx" ON "template_instances" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "template_instances_template_idx" ON "template_instances" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "users_tier_idx" ON "users" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "users_active_idx" ON "users" USING btree ("active");--> statement-breakpoint
CREATE INDEX "voice_notes_author_idx" ON "voice_notes" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "voice_notes_target_idx" ON "voice_notes" USING btree ("target_type","target_id");