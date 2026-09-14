import { chunkAt, firstSentence, positionalIdea } from "./helpers";
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
  const picture = housePicture(house);
  return {
    text: shortLine(opening.story.cast, 12),
    detail: shortLine(
      house?.name && picture !== house.name
        ? `${house.name}: ${picture}`
        : picture,
      14,
    ),
    chunkName: house?.name,
    kind: "start",
  };
}

export function coachAfterPly(opening: Opening, afterPly: number): CoachState {
  const chunk = chunkAt(opening, afterPly);
  const pin = opening.pins.find((p) => p.afterPly === afterPly);
  const beat = opening.storyBeats.find((b) => b.afterPly === afterPly);
  const line = opening.coach.find((c) => c.afterPly === afterPly);
  const concept = professorLine(opening, afterPly);
  const enteredChunk =
    chunk && (afterPly === chunk.fromPly || afterPly === chunk.fromPly + 1);

  const picture = housePicture(chunk);

  if (pin) {
    return {
      text: shortLine(`${pinSpeech(pin)} ${picture}`, 15),
      detail: shortLine(chunk?.job ?? opening.story.plan, 12),
      chunkName: chunk?.name,
      kind: "pin",
      pinLabel: pin.label,
    };
  }
  if (beat) {
    return {
      text: shortLine(concept ?? beat.beat ?? picture, 14),
      detail: shortLine(chunk?.job ?? picture, 12),
      chunkName: chunk?.name,
      kind: "ok",
    };
  }
  if (enteredChunk && chunk) {
    return {
      text: shortLine(picture, 12),
      detail: shortLine(chunk.job, 12),
      chunkName: chunk.name,
      kind: "ok",
    };
  }
  if (line) {
    return {
      text: shortLine(concept ?? line.text ?? picture, 14),
      detail: shortLine(chunk?.job ?? picture, 12),
      chunkName: chunk?.name,
      kind: "ok",
    };
  }
  return {
    text: shortLine(concept ?? picture ?? opening.story.plan, 14),
    detail: shortLine(chunk?.job ?? opening.story.conflict, 12),
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
