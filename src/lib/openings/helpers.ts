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

export const PILLAR_LABELS = [
  ["pawnStructure", "Pawn structure"],
  ["pieceCoordination", "Piece coordination"],
  ["kingSafety", "King safety"],
  ["breaksAndStorms", "Breaks and storms"],
  ["tacticsBank", "Tactics bank"],
  ["attackingPlan", "Attacking plan"],
] as const;
