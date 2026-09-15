import { Chess } from "chess.js";
import { maiaScore, planScore } from "@/lib/engines/heuristic";
import type {
  AnalyzeRequest,
  CandidateMove,
  EngineAnalysis,
  EngineConsensus,
  PositionAnalyzer,
} from "./types";

const TEACHING_PV_CAP = 8;

function plyFromFen(fen: string): number {
  const parts = fen.split(" ");
  const full = Number(parts[5] ?? 1);
  const turn = parts[1] === "w" ? 0 : 1;
  return Math.max(0, (full - 1) * 2 + turn);
}

function scoreCandidate(fen: string, san: string): number | undefined {
  try {
    const chess = new Chess(fen);
    const move = chess.move(san);
    if (!move) return undefined;
    const ply = plyFromFen(fen);
    return Math.round(planScore(chess, move) * 0.5 + maiaScore(chess, move, ply) * 0.5);
  } catch {
    return undefined;
  }
}

/** Rank already-compressed candidates. Does not search all legal moves. */
export const stubAnalyzer: PositionAnalyzer = {
  engineId: "stub",
  analyze(request) {
    const pv = request.lookaheadSans.slice(0, Math.min(request.depth, TEACHING_PV_CAP));
    return {
      engineId: "stub",
      ready: true,
      candidates: request.candidates,
      pv,
      note: "Teaching stub — no live engine. Book + understanding only.",
    };
  },
};

/** Single analysis path for Phase 1–2. Multi-engine is a later verification layer. */
export const singlePathAnalyzer: PositionAnalyzer = {
  engineId: "heuristic",
  analyze(request) {
    const ranked = request.fen
      ? [...request.candidates]
          .map((row) => {
            const score = scoreCandidate(request.fen!, row.san);
            return { row, score };
          })
          .sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity))
          .map((entry) => entry.row)
      : request.candidates;
    const pv = request.lookaheadSans.slice(0, Math.min(request.depth, TEACHING_PV_CAP));
    return {
      engineId: "heuristic",
      ready: true,
      candidates: ranked,
      evalCp: request.fen ? scoreCandidate(request.fen, ranked[0]?.san ?? "") : undefined,
      pv,
      note: "Single heuristic path on compressed candidates. Not tactical truth.",
    };
  },
};

/**
 * Multi-engine placeholder. One analyzer now; later votes must investigate
 * disagreement instead of crowning the max eval.
 */
export function engineConsensus(analyses: EngineAnalysis[]): EngineConsensus {
  const live = analyses.filter((row) => row.ready && row.candidates[0]?.san);
  if (live.length <= 1) {
    return {
      analyses,
      agree: true,
      disagreement: null,
      verdict: "stable",
    };
  }

  const tops = live.map((row) => row.candidates[0]?.san).filter(Boolean) as string[];
  const unique = [...new Set(tops)];
  const agree = unique.length <= 1;
  if (agree) {
    return { analyses, agree: true, disagreement: null, verdict: "stable" };
  }

  const mate = live.some((row) => row.mate != null && row.mate !== 0);
  return {
    analyses,
    agree: false,
    disagreement: `Split: ${unique.join(" vs ")}. Investigate — do not crown max eval.`,
    verdict: mate ? "tactical" : "investigate",
  };
}

export function teachingPv(sans: string[], depth: number): string[] {
  return sans.slice(0, Math.min(Math.max(depth, 0), TEACHING_PV_CAP));
}

export type { CandidateMove };
