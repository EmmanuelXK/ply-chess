import type { Opening } from "./types";

export interface MoveNote {
  /** Bare SAN, or "Start" before any move. */
  san: string;
  /** One stored book comment for this ply, when the opening already has one. */
  comment?: string;
}

function firstSentence(text: string): string {
  const sentence = text.match(/^.*?[.!?](?=\s|$)/)?.[0]?.trim();
  return sentence || text;
}

function stripLeadingSan(text: string, san: string | undefined): string {
  if (!san) return text;
  const lead = san.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text
    .replace(new RegExp(`^(?:${lead}|\\.\\.\\.${lead}|…${lead})[.!?]?\\s*`, "i"), "")
    .trim();
}

/** Stored comment on this ply. Never synthesized. */
export function factualComment(opening: Opening, afterPly: number): string | undefined {
  const raw = opening.coach
    .find((row) => row.afterPly === afterPly)
    ?.text.replace(/\s+/g, " ")
    .trim();
  if (!raw) return undefined;
  const san = afterPly >= 0 ? opening.moves[afterPly] : undefined;
  const rest = stripLeadingSan(raw, san);
  if (!rest || (san && rest === san)) return undefined;
  const sentence = firstSentence(rest);
  return sentence || undefined;
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
