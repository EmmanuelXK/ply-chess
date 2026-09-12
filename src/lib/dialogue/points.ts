import type { Key } from "@lichess-org/chessground/types";

const SQUARE = /\b([a-h][1-8])\b/gi;
const SAN_DEST =
  /\b[NBRQK](?:[a-h])?(?:[1-8])?x?([a-h][1-8])(?:[+#])?\b/g;

/** Squares the spoken beat names — never the silent last move. */
export function squaresInSpeech(text: string): Key[] {
  const found = new Set<string>();

  for (const match of text.matchAll(SQUARE)) {
    found.add(match[1].toLowerCase());
  }
  for (const match of text.matchAll(SAN_DEST)) {
    found.add(match[1].toLowerCase());
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
