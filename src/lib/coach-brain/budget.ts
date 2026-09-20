import type { CoachKind } from "@/lib/openings/coach";
import type { SpeechBudget } from "./types";

const ALWAYS_SPEAK: ReadonlySet<CoachKind> = new Set([
  "start",
  "fail",
  "hint",
  "pin",
  "plan",
  "why",
  "quiz",
  "history",
]);

const DEFAULT_WINDOW = 6;
const DEFAULT_MAX_OPTIONAL = 2;

/**
 * Extra sparsity on top of shouldSpeakCoach.
 * Fail / hint / pin / start / why always pass. Optional "ok" beats are capped.
 */
export function createSpeechBudget(opts?: {
  windowPlies?: number;
  maxOptional?: number;
}): SpeechBudget {
  const windowPlies = opts?.windowPlies ?? DEFAULT_WINDOW;
  const maxOptional = opts?.maxOptional ?? DEFAULT_MAX_OPTIONAL;
  const optionalAt: number[] = [];
  let spoken = 0;

  return {
    canSpeak(kind, ply) {
      if (ALWAYS_SPEAK.has(kind)) return true;
      const inWindow = optionalAt.filter((at) => ply - at >= 0 && ply - at < windowPlies);
      return inWindow.length < maxOptional;
    },
    noteSpoken(kind, ply) {
      spoken += 1;
      if (!ALWAYS_SPEAK.has(kind)) optionalAt.push(ply);
    },
    spokenCount() {
      return spoken;
    },
  };
}

let session: SpeechBudget | null = null;

export function sessionBudget(): SpeechBudget {
  session ??= createSpeechBudget();
  return session;
}

export function resetSessionBudget(): void {
  session = createSpeechBudget();
}

export function alwaysSpeakKind(kind: CoachKind): boolean {
  return ALWAYS_SPEAK.has(kind);
}
