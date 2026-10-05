import {
  ENGINE_DEPTHS,
  type AnalysisEngineId,
  type EngineDepth,
} from "./catalog";

export const ENGINE_PREF_EVENT = "oe-engine-pref";

export const ENGINE_STORAGE_KEY = "oe.engine";
export const ENGINE_DEPTH_KEY = "oe.engine.depth";

type Store = Pick<Storage, "getItem" | "setItem">;

export function readEngineChoice(storage: Store | null | undefined): AnalysisEngineId {
  const raw = storage?.getItem(ENGINE_STORAGE_KEY);
  if (raw === "stockfish" || raw === "fairy" || raw === "lc0") return raw;
  return "stockfish";
}

export function writeEngineChoice(
  storage: Store | null | undefined,
  id: AnalysisEngineId,
): void {
  storage?.setItem(ENGINE_STORAGE_KEY, id);
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ENGINE_PREF_EVENT));
}

export function readEngineDepth(storage: Store | null | undefined): EngineDepth {
  const raw = Number(storage?.getItem(ENGINE_DEPTH_KEY));
  if (raw === 8 || raw === 12 || raw === 16) return raw;
  return 12;
}

export function writeEngineDepth(storage: Store | null | undefined, depth: EngineDepth): void {
  if (!ENGINE_DEPTHS.includes(depth)) return;
  storage?.setItem(ENGINE_DEPTH_KEY, String(depth));
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ENGINE_PREF_EVENT));
}
