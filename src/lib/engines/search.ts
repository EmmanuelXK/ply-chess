import { LIVE_DEPTH, LIVE_MOVETIME_MS } from "./catalog";

/** How Analyze should search. Learn keeps the live cap and does not use this menu. */
export type AnalysisLimit =
  | { kind: "live" }
  | { kind: "infinite" }
  | { kind: "bounded"; depth: number; movetimeMs: number };

export function limitToken(limit: AnalysisLimit): string {
  if (limit.kind === "infinite") return "infinite";
  if (limit.kind === "bounded") return `d${clampDepth(limit.depth)}t${clampTime(limit.movetimeMs)}`;
  return "live";
}

export function analysisKey(parts: {
  id: string;
  limit: AnalysisLimit;
  multipv: number;
  nonce: number;
  fen: string;
}): string {
  return `${parts.id}|${limitToken(parts.limit)}|${parts.multipv}|${parts.nonce}|${parts.fen}`;
}

export function uciGo(limit: AnalysisLimit): string {
  if (limit.kind === "infinite") return "go infinite";
  if (limit.kind === "bounded") {
    return `go depth ${clampDepth(limit.depth)} movetime ${clampTime(limit.movetimeMs)}`;
  }
  return `go depth ${LIVE_DEPTH} movetime ${LIVE_MOVETIME_MS}`;
}

export function clampDepth(depth: number): number {
  if (!Number.isFinite(depth)) return LIVE_DEPTH;
  return Math.max(1, Math.min(40, Math.round(depth)));
}

export function clampTime(ms: number): number {
  if (!Number.isFinite(ms)) return LIVE_MOVETIME_MS;
  return Math.max(100, Math.min(120_000, Math.round(ms)));
}

export const ANALYZE_DEPTHS = [12, 16, 20, 24, 30] as const;
export const ANALYZE_TIMES_MS = [1000, 2500, 5000, 10_000, 30_000] as const;

export const LIVE_LIMIT: AnalysisLimit = { kind: "live" };
