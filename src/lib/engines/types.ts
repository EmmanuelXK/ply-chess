export type EngineId = "stockfish" | "lc0" | "maia";

export interface EngineMove {
  san: string;
  uci: string;
  scoreCp?: number;
  mate?: number;
  pv?: string[];
}

export interface EngineVote {
  id: EngineId;
  label: string;
  ready: boolean;
  move: EngineMove | null;
  note: string;
}

export interface HybridAdvice {
  votes: EngineVote[];
  pick: EngineMove | null;
  pickId: EngineId | "blend";
  headline: string;
  detail: string;
  disagree: boolean;
}

export interface EvalTick {
  cp: number | null;
  mate: number | null;
  depth: number;
  best?: string;
}
