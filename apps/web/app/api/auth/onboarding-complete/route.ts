import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, users } from '@keep-playing/db';
import { notify } from '@keep-playing/notifications';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';

async function complete(req: Request) {
  const { user } = await requireUser();
  if (!user.onboardingCompletedAt) {
    await db
      .update(users)
      .set({ onboardingCompletedAt: new Date() })
      .where(eq(users.id, user.id));

    // Notify the Founder.
    const founders = await db.select().from(users).where(eq(users.tier, 'founder'));
    for (const f of founders) {
      if (f.id === user.id) continue;
      await notify(f.id, {
        type: 'member_onboarded',
        title: `${user.displayName ?? user.fullName} just completed onboarding.`,
        body: 'Welcome them in.',
        link: `/members/${user.id}`,
        sendEmail: true, sendWhatsApp: true,
      });
    }

    await audit({ userId: user.id, action: 'onboarding.complete' });
  }
  return NextResponse.redirect(new URL('/home', req.url), { status: 303 });
}

export const GET = complete;
export const POST = complete;
