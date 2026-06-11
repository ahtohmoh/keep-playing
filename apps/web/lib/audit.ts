/**
 * Audit log helper.
 *
 * Every state-changing route handler writes here. The audit log is append-only
 * and visible to the Founder. See §20 of the spec.
 *
 * Pass `projectId` for any action that belongs to a project — it powers the
 * catch-up feed ("since you were here") and unread markers.
 */
import 'server-only';
import { db, auditLog } from '@keep-playing/db';

export async function audit(args: {
  userId: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  projectId?: string;
  payload?: Record<string, unknown>;
}) {
  await db.insert(auditLog).values({
    userId: args.userId,
    action: args.action,
    targetType: args.targetType,
    targetId: args.targetId,
    projectId: args.projectId,
    payload: args.payload ?? null,
  });
}
