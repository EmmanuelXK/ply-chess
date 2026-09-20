import { Rating, type Grade } from "ts-fsrs";

import type { GradeName } from "./types";

/** First-attempt correct ratio → FSRS rating. Thresholds hardcoded for v1. */
export const HARD_MIN = 0.7;

/**
 * 100% → Good, or Easy if this is not the first post-learn review and no hints.
 * ≥70% → Hard.
 * <70% → Again.
 */
export function scoreToGrade(
  score: number,
  opts: { hintsUsed: number; priorReps: number },
): GradeName {
  if (score < HARD_MIN) return "again";
  if (score < 1) return "hard";
  if (opts.hintsUsed === 0 && opts.priorReps >= 1) return "easy";
  return "good";
}

export function gradeToRating(grade: GradeName): Grade {
  switch (grade) {
    case "again":
      return Rating.Again;
    case "hard":
      return Rating.Hard;
    case "good":
      return Rating.Good;
    case "easy":
      return Rating.Easy;
  }
}

export function gradeLabel(grade: GradeName): string {
  switch (grade) {
    case "again":
      return "Again";
    case "hard":
      return "Hard";
    case "good":
      return "Good";
    case "easy":
      return "Easy";
  }
}
