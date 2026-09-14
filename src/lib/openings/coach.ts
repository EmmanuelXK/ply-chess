import { chunkAt, firstSentence, positionalIdea } from "./helpers";
import { historyAt } from "./history";
import { isKeyPly } from "./key-ply";
import { housePicture, pinSpeech } from "./memory";
import { professorAt } from "./professor";
import type { Opening } from "./types";

function shortLine(text: string | undefined, max = 15): string {
  const compact = (text ?? "").replace(/\s+/g, " ").trim();
  if (!compact) return "";
  const sentence = firstSentence(compact);
  const words = sentence.split(" ").filter(Boolean).slice(0, max);
  return words.join(" ");
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
  return {
    text: shortLine(opening.story.cast, 12),
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
  const beat = opening.storyBeats.find((b) => b.afterPly === afterPly);
  const line = opening.coach.find((c) => c.afterPly === afterPly);
  const mark = historyAt(opening, afterPly + 1)[0];
  const concept = professorLine(opening, afterPly);
  const picture = housePicture(chunk);

  if (pin) {
    return {
      text: shortLine(`${pinSpeech(pin)} ${picture}`, 15),
      chunkName: chunk?.name,
      kind: "pin",
      pinLabel: pin.label,
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
    text: shortLine(`Play ${san}. ${script?.concept ?? chunk?.job ?? ""}`, 14),
    detail: shortLine(script?.why, 12),
    chunkName: chunk?.name,
    kind: "hint",
  };
}

export function coachOnPlan(
  voice: "steady" | "creative" | "aggressive",
  opening: Opening,
): CoachState {
  return {
    text: opening.plans[voice],
    detail: opening.pillars.attackingPlan,
    chunkName: "Plan mode",
    kind: "plan",
  };
}
