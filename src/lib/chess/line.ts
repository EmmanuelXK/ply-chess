import { Chess } from "chess.js";
import type { Key } from "@lichess-org/chessground/types";

export const START_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function playLine(moves: string[], ply: number) {
  return playLineFromFen(START_FEN, moves, ply);
}

export function playLineFromFen(fen: string, moves: string[], ply: number) {
  let chess: Chess;
  try {
    chess = new Chess(fen || START_FEN);
  } catch {
    chess = new Chess();
  }
  let lastMove: Key[] | null = null;
  const capped = Math.max(0, Math.min(ply, moves.length));
  let appliedPly = 0;
  for (let i = 0; i < capped; i++) {
    try {
      const move = chess.move(moves[i]);
      if (!move) break;
      lastMove = [move.from as Key, move.to as Key];
      appliedPly += 1;
    } catch {
      break;
    }
  }
  return {
    fen: chess.fen(),
    lastMove,
    check: chess.inCheck(),
    turnColor: (chess.turn() === "w" ? "white" : "black") as "white" | "black",
    chess,
    appliedPly,
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
