import { Chess } from "chess.js";

export interface CrowdMove {
  san: string;
  games: number;
}

export interface CrowdTable {
  total: number;
  moves: CrowdMove[];
}

export interface WeightedReply<T> {
  reply: T;
  /** Share of all games in the position. Null when the explorer had nothing to say. */
  percent: number | null;
}

function sameSan(fen: string, left: string, right: string): boolean {
  if (left === right) return true;
  const uci = (san: string) => {
    try {
      const played = new Chess(fen).move(san);
      return played ? `${played.from}${played.to}${played.promotion ?? ""}` : null;
    } catch {
      return null;
    }
  };
  const played = uci(left);
  return played != null && played === uci(right);
}

function gamesFor(table: CrowdTable, fen: string, san: string): number {
  const hit = table.moves.find((move) => move.san === san || sameSan(fen, move.san, san));
  return hit?.games ?? 0;
}

/**
 * Pick a stored reply. Weights are Lichess game counts. With no table, or
 * when every stored move has a zero count, each stored reply is equal.
 */
export function pickWeighted<T extends { san: string }>(
  replies: readonly T[],
  table: CrowdTable | null,
  fen: string,
  random: () => number = Math.random,
): WeightedReply<T> | null {
  if (!replies.length) return null;
  const usable = table && table.total > 0 ? table : null;
  const weights = usable ? replies.map((reply) => gamesFor(usable, fen, reply.san)) : replies.map(() => 1);
  const sum = weights.reduce((total, weight) => total + weight, 0);
  const rollSource = sum > 0 ? weights : replies.map(() => 1);
  const rollSum = rollSource.reduce((total, weight) => total + weight, 0);
  let roll = random() * rollSum;
  let index = rollSource.length - 1;
  for (let cursor = 0; cursor < rollSource.length; cursor += 1) {
    roll -= rollSource[cursor] ?? 0;
    if (roll < 0) {
      index = cursor;
      break;
    }
  }
  const reply = replies[index] ?? replies[0];
  if (!reply) return null;
  if (!usable) return { reply, percent: null };
  const games = gamesFor(usable, fen, reply.san);
  if (games <= 0 || usable.total <= 0) return { reply, percent: null };
  return { reply, percent: Math.max(1, Math.round((100 * games) / usable.total)) };
}

export function parseExplorer(body: unknown): CrowdTable | null {
  if (!body || typeof body !== "object") return null;
  const row = body as {
    white?: unknown;
    draws?: unknown;
    black?: unknown;
    moves?: unknown;
  };
  const count = (value: unknown) => (typeof value === "number" && value > 0 ? value : 0);
  const moves = Array.isArray(row.moves)
    ? row.moves.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const move = item as { san?: unknown; white?: unknown; draws?: unknown; black?: unknown };
        if (typeof move.san !== "string" || !move.san.trim()) return [];
        return [{ san: move.san.trim(), games: count(move.white) + count(move.draws) + count(move.black) }];
      })
    : [];
  const total = count(row.white) + count(row.draws) + count(row.black);
  if (!moves.length || total <= 0) return null;
  return { total, moves };
}
