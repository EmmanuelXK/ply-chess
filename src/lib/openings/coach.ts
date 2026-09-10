import { chunkAt } from "./helpers";
import { professorAt } from "./professor";
import type { Opening } from "./types";

export type CoachKind =
  | "start"
  | "ok"
  | "fail"
  | "hint"
  | "pin"
  | "plan"
  | "why"
  | "quiz";

export interface CoachState {
  text: string;
  detail?: string;
  chunkName?: string;
  kind: CoachKind;
  pinLabel?: string;
}

function professorLine(opening: Opening, afterPly: number): string | undefined {
  const script = professorAt(opening, afterPly);
  return script?.concept;
}

export function coachAtStart(opening: Opening): CoachState {
  const line = opening.coach.find((c) => c.afterPly === -1);
  return {
    text: line?.text ?? opening.story.cast,
    detail: opening.story.plan,
    chunkName: opening.chunks[0]?.name,
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

  if (pin) {
    return {
      text: concept ?? pin.label,
      detail: chunk?.job,
      chunkName: chunk?.name,
      kind: "pin",
      pinLabel: pin.label,
    };
  }
  if (beat) {
    return {
      text: concept ?? beat.beat,
      detail: chunk?.job,
      chunkName: chunk?.name,
      kind: "ok",
    };
  }
  if (enteredChunk && chunk) {
    return {
      text: concept ?? line?.text ?? chunk.name,
      detail: chunk.job,
      chunkName: chunk.name,
      kind: "ok",
    };
  }
  if (line) {
    return {
      text: concept ?? line.text,
      detail: chunk?.job,
      chunkName: chunk?.name,
      kind: "ok",
    };
  }
  return {
    text: concept ?? chunk?.name ?? opening.story.plan,
    detail: chunk?.job,
    chunkName: chunk?.name,
    kind: "ok",
  };
}

function explainJob(job: string, expectedSan: string): string {
  const compact = job.replace(/\s+/g, " ").trim();
  const looksLikeList =
    compact.includes("…") ||
    (/[A-N][a-h]?[1-8]?/.test(compact) &&
      compact.split(/[.…]/).filter(Boolean).length >= 3);

  if (looksLikeList) {
    return `The job of this moment is ${expectedSan} — one square, one concept. Not the whole list dumped as a single move. ${compact} is the sequence; play ${expectedSan} now.`;
  }
  return `The positional job is: ${compact}. The move that does that job here is ${expectedSan}.`;
}

export function coachOnFail(opening: Opening, ply: number): CoachState {
  const chunk = chunkAt(opening, ply);
  const expected = opening.moves[ply] ?? "";
  const script = professorAt(opening, Math.max(0, ply - 1));
  const job = chunk?.job ?? expected;
  const head = explainJob(job, expected);
  const why = script?.why
    ? ` Why: ${script.why}`
    : "";
  return {
    text: `Not that. ${head}`,
    detail: `${why} Next: ${script?.plan ?? opening.pillars.attackingPlan}`,
    chunkName: chunk?.name,
    kind: "fail",
  };
}

export function coachOnHint(opening: Opening, ply: number): CoachState {
  const chunk = chunkAt(opening, ply);
  const san = opening.moves[ply] ?? "";
  const script = professorAt(opening, ply);
  return {
    text: `Play ${san}. ${script?.concept ?? chunk?.job ?? ""}`.trim(),
    detail: script?.why,
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
