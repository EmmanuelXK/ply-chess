import type { Opening } from "./types";

export interface MoveNote {
  /** Bare SAN, or "Start" before any move. */
  san: string;
  /** One stored book comment for this ply, when the opening already has one. */
  comment?: string;
}

function stripLeadingSan(text: string, san: string | undefined): string {
  if (!san) return text;
  const lead = san.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text
    .replace(new RegExp(`^(?:${lead}|\\.\\.\\.${lead}|…${lead})[.!?]?\\s*`, "i"), "")
    .trim();
}

/** Stored coach note on this ply, and only when its SAN is the move on the board. */
export function factualComment(opening: Opening, afterPly: number): string | undefined {
  if (afterPly < 0) return undefined;
  const san = opening.moves[afterPly];
  if (!san) return undefined;
  const note = opening.notes.find((row) => row.ply === afterPly && row.san === san);
  const text = note?.text.replace(/\s+/g, " ").trim();
  if (!text) return undefined;
  const rest = stripLeadingSan(text, san);
  return rest || undefined;
}

/** Plain note for the position after `ply` moves of the line. */
export function moveNoteAt(opening: Opening, ply: number): MoveNote {
  if (ply <= 0) {
    const comment = factualComment(opening, -1);
    return comment ? { san: "Start", comment } : { san: "Start" };
  }
  const index = Math.min(ply, opening.moves.length) - 1;
  const san = opening.moves[index] ?? "Start";
  const comment = factualComment(opening, index);
  return comment ? { san, comment } : { san };
}
