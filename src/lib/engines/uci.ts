import { Chess } from "chess.js";

export interface PvLine {
  multipv: number;
  /** Centipawns from White's point of view. */
  cp: number | null;
  /** Mate distance from White's point of view. Positive means White is mating. */
  mate: number | null;
  san: string[];
  uci: string[];
}

export interface AnalysisView {
  depth: number;
  nodes: number;
  nps: number;
  lines: PvLine[];
}

export const emptyAnalysis = (): AnalysisView => ({
  depth: 0,
  nodes: 0,
  nps: 0,
  lines: [],
});

export function uciToSan(fen: string, uci: string): string | null {
  if (!uci || uci === "(none)") return null;
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci[4] as "q" | "r" | "b" | "n" | undefined;
  try {
    const game = new Chess(fen);
    const move = game.move({ from, to, promotion: promotion || undefined });
    return move?.san ?? null;
  } catch {
    return null;
  }
}

export function pvToSan(fen: string, uciMoves: string[], limit = 8): string[] {
  const game = new Chess(fen);
  const sans: string[] = [];
  for (const uci of uciMoves) {
    if (sans.length >= limit) break;
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci[4] as "q" | "r" | "b" | "n" | undefined;
    try {
      const move = game.move({ from, to, promotion: promotion || undefined });
      if (!move) break;
      sans.push(move.san);
    } catch {
      break;
    }
  }
  return sans;
}

function turnOf(fen: string): "w" | "b" {
  return fen.split(" ")[1] === "b" ? "b" : "w";
}

function whitePov(value: number, fen: string): number {
  return turnOf(fen) === "b" ? -value : value;
}

function matchNumber(line: string, name: string): number | null {
  const found = new RegExp(`(?:^| )${name} (-?\\d+)`).exec(line);
  if (!found) return null;
  return Number(found[1]);
}

/** Fold one UCI `info` line into the live MultiPV view. Scores are White's point of view. */
export function reduceInfo(prev: AnalysisView, raw: string, fen: string): AnalysisView {
  const line = raw.trim();
  if (!line.startsWith("info ") || line.startsWith("info string")) return prev;

  const depth = matchNumber(line, "depth");
  const nodes = matchNumber(line, "nodes");
  const nps = matchNumber(line, "nps");
  const next: AnalysisView = {
    depth: depth && depth > prev.depth ? depth : prev.depth,
    nodes: nodes != null && nodes > prev.nodes ? nodes : prev.nodes,
    nps: nps != null ? nps : prev.nps,
    lines: prev.lines.map((row) => ({ ...row, san: [...row.san], uci: [...row.uci] })),
  };

  const pvMatch = / pv (.+)$/.exec(line);
  if (!pvMatch) return next;

  const uci = pvMatch[1].trim().split(/\s+/).filter(Boolean);
  if (!uci.length) return next;
  const multipv = matchNumber(line, "multipv") ?? 1;
  const cpRaw = matchNumber(line, "cp");
  const mateRaw = matchNumber(line, "mate");
  const row: PvLine = {
    multipv,
    cp: cpRaw == null ? null : whitePov(cpRaw, fen),
    mate: mateRaw == null ? null : whitePov(mateRaw, fen),
    uci,
    san: pvToSan(fen, uci),
  };
  const lines = next.lines.filter((item) => item.multipv !== multipv);
  lines.push(row);
  lines.sort((a, b) => a.multipv - b.multipv);
  next.lines = lines.slice(0, 3);
  return next;
}

export function formatNodes(nodes: number): string {
  if (!Number.isFinite(nodes) || nodes <= 0) return "0";
  if (nodes < 1000) return String(Math.round(nodes));
  if (nodes < 1_000_000) {
    const value = nodes / 1000;
    return `${value < 10 ? value.toFixed(1) : Math.round(value)}k`;
  }
  return `${(nodes / 1_000_000).toFixed(1)}m`;
}

export function formatScore(line: Pick<PvLine, "cp" | "mate"> | undefined): string {
  if (!line) return "—";
  if (line.mate != null && line.mate !== 0) {
    return line.mate > 0 ? `M${line.mate}` : `-M${Math.abs(line.mate)}`;
  }
  if (line.cp == null) return "—";
  const pawns = line.cp / 100;
  const text = Math.abs(pawns).toFixed(2);
  if (pawns > 0) return `+${text}`;
  if (pawns < 0) return `-${text}`;
  return "0.00";
}
