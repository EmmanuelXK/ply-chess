import { Chess } from "chess.js";
import { hybridAdvice } from "./hybrid";

/** Human-practical reply from the current FEN. Maia unless a tactic hangs. */
export async function coachSparSan(fen: string): Promise<string | null> {
  let chess: Chess;
  try {
    chess = new Chess(fen);
  } catch {
    return null;
  }
  if (chess.isGameOver()) return null;
  try {
    const advice = await hybridAdvice(fen);
    const san = advice.pick?.san;
    if (san) {
      const probe = new Chess(fen);
      try {
        if (probe.move(san)) return san;
      } catch {
        /* fall through to a legal move */
      }
    }
  } catch {
    /* Stockfish / Maia can fail in tests or offline — still move. */
  }
  return chess.moves()[0] ?? null;
}
