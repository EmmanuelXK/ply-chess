/**
 * Per-move spacing ladder for repertoire reps.
 * Level 1 is 4 hours, then 1 day, 3 days, 1 week, 2 weeks,
 * 1 month, 3 months, and 6 months.
 * A miss returns that move to level 1.
 * The daily queue targets about 12 minutes, inside a 10–15 minute session.
 */

export const HOUR_MS = 60 * 60 * 1000;

/** Hours until the next review, indexed by level (level 1 uses index 0). */
export const LADDER_HOURS = [4, 24, 72, 168, 336, 720, 2160, 4320] as const;

/** Planning assumption for the daily queue length. */
export const SECONDS_PER_RECALL = 18;

/** Sits in the middle of a 10–15 minute review. */
export const DAILY_QUEUE_MINUTES = 12;

export const DAILY_QUEUE_CAP = Math.round(
  (DAILY_QUEUE_MINUTES * 60) / SECONDS_PER_RECALL,
);

export interface RepCard {
  openingId: string;
  ply: number;
  /** 0 = unseen. 1 is the first ladder step. */
  level: number;
  due: number;
}

export function clampLevel(level: number): number {
  if (!Number.isFinite(level)) return 0;
  return Math.max(0, Math.min(LADDER_HOURS.length, Math.round(level)));
}

export function gradeCard(
  prev: RepCard | undefined,
  openingId: string,
  ply: number,
  ok: boolean,
  now: number,
): RepCard {
  if (!ok) {
    return {
      openingId,
      ply,
      level: 1,
      due: now + LADDER_HOURS[0] * HOUR_MS,
    };
  }
  const level = clampLevel(Math.max(0, prev?.level ?? 0) + 1);
  const step = Math.max(1, level);
  return {
    openingId,
    ply,
    level: step,
    due: now + LADDER_HOURS[step - 1] * HOUR_MS,
  };
}

/** First time a move is shown in Learn. Leaves an existing card alone. */
export function introduceCard(
  prev: RepCard | undefined,
  openingId: string,
  ply: number,
  now: number,
): RepCard | null {
  if (prev && prev.level > 0) return null;
  return gradeCard(undefined, openingId, ply, true, now);
}

export function takeDailyQueue(cards: RepCard[], now: number, cap = DAILY_QUEUE_CAP): RepCard[] {
  return cards
    .filter((card) => card.level > 0 && card.due <= now)
    .sort((a, b) => a.due - b.due || a.openingId.localeCompare(b.openingId) || a.ply - b.ply)
    .slice(0, cap);
}

export function queueMinutes(count: number): number {
  if (count <= 0) return 0;
  return Math.max(1, Math.round((count * SECONDS_PER_RECALL) / 60));
}
