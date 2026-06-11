import { eq } from 'drizzle-orm';
import { db, notifications, users } from '@keep-playing/db';
import type { NotificationPayload } from './types';
import { sendWhatsAppNotification } from './whatsapp';
import { sendEmail, notificationEmailBody } from './email';

/**
 * Persist an in-app notification and fan out to proactive channels.
 *
 * Channel policy (spec v1.1):
 *  - In-app: always.
 *  - Email: for critical payloads (`sendEmail` flag or legacy `sendWhatsApp`),
 *    delivered to the member's email. The channel of record.
 *  - WhatsApp: only if the member has a number set AND the env is configured.
 *    Optional, never load-bearing.
 *
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

  const proactive = payload.sendEmail || payload.sendWhatsApp;
  if (!proactive) return n;

  const u = (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
  if (!u) return n;
  const name = u.displayName ?? u.fullName ?? 'friend';

  // Email — channel of record.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const mail = notificationEmailBody({
    recipientName: name,
    title: payload.title,
    body: payload.body,
    link: payload.link,
    appUrl,
  });
  const emailResult = await sendEmail({ to: u.email, ...mail });
  if (emailResult.ok) {
    await db
      .update(notifications)
      .set({ emailSentAt: new Date() })
      .where(eq(notifications.id, n.id));
  }

  // WhatsApp — optional, only when the member opted in with a number.
  if (payload.sendWhatsApp && u.whatsappNumber) {
    const result = await sendWhatsAppNotification({
      toE164: u.whatsappNumber,
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

  return n;
}
