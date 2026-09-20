import { SHORT_HOOKS, spokenHook } from "@/lib/dialogue/hooks";
import {
  leadsWithCoordinateDump,
  leadsWithSan,
  limitWords,
  stripMoveDumpLead,
  twoBeatLine,
} from "@/lib/dialogue/short";
import { chunkAt, looksLikeMoveList, positionalIdea } from "./helpers";
import { historyAt } from "./history";
import { isKeyPly } from "./key-ply";
import { housePicture } from "./memory";
import { professorAt } from "./professor";
import type { Opening } from "./types";

function shortLine(text: string | undefined, max = 15): string {
  return limitWords(text ?? "", max);
}

function hookLine(opening: Opening, afterPly: number): string | undefined {
  const row = SHORT_HOOKS[opening.id]?.find((h) => h.ply === afterPly);
  if (!row) return undefined;
  return spokenHook(row);
}

export type CoachKind =
  | "start"
  | "ok"
  | "fail"
  | "hint"
  | "pin"
  | "plan"
  | "why"
  | "quiz"
  | "history";

export interface CoachState {
  text: string;
  detail?: string;
  chunkName?: string;
  kind: CoachKind;
  pinLabel?: string;
}

function professorLine(opening: Opening, afterPly: number): string | undefined {
  const script = professorAt(opening, afterPly);
  if (!script) return undefined;
  return shortLine(script.concept, 12);
}

export function coachAtStart(opening: Opening): CoachState {
  const house = opening.chunks[0];
  const hook = hookLine(opening, -1);
  const cast = shortLine(opening.story.cast, 12);
  return {
    text: hook ?? cast,
    chunkName: house?.name,
    kind: "start",
  };
}

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

/** Auto-teach only on key / highlighted plies. Fail, hint, Why, and plan stay live. */
export function shouldSpeakCoach(
  kind: CoachKind,
  opening: Opening,
  afterPly: number,
): boolean {
  if (ALWAYS_SPEAK.has(kind)) return true;
  return isKeyPly(opening, afterPly);
}

/**
 * Strip tap is an explicit request to hear — ignore shouldSpeakCoach.
 * Quiet plies replay the last spoken beat instead of "Your move".
 */
export function textForCoachTap(
  currentLine: string,
  lastSpoken: string,
): string | null {
  const current = currentLine.replace(/\s+/g, " ").trim();
  if (current) return current;
  const last = lastSpoken.replace(/\s+/g, " ").trim();
  return last || null;
}

export function coachAfterPly(opening: Opening, afterPly: number): CoachState {
  const chunk = chunkAt(opening, afterPly);
  if (!isKeyPly(opening, afterPly)) {
    return {
      text: "",
      chunkName: chunk?.name,
      kind: "ok",
    };
  }

  const pin = opening.pins.find((p) => p.afterPly === afterPly);
  const hook = hookLine(opening, afterPly);
  const beat = opening.storyBeats.find((b) => b.afterPly === afterPly);
  const line = opening.coach.find((c) => c.afterPly === afterPly);
  const mark = historyAt(opening, afterPly + 1)[0];
  const concept = professorLine(opening, afterPly);
  const picture = housePicture(chunk);

  if (pin) {
    return {
      text: hook ?? shortLine(`${picture} That's the landmark.`, 15),
      chunkName: chunk?.name,
      kind: "pin",
      pinLabel: pin.label,
    };
  }
  if (hook) {
    return {
      text: hook,
      chunkName: chunk?.name,
      kind: "ok",
    };
  }
  if (beat) {
    return {
      text: shortLine(concept ?? beat.beat ?? picture, 14),
      chunkName: chunk?.name,
      kind: "ok",
    };
  }
  if (line) {
    return {
      text: shortLine(concept ?? line.text ?? picture, 14),
      chunkName: chunk?.name,
      kind: "ok",
    };
  }
  if (mark) {
    return {
      text: shortLine(
        mark.whyItMattersHere || `${mark.year}. ${mark.title} is the landmark.`,
        14,
      ),
      chunkName: chunk?.name,
      kind: "history",
    };
  }
  return {
    text: shortLine(concept ?? picture ?? opening.story.plan, 14),
    chunkName: chunk?.name,
    kind: "ok",
  };
}

export function coachOnFail(opening: Opening, ply: number): CoachState {
  const chunk = chunkAt(opening, ply);
  const expected = opening.moves[ply] ?? "";
  const script = professorAt(opening, Math.max(0, ply - 1));
  const idea = positionalIdea(
    script?.why ?? chunk?.job ?? "",
    chunk?.name ?? "one square, one job",
  );
  return {
    text: shortLine(`Not that square. ${idea}`, 14),
    detail: expected
      ? `Play ${expected}. That's the job.`
      : "Stay with the idea. One move.",
    chunkName: chunk?.name,
    kind: "fail",
  };
}

export function coachOnHint(opening: Opening, ply: number): CoachState {
  const chunk = chunkAt(opening, ply);
  const san = opening.moves[ply] ?? "";
  const script = professorAt(opening, ply);
  return {
    text: shortLine(script?.concept ?? chunk?.job ?? "That's the square.", 14),
    detail: san ? `Play ${san}.` : shortLine(script?.why, 12),
    chunkName: chunk?.name,
    kind: "hint",
  };
}

function lastHook(opening: Opening) {
  const rows = SHORT_HOOKS[opening.id];
  if (!rows?.length) return undefined;
  return [...rows].sort((a, b) => b.ply - a.ply)[0];
}

/**
 * Plan chips change the idea, not a move dump.
 * Strip = they/we pictures. Raw plan (may name moves) stays in detail/Why.
 */
export function planStripText(
  opening: Opening,
  voice: "steady" | "creative" | "aggressive",
): string {
  const hook = lastHook(opening);
  const peeled = stripMoveDumpLead(opening.plans[voice]);
  const dump =
    !peeled ||
    leadsWithSan(peeled) ||
    leadsWithCoordinateDump(peeled) ||
    looksLikeMoveList(peeled);
  const we = dump ? (hook?.we ?? opening.story.plan) : peeled;
  if (hook?.they) return twoBeatLine(hook.they, we);
  return limitWords(we);
}

export function coachOnPlan(
  voice: "steady" | "creative" | "aggressive",
  opening: Opening,
): CoachState {
  return {
    text: planStripText(opening, voice),
    detail: opening.plans[voice],
    chunkName: "Plan mode",
    kind: "plan",
  };
}
