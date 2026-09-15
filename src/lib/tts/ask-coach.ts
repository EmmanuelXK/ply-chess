import type { CoachKind } from "@/lib/openings/coach";
import { shouldOpenCoachExplain } from "@/lib/openings/deviation";

/**
 * Product lock: the Learn board is quiet until the player taps Ask Coach.
 * shouldSpeakCoach / Coach Brain still decide *what* to say when asked.
 */
export function shouldAutoSpeakOnScene(): boolean {
  return false;
}

/** Any movement can be explained — but only when the player taps Ask Coach. */
export function shouldOpenExplainOnCoachTap(_kind?: CoachKind): boolean {
  return shouldOpenCoachExplain(_kind);
}
