import { DEFAULT_DUO, isDuoId } from "./duos";
import type { DialogueMode, DuoId } from "./types";

const DUO_KEY = "opening-edge.duo";
const MODE_KEY = "opening-edge.dialogue-mode";

export function readStoredDuo(): DuoId {
  if (typeof window === "undefined") return DEFAULT_DUO;
  try {
    const raw = window.localStorage.getItem(DUO_KEY);
    if (raw && isDuoId(raw)) return raw;
  } catch {
    /* private mode */
  }
  return DEFAULT_DUO;
}

export function writeStoredDuo(id: DuoId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DUO_KEY, id);
  } catch {
    /* ignore */
  }
}

export function readStoredMode(): DialogueMode {
  if (typeof window === "undefined") return "dual";
  try {
    const raw = window.localStorage.getItem(MODE_KEY);
    if (raw === "solo" || raw === "dual") return raw;
  } catch {
    /* ignore */
  }
  return "dual";
}

export function writeStoredMode(mode: DialogueMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MODE_KEY, mode);
  } catch {
    /* ignore */
  }
}
