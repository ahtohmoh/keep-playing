import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { catchUp } from '@/lib/catch-up';

export const runtime = 'nodejs';

/** The async loop, as JSON — consumed by the mobile app's Home tab. */
export async function GET() {
  const { user } = await requireUser();
  const items = await catchUp(user);
  return NextResponse.json({ items });
}
