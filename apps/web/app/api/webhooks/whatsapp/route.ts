import { NextResponse } from 'next/server';
import { verifyWebhookChallenge } from '@keep-playing/notifications';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const challenge = verifyWebhookChallenge(url.searchParams);
  if (challenge === null) {
    return NextResponse.json({ title: 'Verification failed.' }, { status: 403 });
  }
  return new NextResponse(challenge, { status: 200, headers: { 'content-type': 'text/plain' } });
}

export async function POST(req: Request) {
  // Meta posts message-status updates here (delivered, read, failed, etc.).
  // We just audit them for Stage 1. Stage 2 could update notifications table.
  const body = await req.json().catch(() => ({}));
  await audit({
    userId: null,
    action: 'webhook.whatsapp',
    payload: body,
  });
  return NextResponse.json({ ok: true });
}
