import { Chess, type Move, type Square } from "chess.js";

import storedPlans from "@/lib/openings/data/line-plans.json";
import type { BookLine, Side } from "@/lib/openings/types";

export interface PlanStep {
  text: string;
  /** Legal from the final position when it is the user's turn. */
  uci: string | null;
  square: string | null;
}

export interface ModelGame {
  white: string;
  black: string;
  event: string;
  year: number;
}

export interface LinePlan {
  lineId: string;
  steps: PlanStep[];
  game: ModelGame | null;
}

interface CatalogGame extends ModelGame {
  moves: readonly string[];
}

/**
 * Real games. A line may cite one only when its moves follow that game for
 * at least eight plies. The lists are prefixes, checked by playing them.
 */
export const MODEL_GAMES: readonly CatalogGame[] = [
  {
    white: "Anderssen",
    black: "Dufresne",
    event: "Berlin",
    year: 1852,
    moves: [
      "e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4", "Bxb4", "c3", "Ba5", "d4", "exd4", "O-O", "d3",
      "Qb3", "Qf6", "e5", "Qg6", "Re1", "Nge7", "Ba3", "b5", "Qxb5", "Rb8", "Qa4", "Bb6", "Nbd2",
      "Bb7", "Ne4", "Qf5", "Bxd3", "Qh5", "Nf6+", "gxf6", "exf6", "Rg8", "Rad1", "Qxf3", "Rxe7+",
      "Nxe7", "Qxd7+", "Kxd7", "Bf5+", "Ke8", "Bd7+", "Kf8", "Bxe7#",
    ],
  },
  {
    white: "Morphy",
    black: "Duke Karl and Count Isouard",
    event: "Paris",
    year: 1858,
    moves: [
      "e4", "e5", "Nf3", "d6", "d4", "Bg4", "dxe5", "Bxf3", "Qxf3", "dxe5", "Bc4", "Nf6", "Qb3",
      "Qe7", "Nc3", "c6", "Bg5", "b5", "Nxb5", "cxb5", "Bxb5+", "Nbd7", "O-O-O", "Rd8", "Rxd7",
      "Rxd7", "Rd1", "Qe6", "Bxd7+", "Nxd7", "Qb8+", "Nxb8", "Rd8#",
    ],
  },
  {
    white: "Fischer",
    black: "Spassky",
    event: "Reykjavik",
    year: 1972,
    moves: [
      "c4", "e6", "Nf3", "d5", "d4", "Nf6", "Nc3", "Be7", "Bg5", "O-O", "e3", "h6", "Bh4", "b6",
    ],
  },
  {
    white: "Kasparov",
    black: "Topalov",
    event: "Wijk aan Zee",
    year: 1999,
    moves: ["e4", "d6", "d4", "Nf6", "Nc3", "g6", "Be3", "Bg7", "Qd2", "c6", "f3", "b5"],
  },
  {
    white: "Steinitz",
    black: "von Bardeleben",
    event: "Hastings",
    year: 1895,
    moves: [
      "e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d4", "exd4", "cxd4", "Bb4+", "Nc3", "d5",
      "exd5", "Nxd5", "O-O", "Be6",
    ],
  },
];

const CENTER = new Set(["c4", "c5", "c6", "d4", "d5", "d6", "e4", "e5", "e6", "f4", "f5", "f6"]);
const FILES = "abcdefgh";

function playMoves(moves: readonly string[]): Chess | null {
  const chess = new Chess();
  for (const san of moves) {
    try {
      if (!chess.move(san)) return null;
    } catch {
      return null;
    }
  }
  return chess;
}

export function catalogGamesPlay(): boolean {
  return MODEL_GAMES.every((game) => playMoves(game.moves) != null);
}

function matchingGame(moves: readonly string[]): ModelGame | null {
  if (moves.length < 8) return null;
  let best: { game: CatalogGame; length: number } | null = null;
  for (const game of MODEL_GAMES) {
    const limit = Math.min(moves.length, game.moves.length);
    let same = 0;
    while (same < limit && moves[same] === game.moves[same]) same += 1;
    if (same >= 8 && (!best || same > best.length)) best = { game, length: same };
  }
  if (!best) return null;
  const { white, black, event, year } = best.game;
  return { white, black, event, year };
}

function uciOf(move: Move): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

function cleanSan(san: string): string {
  return san.replace(/[+#]+$/g, "");
}

function textFor(move: Move, engine: boolean): string {
  const san = cleanSan(move.san);
  const stamp = engine ? " Stockfish ranks this first." : "";
  if (san === "O-O") return `Castle kingside and connect the rooks.${stamp}`;
  if (san === "O-O-O") return `Castle queenside and take the open file.${stamp}`;
  if (move.piece === "p" && move.captured) return `Break with ${san}.${stamp}`;
  if (move.piece === "p") return `Push ${san}.${stamp}`;
  if (move.piece === "n" && CENTER.has(move.to)) return `Plant the knight on ${move.to}.${stamp}`;
  if (move.piece === "n") return `Bring the knight to ${move.to}.${stamp}`;
  if (move.piece === "b") return `Aim the bishop at ${move.to}.${stamp}`;
  if (move.piece === "r") return `Put a rook on ${move.to} and work that file.${stamp}`;
  if (move.piece === "q") return `Bring the queen to ${move.to} behind the pieces.${stamp}`;
  return `Play ${san}.${stamp}`;
}

function userScore(cp: number | null, mate: number | null, side: Side): number {
  if (mate != null && mate !== 0) {
    const whiteWinning = mate > 0;
    return whiteWinning === (side === "white") ? 400 : -400;
  }
  if (cp == null) return 0;
  return side === "white" ? cp : -cp;
}

function scoreMove(move: Move, userCp: number, engine: boolean): number {
  let score = engine ? 100 : 0;
  if (move.san === "O-O" || move.san === "O-O-O") score += userCp < -30 ? 40 : 18;
  const centralFile = "cdef".includes(move.to[0] ?? "");
  if (move.piece === "p" && move.captured) score += centralFile ? (userCp < -30 ? 24 : 46) : 18;
  else if (move.piece === "p" && centralFile) score += 32;
  else if (move.piece === "p" && !engine) score += 0;
  if (move.piece === "n" && CENTER.has(move.to)) score += userCp > 20 ? 42 : 30;
  else if (move.piece === "n") score += 16;
  if (move.piece === "b") score += 22;
  if (move.piece === "r") score += 20;
  if (move.piece === "q") score += engine ? 12 : 4;
  if (move.captured && move.piece !== "p") score += 8;
  return score;
}

function stepFrom(move: Move, engine: boolean): PlanStep {
  return {
    text: textFor(move, engine),
    uci: uciOf(move),
    square: move.to,
  };
}

function filePawns(chess: Chess, file: string, color: "w" | "b"): string | null {
  for (let rank = 1; rank <= 8; rank += 1) {
    const square = `${file}${rank}` as Square;
    const piece = chess.get(square);
    if (piece?.type === "p" && piece.color === color) return square;
  }
  return null;
}

function structureSteps(chess: Chess, side: Side): PlanStep[] {
  const color = side === "white" ? "w" : "b";
  const enemy = color === "w" ? "b" : "w";
  const steps: PlanStep[] = [];
  for (const file of FILES) {
    const ours = filePawns(chess, file, color);
    const theirs = filePawns(chess, file, enemy);
    if (!ours && theirs) {
      steps.push({
        text: `Pressure the pawn on ${theirs} down the ${file}-file.`,
        uci: null,
        square: theirs,
      });
    }
  }
  const forward = color === "w" ? 1 : -1;
  for (const file of FILES) {
    const ours = filePawns(chess, file, color);
    if (!ours) continue;
    const rank = Number(ours[1]);
    const nextRank = rank + forward;
    if (nextRank < 1 || nextRank > 8) continue;
    for (const delta of [-1, 1]) {
      const fileIndex = file.charCodeAt(0) - 97 + delta;
      if (fileIndex < 0 || fileIndex > 7) continue;
      const target = `${FILES[fileIndex]}${nextRank}` as Square;
      const piece = chess.get(target);
      if (piece?.type === "p" && piece.color === enemy) {
        steps.push({
          text: `Prepare the break against the pawn on ${target}.`,
          uci: null,
          square: target,
        });
      }
    }
  }
  const knights = chess.board().flatMap((rank, rankIndex) =>
    rank.flatMap((piece, fileIndex) => {
      if (!piece || piece.type !== "n" || piece.color !== color) return [];
      return [`${FILES[fileIndex]}${8 - rankIndex}`];
    }),
  );
  if (knights[0]) {
    steps.push({
      text: `Reroute the knight from ${knights[0]} toward the center.`,
      uci: null,
      square: knights[0],
    });
  }
  const kingSquare = color === "w" ? "e1" : "e8";
  if (chess.get(kingSquare as Square)?.type === "k") {
    steps.push({
      text: "Castle before the center opens.",
      uci: null,
      square: kingSquare,
    });
  }
  return steps;
}

const storedById = new Map((storedPlans as LinePlan[]).map((plan) => [plan.lineId, plan]));

export function planForLine(lineId: string | null | undefined): LinePlan | null {
  if (!lineId) return null;
  return storedById.get(lineId) ?? null;
}

/** Two or three concrete plans from the final position and its stored eval. */
export function buildLinePlan(line: BookLine, side: Side): LinePlan {
  const chess = playMoves(line.moves) ?? new Chess();
  const end = line.evals[line.moves.length] ?? line.evals[line.evals.length - 1];
  const color = side === "white" ? "w" : "b";
  const userTurn = color === chess.turn();
  const userCp = userScore(end?.cp ?? null, end?.mate ?? null, side);
  const steps: PlanStep[] = [];
  const seen = new Set<string>();
  let legal: Move[] = [];
  if (userTurn) {
    try {
      legal = chess.moves({ verbose: true });
    } catch {
      legal = [];
    }
  } else {
    const parts = chess.fen().split(" ");
    parts[1] = color;
    parts[3] = "-";
    try {
      legal = new Chess(parts.join(" ")).moves({ verbose: true });
    } catch {
      legal = [];
    }
  }
  const engineSan = userTurn ? cleanSan(end?.best ?? "") : "";
  const ranked = legal
    .map((move) => ({
      move,
      score: scoreMove(move, userCp, cleanSan(move.san) === engineSan),
      engine: cleanSan(move.san) === engineSan && engineSan !== "",
    }))
    .sort((left, right) => right.score - left.score || left.move.san.localeCompare(right.move.san));
  const usedPieces = new Set<string>();
  for (const item of ranked) {
    if (steps.length >= 3) break;
    if (!item.engine && item.move.piece === "q") continue;
    if (!item.engine && item.score < 16) continue;
    const anotherKind = ranked.some(
      (other) =>
        !usedPieces.has(other.move.piece) &&
        other.move.piece !== item.move.piece &&
        (other.engine || other.score >= 16) &&
        other.move.piece !== "q",
    );
    if (!item.engine && usedPieces.has(item.move.piece) && anotherKind && steps.length < 2) continue;
    const step = stepFrom(item.move, item.engine);
    if (seen.has(step.text)) continue;
    seen.add(step.text);
    usedPieces.add(item.move.piece);
    steps.push(step);
  }

  if (steps.length < 2) {
    for (const extra of structureSteps(chess, side)) {
      if (steps.length >= 3) break;
      if (steps.some((step) => step.text === extra.text)) continue;
      steps.push(extra);
    }
  }

  while (steps.length < 2) {
    steps.push({
      text: userCp < -40 ? "Trade a piece and keep the king tucked away." : "Improve the worst-placed piece before a pawn break.",
      uci: null,
      square: null,
    });
  }

  return {
    lineId: line.id,
    steps: steps.slice(0, 3),
    game: matchingGame(line.moves),
  };
}
