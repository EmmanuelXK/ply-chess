import type { Opening } from "./types";

export type KeyPlyReason = "note";

/**
 * A ply is a teaching mark only when the stored coach note names that exact SAN.
 * Old pin, story, history, and hook indexes were written for the 21-move spines.
 */
export function keyPlyReasons(opening: Opening, afterPly: number): KeyPlyReason[] {
  if (afterPly < 0 || afterPly >= opening.moves.length) return [];
  const san = opening.moves[afterPly];
  const note = opening.notes.find((row) => row.ply === afterPly && row.san === san);
  return note ? ["note"] : [];
}

/** True when this ply has a highlight / Why / history / authored theory mark. */
export function isKeyPly(opening: Opening, afterPly: number): boolean {
  return keyPlyReasons(opening, afterPly).length > 0;
}
