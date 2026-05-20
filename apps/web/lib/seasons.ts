/**
 * Seasons.
 *
 * Time at AhTohMoh moves in seasons, not quarters. A season is ~13 weeks.
 * Stage 1 hardcodes the season names from a small calendar; Stage 2 can let
 * the Founder set them per cycle.
 */

export type Season = {
  name: string;
  startAt: Date;
  endAt: Date;
};

const KP_EPOCH = new Date('2026-05-01T00:00:00Z'); // The founding season starts here.

const SEASON_NAMES = [
  'The Founding Season',
  'The First Spring',
  'The Long Listen',
  'The Open Field',
];

export function currentSeason(now: Date = new Date()): Season {
  const week = Math.floor(
    (now.getTime() - KP_EPOCH.getTime()) / (1000 * 60 * 60 * 24 * 7),
  );
  const seasonIndex = Math.max(0, Math.floor(week / 13));
  const start = new Date(KP_EPOCH.getTime() + seasonIndex * 13 * 7 * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 13 * 7 * 24 * 60 * 60 * 1000);
  const name = SEASON_NAMES[seasonIndex % SEASON_NAMES.length] ?? 'Unnamed Season';
  return { name, startAt: start, endAt: end };
}

export function seasonProgress(now: Date = new Date()): number {
  const s = currentSeason(now);
  const elapsed = now.getTime() - s.startAt.getTime();
  const total = s.endAt.getTime() - s.startAt.getTime();
  return Math.min(1, Math.max(0, elapsed / total));
}
