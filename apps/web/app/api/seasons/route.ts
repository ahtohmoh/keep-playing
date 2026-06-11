import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { z } from 'zod';
import { db, seasons } from '@keep-playing/db';
import { requireUser } from '@/lib/session';
import { audit } from '@/lib/audit';
import { currentSeason } from '@/lib/seasons';

export const runtime = 'nodejs';

const seasonCreateSchema = z.object({
  name: z.string().min(1).max(120),
  theme: z.string().max(300).optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
});

export async function GET() {
  const { user } = await requireUser();
  void user;
  const [current, all] = await Promise.all([
    currentSeason(),
    db.select().from(seasons).orderBy(desc(seasons.startsAt)).limit(12),
  ]);
  return NextResponse.json({ current, seasons: all });
}

export async function POST(req: Request) {
  const { user } = await requireUser();
  if (user.tier !== 'founder') {
    return NextResponse.json({ title: 'Only the Founder names seasons.' }, { status: 403 });
  }
  const body = await req.json();
  const parsed = seasonCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { title: 'Invalid season.', detail: parsed.error.message },
      { status: 400 },
    );
  }
  if (parsed.data.endsAt <= parsed.data.startsAt) {
    return NextResponse.json({ title: 'A season must end after it starts.' }, { status: 400 });
  }

  const inserted = await db.insert(seasons).values(parsed.data).returning();
  await audit({
    userId: user.id,
    action: 'season.create',
    targetType: 'season',
    targetId: inserted[0]!.id,
    payload: { name: parsed.data.name },
  });
  return NextResponse.json({ season: inserted[0] }, { status: 201 });
}
