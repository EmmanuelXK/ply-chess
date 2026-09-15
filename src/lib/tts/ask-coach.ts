import type { CoachKind } from "@/lib/openings/coach";
import { shouldOpenCoachExplain } from "@/lib/openings/deviation";

/**
 * Product lock: the Learn board is quiet until the player taps Ask Coach.
 * shouldSpeakCoach / Coach Brain still decide *what* to say when asked.
 */
export function shouldAutoSpeakOnScene(): boolean {
  return false;
}

/** A miss opens the richer Coach explain view. Ordinary taps still speak the strip. */
export function shouldOpenExplainOnCoachTap(kind: CoachKind): boolean {
  return shouldOpenCoachExplain(kind);
}
