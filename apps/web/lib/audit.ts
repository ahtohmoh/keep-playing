/**
 * Audit log helper.
 *
 * Every state-changing route handler writes here. The audit log is append-only
 * and visible to the Founder. See §20 of the spec.
 */
import 'server-only';
import { db, auditLog } from '@keep-playing/db';

export async function audit(args: {
  userId: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  payload?: Record<string, unknown>;
}) {
  await db.insert(auditLog).values({
    userId: args.userId,
    action: args.action,
    targetType: args.targetType,
    targetId: args.targetId,
    payload: args.payload ?? null,
  });
}
