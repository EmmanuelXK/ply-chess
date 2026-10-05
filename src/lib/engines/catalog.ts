export type AnalysisEngineId = "stockfish" | "fairy" | "lc0";

export interface EngineChoice {
  id: AnalysisEngineId;
  label: string;
  blurb: string;
  /** Classic worker script served from /public. */
  worker: string;
  /** Network bytes stay on disk until this engine is selected. */
  lazy: boolean;
  license: "GPL-3.0";
}

export const ENGINE_CHOICES: readonly EngineChoice[] = [
  {
    id: "stockfish",
    label: "Stockfish",
    blurb: "Lite",
    worker: "/engines/stockfish-19-lite-single.js",
    lazy: false,
    license: "GPL-3.0",
  },
  {
    id: "fairy",
    label: "Fairy",
    blurb: "NNUE",
    worker: "/engines/fairy/bridge.js",
    lazy: false,
    license: "GPL-3.0",
  },
  {
    id: "lc0",
    label: "Lc0",
    blurb: "Net",
    worker: "/engines/lc0/lc0.js",
    lazy: true,
    license: "GPL-3.0",
  },
];

export const LC0_WEIGHTS = "/engines/lc0/weights_9155.txt.gz";

export const ENGINE_DEPTHS = [8, 12, 16] as const;
export type EngineDepth = (typeof ENGINE_DEPTHS)[number];

export function engineById(id: AnalysisEngineId): EngineChoice {
  const found = ENGINE_CHOICES.find((engine) => engine.id === id);
  if (!found) return ENGINE_CHOICES[0];
  return found;
}

/** Files planted for the three engines. Bounds are the shipped builds, not guesses. */
export const ENGINE_ASSETS: readonly { path: string; min: number; max: number }[] = [
  { path: "public/engines/stockfish-19-lite-single.js", min: 15_000, max: 80_000 },
  { path: "public/engines/stockfish-19-lite-single.wasm", min: 1_400_000, max: 2_600_000 },
  { path: "public/engines/fairy/stockfish.js", min: 40_000, max: 120_000 },
  { path: "public/engines/fairy/stockfish.wasm", min: 1_200_000, max: 2_200_000 },
  { path: "public/engines/fairy/stockfish.worker.js", min: 1_000, max: 20_000 },
  { path: "public/engines/fairy/bridge.js", min: 200, max: 4_000 },
  { path: "public/engines/lc0/lc0.js", min: 100_000, max: 400_000 },
  { path: "public/engines/lc0/lc0.wasm", min: 400_000, max: 1_200_000 },
  { path: "public/engines/lc0/weights_9155.txt.gz", min: 18_000_000, max: 26_000_000 },
  { path: "public/engines/lc0/vendor/tf.min.js", min: 400_000, max: 1_500_000 },
  { path: "public/engines/licenses/COPYING.txt", min: 10_000, max: 80_000 },
];
