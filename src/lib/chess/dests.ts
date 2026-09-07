import type { Key } from "@lichess-org/chessground/types";
import type { Chess, Square } from "chess.js";

export function toDests(chess: Chess): Map<Key, Key[]> {
  const dests = new Map<Key, Key[]>();
  for (const move of chess.moves({ verbose: true })) {
    const from = move.from as Key;
    const list = dests.get(from) ?? [];
    list.push(move.to as Key);
    dests.set(from, list);
  }
  return dests;
}

export function sameMove(
  played: { from: string; to: string; promotion?: string; san: string },
  bookSan: string,
  chessBefore: Chess,
): boolean {
  try {
    const book = chessBefore.move(bookSan);
    chessBefore.undo();
    if (!book) return false;
    return (
      book.from === played.from &&
      book.to === played.to &&
      (book.promotion ?? undefined) === (played.promotion ?? undefined)
    );
  } catch {
    return played.san === bookSan;
  }
}

export function needsPromotion(chess: Chess, from: Square, to: Square): boolean {
  const piece = chess.get(from);
  if (!piece || piece.type !== "p") return false;
  const rank = to[1];
  return rank === "8" || rank === "1";
}
