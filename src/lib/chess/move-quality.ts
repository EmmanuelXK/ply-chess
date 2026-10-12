import { Chess, type Square } from "chess.js";

import { activeLine, isGambitSacrifice } from "@/lib/openings/book";
import type { Opening, Side } from "@/lib/openings/types";
import { userDrop } from "@/lib/openings/audit";
import { playLine } from "@/lib/chess/line";
import type { AnalysisTree } from "@/lib/chess/tree";
import { nodeAt } from "@/lib/chess/tree";

/** One badge on the moved piece. Replaces the old "Clean" tag. */
export type MoveQuality =
  | "brilliant"
  | "best"
  | "good"
  | "positional"
  | "inaccuracy"
  | "mistake"
  | "blunder";

export const QUALITY_SYMBOL: Record<MoveQuality, string> = {
  brilliant: "!!",
  best: "★",
  good: "!",
  positional: "◆",
  inaccuracy: "?!",
  mistake: "?",
  blunder: "??",
};

export const QUALITY_NAME: Record<MoveQuality, string> = {
  brilliant: "Brilliant",
  best: "Best",
  good: "Good",
  positional: "Positional",
  inaccuracy: "Inaccuracy",
  mistake: "Mistake",
  blunder: "Blunder",
};

/** Good / book stays inside this many centipawns. */
export const GOOD_CP = 30;
export const MISTAKE_CP = 100;
export const BLUNDER_CP = 300;

export interface GradeInput {
  san: string;
  fenBefore: string;
  before: { cp: number | null; mate: number | null; best?: string | null };
  after: { cp: number | null; mate: number | null };
  /** Book already marked this ply as a sacrifice the engine accepts. */
  flaggedSacrifice?: boolean;
}

const FILES = "abcdefgh";

function pieceValue(type: string): number {
  if (type === "p") return 1;
  if (type === "n" || type === "b") return 3;
  if (type === "r") return 5;
  if (type === "q") return 9;
  return 0;
}

function hangingValue(chess: Chess, color: "w" | "b"): number {
  const opponent = color === "w" ? "b" : "w";
  let total = 0;
  for (let rank = 1; rank <= 8; rank += 1) {
    for (const file of FILES) {
      const square = `${file}${rank}` as Square;
      const piece = chess.get(square);
      if (!piece || piece.color !== color || piece.type === "k") continue;
      if (!chess.isAttacked(square, opponent)) continue;
      if (chess.isAttacked(square, color)) continue;
      total += pieceValue(piece.type);
    }
  }
  return total;
}

/** The move newly offers material, and the engine still likes the position. */
export function offersMaterial(fenBefore: string, san: string): boolean {
  const before = new Chess(fenBefore);
  const mover = before.turn();
  const hangBefore = hangingValue(before, mover);
  let played;
  try {
    played = before.move(san);
  } catch {
    return false;
  }
  if (!played) return false;
  const after = new Chess(played.after);
  return hangingValue(after, mover) > hangBefore;
}

function sameSan(played: string, best: string | null | undefined): boolean {
  if (!best) return false;
  const norm = (san: string) =>
    san
      .replace(/0-0-0/g, "O-O-O")
      .replace(/0-0/g, "O-O")
      .replace(/[+#!?]+$/g, "");
  return norm(played) === norm(best);
}

function quietSan(san: string): boolean {
  return !san.includes("x") && !/[+#]/.test(san);
}

/**
 * Grade one move from the eval before it and the eval after it.
 * Loss is from the mover's side. Missing scores stay unmarked.
 */
export function gradeMove(input: GradeInput): MoveQuality | null {
  const beforeKnown =
    input.before.cp != null || (input.before.mate != null && input.before.mate !== 0);
  const afterKnown = input.after.cp != null || (input.after.mate != null && input.after.mate !== 0);
  if (!beforeKnown || !afterKnown || !input.san) return null;

  let fenSide: Side = "white";
  try {
    fenSide = new Chess(input.fenBefore).turn() === "w" ? "white" : "black";
  } catch {
    return null;
  }

  const loss = userDrop(input.before, input.after, fenSide);
  if (loss >= BLUNDER_CP) return "blunder";
  if (loss >= MISTAKE_CP) return "mistake";
  if (loss > GOOD_CP) return "inaccuracy";

  const soundSacrifice =
    (input.flaggedSacrifice || offersMaterial(input.fenBefore, input.san)) && loss <= GOOD_CP;
  if (soundSacrifice) return "brilliant";
  if (sameSan(input.san, input.before.best)) return "best";
  if (quietSan(input.san) && loss <= 0) return "positional";
  return "good";
}

function sacrificeFlag(opening: Opening, ply: number): boolean {
  const line = activeLine(opening);
  if (!line) return false;
  const san = line.moves[ply];
  return line.flaggedDrops.some(
    (mark) =>
      (mark.ply == null || mark.ply === ply) &&
      (mark.san == null || mark.san === san) &&
      isGambitSacrifice(mark),
  );
}

/** Grade a repertoire move from the stored Stockfish book. `ply` is the move index. */
export function gradeBookPly(opening: Opening, ply: number): MoveQuality | null {
  const san = opening.moves[ply];
  const before = opening.evals[ply];
  const after = opening.evals[ply + 1];
  if (!san || !before || !after) return null;
  const fenBefore = playLine(opening.moves, ply).fen;
  return gradeMove({
    san,
    fenBefore,
    before,
    after,
    flaggedSacrifice: sacrificeFlag(opening, ply),
  });
}

/** Grade the cursor move in Analyze from stored or live scores on the tree. */
export function gradeAnalyzedMove(tree: AnalysisTree): MoveQuality | null {
  if (!tree.path.length) return null;
  const node = nodeAt(tree);
  if (!node) return null;
  const parentPath = tree.path.slice(0, -1);
  const parent = parentPath.length ? nodeAt(tree, parentPath) : null;
  const fenBefore = parent?.fen ?? tree.startFen;
  const before = parent
    ? { cp: parent.cp, mate: parent.mate, best: parent.bestFrom }
    : { cp: tree.rootCp, mate: tree.rootMate, best: tree.rootBest };
  return gradeMove({
    san: node.san,
    fenBefore,
    before,
    after: { cp: node.cp, mate: node.mate },
  });
}

export function analyzedMoveSquare(tree: AnalysisTree): string | null {
  if (!tree.path.length) return null;
  const node = nodeAt(tree);
  if (!node || node.uci.length < 4) return null;
  return node.uci.slice(2, 4);
}
