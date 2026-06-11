/**
 * Email channel — Resend.
 *
 * The proactive channel of record (spec v1.1). WhatsApp is optional; email is
 * not. In dev (no RESEND_API_KEY), sends are logged to the console and treated
 * as delivered so flows can be exercised end-to-end.
 *
 * Voice rules apply to email too: short, declarative, quiet. One action per
 * email. No marketing chrome.
 */

const RESEND_API_URL = 'https://api.resend.com/emails';

export type EmailSendResult = { ok: boolean; id?: string; error?: string };

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'Keep Playing <hello@ahtohmoh.com>';

  if (!apiKey) {
    // Dev stub — visible in server logs, treated as delivered.
    console.log(`[email:stub] to=${to} subject="${subject}"\n${text}`);
    return { ok: true, id: 'stub' };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, text, html }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { ok: false, error: `resend ${res.status}: ${detail}` };
    }
    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}

/** Plain notification email in the practice's voice. */
export function notificationEmailBody({
  recipientName,
  title,
  body,
  link,
  appUrl,
}: {
  recipientName: string;
  title: string;
  body?: string | null;
  link?: string | null;
  appUrl: string;
}): { subject: string; text: string } {
  const lines = [`${recipientName},`, '', title];
  if (body) lines.push('', body);
  if (link) lines.push('', `Open: ${appUrl}${link}`);
  lines.push('', '—', 'Keep Playing · The operating environment for AhTohMoh');
  return { subject: title, text: lines.join('\n') };
}
