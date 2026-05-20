/**
 * WhatsApp Cloud API send + webhook verifier.
 *
 * In dev (no WHATSAPP_TOKEN), sends are logged and return {ok:true, mocked:true}.
 */
import { whatsappTemplates } from './templates';
import type { NotificationType } from './types';

export type WhatsAppSendResult =
  | { ok: true; mocked?: boolean; messageId?: string }
  | { ok: false; reason: string };

export async function sendWhatsAppNotification(opts: {
  toE164: string;
  type: NotificationType;
  variables: string[];
}): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const tmpl = whatsappTemplates[opts.type];

  if (!token || !phoneId) {
    // Dev/stub mode.
    // eslint-disable-next-line no-console
    console.log(
      `[whatsapp/mock] to=${opts.toE164} template=${tmpl.name} vars=${JSON.stringify(opts.variables)}`,
    );
    return { ok: true, mocked: true };
  }

  const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: opts.toE164,
      type: 'template',
      template: {
        name: tmpl.name,
        language: { code: tmpl.language },
        components: [
          {
            type: 'body',
            parameters: opts.variables.map((v) => ({ type: 'text', text: v })),
          },
        ],
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    return { ok: false, reason: `WhatsApp API error ${res.status}: ${detail.slice(0, 200)}` };
  }
  const data = (await res.json()) as { messages?: Array<{ id: string }> };
  return { ok: true, messageId: data.messages?.[0]?.id };
}

/** GET verifier for Meta webhook setup. */
export function verifyWebhookChallenge(searchParams: URLSearchParams): string | null {
  const expected = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token && expected && token === expected) {
    return challenge ?? '';
  }
  return null;
}
