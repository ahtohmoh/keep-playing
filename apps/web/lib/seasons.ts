/**
 * Seasons.
 *
 * Time at AhTohMoh moves in seasons, not quarters. The Founder names each
 * season (seasons table). When no named season covers the current date, we
 * fall back to computed 13-week cycles from the founding epoch so the platform
 * always knows what season it is.
 */
import { and, gte, lte, desc } from 'drizzle-orm';
import { db, seasons } from '@keep-playing/db';

export type SeasonInfo = {
  name: string;
  theme: string | null;
  startAt: Date;
  endAt: Date;
  named: boolean; // true if from the seasons table
};

const KP_EPOCH = new Date('2026-05-01T00:00:00Z');

const FALLBACK_NAMES = [
  'The Founding Season',
  'The First Spring',
  'The Long Listen',
  'The Open Field',
];

function computedSeason(now: Date): SeasonInfo {
  const week = Math.floor((now.getTime() - KP_EPOCH.getTime()) / (1000 * 60 * 60 * 24 * 7));
  const idx = Math.max(0, Math.floor(week / 13));
  const start = new Date(KP_EPOCH.getTime() + idx * 13 * 7 * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 13 * 7 * 24 * 60 * 60 * 1000);
  return {
    name: FALLBACK_NAMES[idx % FALLBACK_NAMES.length] ?? 'Unnamed Season',
    theme: null,
    startAt: start,
    endAt: end,
    named: false,
  };
}

export async function currentSeason(now: Date = new Date()): Promise<SeasonInfo> {
  const rows = await db
    .select()
    .from(seasons)
    .where(and(lte(seasons.startsAt, now), gte(seasons.endsAt, now)))
    .orderBy(desc(seasons.startsAt))
    .limit(1);
  const named = rows[0];
  if (named) {
    return {
      name: named.name,
      theme: named.theme,
      startAt: named.startsAt,
      endAt: named.endsAt,
      named: true,
    };
  }
  return computedSeason(now);
}

export async function seasonProgress(now: Date = new Date()): Promise<number> {
  const s = await currentSeason(now);
  const elapsed = now.getTime() - s.startAt.getTime();
  const total = s.endAt.getTime() - s.startAt.getTime();
  return Math.min(1, Math.max(0, elapsed / total));
}
