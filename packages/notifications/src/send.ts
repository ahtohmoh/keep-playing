import { eq } from 'drizzle-orm';
import { db, notifications, users } from '@keep-playing/db';
import type { NotificationPayload } from './types';
import { sendWhatsAppNotification } from './whatsapp';

/**
 * Persist an in-app notification and (optionally) fan out to WhatsApp.
 * Idempotency: callers should check whether they've already notified for this
 * (userId, type, targetId) tuple before calling — this function does not.
 */
export async function notify(userId: string, payload: NotificationPayload) {
  const inserted = await db
    .insert(notifications)
    .values({
      userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      link: payload.link,
    })
    .returning();
  const n = inserted[0]!;

  if (payload.sendWhatsApp) {
    const u = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const phone = u[0]?.whatsappNumber;
    const name = u[0]?.displayName ?? u[0]?.fullName ?? 'friend';
    if (phone) {
      const result = await sendWhatsAppNotification({
        toE164: phone,
        type: payload.type,
        variables: [name, payload.title, payload.body ?? '', payload.link ?? ''],
      });
      if (result.ok) {
        await db
          .update(notifications)
          .set({ sentToWhatsApp: true, whatsappSentAt: new Date() })
          .where(eq(notifications.id, n.id));
      }
    }
  }

  return n;
}
