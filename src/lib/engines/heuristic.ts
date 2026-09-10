import { Chess, type Move, type Square } from "chess.js";

const CENTER = new Set(["d4", "d5", "e4", "e5", "c4", "c5", "f4", "f5"]);
const KING_ZONE: Record<"w" | "b", string[]> = {
  w: ["c1", "d1", "e1", "f1", "g1", "c2", "d2", "e2", "f2", "g2"],
  b: ["c8", "d8", "e8", "f8", "g8", "c7", "d7", "e7", "f7", "g7"],
};

function pieceValue(type: string): number {
  switch (type) {
    case "p":
      return 100;
    case "n":
    case "b":
      return 320;
    case "r":
      return 500;
    case "q":
      return 900;
    default:
      return 0;
  }
}

export function materialCp(chess: Chess): number {
  let score = 0;
  for (const row of chess.board()) {
    for (const p of row) {
      if (!p) continue;
      const v = pieceValue(p.type);
      score += p.color === "w" ? v : -v;
    }
  }
  return score;
}

/** Neural-plan stand-in: activity, king pressure, storms — not tactical search. */
export function planScore(chess: Chess, move: Move): number {
  const us = move.color;
  const them = us === "w" ? "b" : "w";
  let s = 0;
  if (move.captured) s += pieceValue(move.captured) * 0.35;
  if (CENTER.has(move.to)) s += 28;
  if (move.piece === "n" || move.piece === "b") {
    if (move.from[1] === (us === "w" ? "1" : "8")) s += 22;
  }
  if (move.san === "O-O" || move.san === "O-O-O") s += 40;
  const attacks = chess.moves({ square: move.to as Square, verbose: true });
  s += Math.min(attacks.length, 8) * 4;
  const zone = KING_ZONE[them];
  if (zone.includes(move.to)) s += 18;
  if (move.piece === "p") {
    const dir = us === "w" ? 1 : -1;
    const rank = Number(move.to[1]);
    const home = us === "w" ? 2 : 7;
    if ((rank - home) * dir >= 2) s += 12;
    if ("fgh".includes(move.to[0]) && us === "w") s += 8;
    if ("fgh".includes(move.to[0]) && us === "b") s += 8;
  }
  if (move.san.includes("+")) s += 14;
  if (chess.inCheck()) s += 10;
  return s;
}

/** Human-like prior: development, don't hang, avoid early queen raids. */
export function maiaScore(chess: Chess, move: Move, ply: number): number {
  let s = planScore(chess, move) * 0.45;
  if (move.piece === "q" && ply < 10 && !move.captured) s -= 30;
  if ((move.piece === "n" || move.piece === "b") && ply < 16) s += 16;
  if (move.san === "O-O") s += 24;
  if (move.captured) {
    const give = pieceValue(move.piece);
    const take = pieceValue(move.captured);
    if (take >= give) s += 20;
    if (take < give - 50) s -= 40;
  }
  // Prefer repeating known developing squares.
  if (["Nf3", "Nc3", "Nf6", "Nc6", "d4", "e4", "d5", "e5", "Be2", "Be7", "Bc4", "Bc5", "Bg7", "Bb5"].includes(move.san)) {
    s += 18;
  }
  if (move.san.startsWith("h") && ply < 8) s -= 8;
  return s;
}

export function pickByScore(
  fen: string,
  score: (chess: Chess, move: Move) => number,
): { san: string; uci: string; scoreCp: number } | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  if (!moves.length) return null;
  let best = moves[0];
  let bestS = -Infinity;
  for (const m of moves) {
    const probe = new Chess(fen);
    probe.move(m);
    const s = score(probe, m);
    if (s > bestS) {
      bestS = s;
      best = m;
    }
  }
  return {
    san: best.san,
    uci: `${best.from}${best.to}${best.promotion ?? ""}`,
    scoreCp: Math.round(bestS),
  };
}

export function staticEvalCp(fen: string): number {
  const chess = new Chess(fen);
  let score = materialCp(chess);
  const moves = chess.moves({ verbose: true });
  const w = chess.turn() === "w" ? moves.length : 0;
  const bProbe = new Chess(fen);
  // mobility of side to move only — small nudge
  score += chess.turn() === "w" ? w * 2 : -w * 2;
  void bProbe;
  return score;
}
