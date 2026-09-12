import { Chess } from "chess.js";
import type { Key } from "@lichess-org/chessground/types";

const SQUARE = /\b([a-h][1-8])\b/gi;
const SAN_DEST =
  /\b[NBRQK](?:[a-h])?(?:[1-8])?x?([a-h][1-8])(?:[+#])?\b/g;
const PAWN_SAN = /\b(?:[a-h]x)?([a-h][1-8])(?:[+#])?\b/g;

/** Squares a beat is talking about — used for chat-head arrows. */
export function squaresInSpeech(
  text: string,
  opts?: { fen?: string; san?: string },
): Key[] {
  const found = new Set<string>();

  for (const match of text.matchAll(SQUARE)) {
    found.add(match[1].toLowerCase());
  }
  for (const match of text.matchAll(SAN_DEST)) {
    found.add(match[1].toLowerCase());
  }
  for (const match of text.matchAll(PAWN_SAN)) {
    found.add(match[1].toLowerCase());
  }

  if (opts?.fen && opts.san) {
    try {
      const before = rewindSan(opts.fen, opts.san);
      const g = new Chess(before ?? opts.fen);
      const move = g.move(opts.san);
      if (move) {
        found.add(move.from);
        found.add(move.to);
      }
    } catch {
      /* ignore */
    }
  }

  if (/\bO-O-O\b/i.test(text)) {
    found.add("c1");
    found.add("c8");
  } else if (/\bO-O\b/i.test(text) || /\bcastl/i.test(text)) {
    found.add("g1");
    found.add("g8");
  }

  return [...found].filter(isSquare) as Key[];
}

function isSquare(value: string): value is Key {
  return /^[a-h][1-8]$/.test(value);
}

function rewindSan(fen: string, san: string): string | undefined {
  const g = new Chess(fen);
  const hist = g.history({ verbose: true });
  const last = hist[hist.length - 1];
  if (last && last.san === san) {
    g.undo();
    return g.fen();
  }
  return undefined;
}
