import { createEmptyCard, fsrs, type Card } from "ts-fsrs";

import { startOfTomorrow } from "./dates";
import { gradeToRating, scoreToGrade } from "./grade";
import type { GradeName, StoredFsrsCard } from "./types";

/**
 * FSRS at ~90% retention. Short-term (minute) steps off so a failed *line*
 * comes back tomorrow, not in ten minutes — right for a 30-move variation.
 * Max interval 180d. No fuzz so due dates stay deterministic in tests.
 */
export const scheduler = fsrs({
  request_retention: 0.9,
  maximum_interval: 180,
  enable_fuzz: false,
  enable_short_term: false,
});

export function toStored(card: Card): StoredFsrsCard {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review?.toISOString(),
  };
}

export function fromStored(stored: StoredFsrsCard): Card {
  return {
    due: new Date(stored.due),
    stability: stored.stability,
    difficulty: stored.difficulty,
    elapsed_days: stored.elapsed_days,
    scheduled_days: stored.scheduled_days,
    learning_steps: stored.learning_steps,
    reps: stored.reps,
    lapses: stored.lapses,
    state: stored.state,
    last_review: stored.last_review ? new Date(stored.last_review) : undefined,
  };
}

/** New card, due next local calendar day. No recall grade. */
export function enrollNewCard(now: Date): Card {
  const card = createEmptyCard(now);
  return { ...card, due: startOfTomorrow(now) };
}

export function reviewCard(
  stored: StoredFsrsCard | null,
  score: number,
  opts: { hintsUsed: number; now: Date },
): { card: Card; grade: GradeName } {
  const current = stored ? fromStored(stored) : createEmptyCard(opts.now);
  const grade = scoreToGrade(score, {
    hintsUsed: opts.hintsUsed,
    priorReps: current.reps,
  });
  const { card } = scheduler.next(current, opts.now, gradeToRating(grade));
  return { card, grade };
}
