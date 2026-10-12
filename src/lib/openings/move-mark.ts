import type { Opening } from "./types";

/**
 * Gem and True were the old praise stamps.
 * The vague Clean tag is gone. Move quality now lives in `@/lib/chess/move-quality`.
 */
export type MoveMark = "gem" | "true";

export const MOVE_MARK_LABEL: Record<MoveMark, string> = {
  gem: "Gem",
  true: "True",
};

/** Clean is no longer stamped on a ply. Quality badges grade the move instead. */
export function moveMarkAt(opening: Opening, afterPly: number): MoveMark | null {
  void opening.moves[afterPly];
  return null;
}
