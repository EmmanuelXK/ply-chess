import { isUserPly } from "./helpers";
import { isKeyPly, keyPlyReasons } from "./key-ply";
import type { Opening } from "./types";

/**
 * Quiet praise for a theory move that earns it.
 * Gem — signature idea (a pin with a story or a hook).
 * True — the house move (pin or story on our ply).
 * Clean — sound theory (a key ply that is not the signature).
 * Ordinary develops and their replies stay unmarked.
 */
export type MoveMark = "gem" | "true" | "clean";

export const MOVE_MARK_LABEL: Record<MoveMark, string> = {
  gem: "Gem",
  true: "True",
  clean: "Clean",
};

export function moveMarkAt(opening: Opening, afterPly: number): MoveMark | null {
  if (afterPly < 0 || afterPly >= opening.moves.length) return null;
  if (!isKeyPly(opening, afterPly)) return null;
  if (!isUserPly(opening.side, afterPly)) return null;
  const reasons = keyPlyReasons(opening, afterPly);
  const signature =
    reasons.includes("pin") &&
    (reasons.includes("story") || reasons.includes("hook"));
  if (signature) return "gem";
  if (reasons.includes("pin") || reasons.includes("story")) return "true";
  return "clean";
}
