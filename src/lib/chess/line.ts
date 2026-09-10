import { Chess } from "chess.js";
import type { Key } from "@lichess-org/chessground/types";

export function playLine(moves: string[], ply: number) {
  const chess = new Chess();
  let lastMove: Key[] | null = null;
  const capped = Math.max(0, Math.min(ply, moves.length));
  for (let i = 0; i < capped; i++) {
    const move = chess.move(moves[i]);
    if (!move) break;
    lastMove = [move.from as Key, move.to as Key];
  }
  return {
    fen: chess.fen(),
    lastMove,
    check: chess.inCheck(),
    turnColor: (chess.turn() === "w" ? "white" : "black") as "white" | "black",
    chess,
  };
}

export function lastMoveOf(san: string, fenBefore: string): Key[] | null {
  const g = new Chess(fenBefore);
  try {
    const move = g.move(san);
    if (!move) return null;
    return [move.from as Key, move.to as Key];
  } catch {
    return null;
  }
}
