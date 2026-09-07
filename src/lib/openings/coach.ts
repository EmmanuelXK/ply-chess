import { chunkAt } from "./index";
import type { Opening } from "./types";

export type CoachKind = "start" | "ok" | "fail" | "hint" | "pin" | "plan";

export interface CoachState {
  text: string;
  chunkName?: string;
  kind: CoachKind;
  pinLabel?: string;
}

export function coachAtStart(opening: Opening): CoachState {
  const line = opening.coach.find((c) => c.afterPly === -1);
  return {
    text: line?.text ?? opening.story.cast,
    chunkName: opening.chunks[0]?.name,
    kind: "start",
  };
}

export function coachAfterPly(opening: Opening, afterPly: number): CoachState {
  const chunk = chunkAt(opening, afterPly);
  const pin = opening.pins.find((p) => p.afterPly === afterPly);
  const beat = opening.storyBeats.find((b) => b.afterPly === afterPly);
  const line = opening.coach.find((c) => c.afterPly === afterPly);
  const enteredChunk =
    chunk && (afterPly === chunk.fromPly || afterPly === chunk.fromPly + 1);

  if (pin) {
    return {
      text: pin.label,
      chunkName: chunk?.name,
      kind: "pin",
      pinLabel: pin.label,
    };
  }
  if (beat) {
    return { text: beat.beat, chunkName: chunk?.name, kind: "ok" };
  }
  if (enteredChunk && chunk) {
    return { text: line?.text ?? chunk.name, chunkName: chunk.name, kind: "ok" };
  }
  if (line) {
    return { text: line.text, chunkName: chunk?.name, kind: "ok" };
  }
  return {
    text: chunk?.name ?? opening.story.plan,
    chunkName: chunk?.name,
    kind: "ok",
  };
}

export function coachOnFail(opening: Opening, ply: number): CoachState {
  const chunk = chunkAt(opening, ply);
  const idea = chunk?.job ?? opening.moves[ply];
  return {
    text: `No. ${idea}`,
    chunkName: chunk?.name,
    kind: "fail",
  };
}

export function coachOnHint(opening: Opening, ply: number): CoachState {
  const chunk = chunkAt(opening, ply);
  return {
    text: `Play ${opening.moves[ply]}.`,
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
    chunkName: "Plan mode",
    kind: "plan",
  };
}
