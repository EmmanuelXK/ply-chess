import { Chess } from "chess.js";
import { START_FEN } from "./line";

export type GameResult = "1-0" | "0-1" | "1/2-1/2" | "*";

export function isGameResult(value: string): value is GameResult {
  return value === "1-0" || value === "0-1" || value === "1/2-1/2" || value === "*";
}

export function gameResult(chess: Chess): GameResult {
  if (chess.isCheckmate()) {
    return chess.turn() === "w" ? "0-1" : "1-0";
  }
  if (chess.isDraw()) return "1/2-1/2";
  return "*";
}

export function pgnDate(now = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

export function buildGamePgn(opts: {
  startFen: string;
  moves: string[];
  white: string;
  black: string;
  result: GameResult;
  event: string;
  date?: Date;
}): string {
  let chess: Chess;
  try {
    chess = new Chess(opts.startFen || START_FEN);
  } catch {
    chess = new Chess();
  }
  for (const san of opts.moves) {
    try {
      chess.move(san);
    } catch {
      break;
    }
  }
  chess.setHeader("Event", opts.event);
  chess.setHeader("Site", "Opening Edge");
  chess.setHeader("Date", pgnDate(opts.date ?? new Date()));
  chess.setHeader("White", opts.white);
  chess.setHeader("Black", opts.black);
  chess.setHeader("Result", opts.result);
  const startFen = opts.startFen || START_FEN;
  if (startFen !== START_FEN) {
    chess.setHeader("SetUp", "1");
    chess.setHeader("FEN", startFen);
  }
  return chess.pgn();
}
