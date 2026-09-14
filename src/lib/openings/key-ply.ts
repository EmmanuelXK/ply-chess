import { AUTHORED_FACTS } from "@/lib/dialogue/authored-facts";
import { SHORT_HOOKS } from "@/lib/dialogue/hooks";
import { authoredProfessor } from "./authored";
import { historyAt } from "./history";
import type { Opening } from "./types";

export type KeyPlyReason =
  | "pin"
  | "story"
  | "history"
  | "authored-professor"
  | "authored-fact"
  | "hook";

/**
 * Sparse teaching marks already in the book.
 * Generated coach[] / professor fallbacks are NOT keys — those fire every other ply.
 */
export function keyPlyReasons(opening: Opening, afterPly: number): KeyPlyReason[] {
  if (afterPly < 0) return [];
  const reasons: KeyPlyReason[] = [];

  if (opening.pins.some((pin) => pin.afterPly === afterPly)) {
    reasons.push("pin");
  }
  if (opening.storyBeats.some((beat) => beat.afterPly === afterPly)) {
    reasons.push("story");
  }
  if (
    historyAt(opening, afterPly).length > 0 ||
    historyAt(opening, afterPly + 1).length > 0
  ) {
    reasons.push("history");
  }
  if (authoredProfessor[opening.id]?.some((row) => row.afterPly === afterPly)) {
    reasons.push("authored-professor");
  }
  if (AUTHORED_FACTS[opening.id]?.some((row) => row.ply === afterPly)) {
    reasons.push("authored-fact");
  }
  if (SHORT_HOOKS[opening.id]?.some((row) => row.ply === afterPly)) {
    reasons.push("hook");
  }

  return reasons;
}

/** True when this ply has a highlight / Why / history / authored purpose mark. */
export function isKeyPly(opening: Opening, afterPly: number): boolean {
  return keyPlyReasons(opening, afterPly).length > 0;
}
