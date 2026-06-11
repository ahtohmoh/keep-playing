ALTER TABLE "audit_log" ADD COLUMN "project_id" uuid;--> statement-breakpoint
CREATE INDEX "audit_log_project_idx" ON "audit_log" USING btree ("project_id","created_at");