export type AnalysisEngineId = "stockfish";

export interface EngineChoice {
  id: AnalysisEngineId;
  label: string;
  blurb: string;
  /** Classic worker script served from /public. */
  worker: string;
  lazy: boolean;
  license: "GPL-3.0";
}

/**
 * Stockfish.js 17.1 lite, multithreaded.
 * Official mobile build when cross-origin isolation is available.
 * The full 17.1 net is about 75MB; this lite net is about 6.8MB.
 */
export const STOCKFISH_WORKER = "/engines/stockfish-17.1-lite.js";

export const ENGINE_CHOICES: readonly EngineChoice[] = [
  {
    id: "stockfish",
    label: "Stockfish",
    blurb: "17.1",
    worker: STOCKFISH_WORKER,
    lazy: false,
    license: "GPL-3.0",
  },
];

/** Live search stops at this depth or after this many milliseconds, whichever comes first. */
export const LIVE_DEPTH = 20;
export const LIVE_MOVETIME_MS = 2500;

export const ENGINE_DEPTHS = [LIVE_DEPTH] as const;
export type EngineDepth = (typeof ENGINE_DEPTHS)[number];

export function engineById(id: AnalysisEngineId): EngineChoice {
  const found = ENGINE_CHOICES.find((engine) => engine.id === id);
  if (!found) return ENGINE_CHOICES[0];
  return found;
}

/** Files planted for the engine. Bounds are the shipped build, not guesses. */
export const ENGINE_ASSETS: readonly { path: string; min: number; max: number }[] = [
  { path: "public/engines/stockfish-17.1-lite.js", min: 15_000, max: 80_000 },
  { path: "public/engines/stockfish-17.1-lite.wasm", min: 5_000_000, max: 9_000_000 },
  { path: "public/engines/licenses/COPYING.txt", min: 10_000, max: 80_000 },
];
