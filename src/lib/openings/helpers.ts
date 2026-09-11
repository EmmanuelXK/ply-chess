import type { Opening } from "./types";

export function chunkAt(opening: Opening, ply: number) {
  return opening.chunks.find((c) => ply >= c.fromPly && ply <= c.toPly);
}

export function isUserPly(side: Opening["side"], ply: number): boolean {
  return side === "white" ? ply % 2 === 0 : ply % 2 === 1;
}

export function fullMoveCount(opening: Opening): number {
  return Math.ceil(opening.moves.length / 2);
}

/** True when coach/quiz copy is a dumped SAN sequence, not a concept. */
export function looksLikeMoveList(text: string): boolean {
  const compact = text.replace(/\s+/g, " ").trim();
  const tokens = compact.split(/[\s.…,/]+/).filter(Boolean);
  const sanish = tokens.filter((t) =>
    /^(?:[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:[+#])?|O-O-O|O-O)$/.test(t),
  );
  return sanish.length >= 2 || (compact.includes("…") && sanish.length >= 1);
}

export function firstSentence(text: string): string {
  const compact = text.replace(/\s+/g, " ").trim();
  return compact.split(/(?<=[.!?])\s+/)[0] ?? compact;
}

export function positionalIdea(
  text: string,
  fallback: string,
): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact || looksLikeMoveList(compact)) return fallback;
  return firstSentence(compact);
}

export const PILLAR_LABELS = [
  ["pawnStructure", "Pawn structure"],
  ["pieceCoordination", "Piece coordination"],
  ["kingSafety", "King safety"],
  ["breaksAndStorms", "Breaks and storms"],
  ["tacticsBank", "Tactics bank"],
  ["attackingPlan", "Attacking plan"],
] as const;
