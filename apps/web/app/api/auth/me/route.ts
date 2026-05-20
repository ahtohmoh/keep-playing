import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/session';

export const runtime = 'nodejs';

export async function GET() {
  const { user } = await getCurrentSession();
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      displayName: user.displayName,
      tier: user.tier,
      craft: user.craft,
      location: user.location,
      onboardingCompletedAt: user.onboardingCompletedAt,
    },
  });
}
