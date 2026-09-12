import { DEFAULT_EDGE_VOICES, isAllowedEdgeVoice } from "./catalog";
import type { SpeakerId } from "./types";

const KEY = "opening-edge.voice-remap";

export type VoiceRemap = Partial<Record<SpeakerId, { edge?: string }>>;

export function readVoiceRemap(): VoiceRemap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as VoiceRemap;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

export function writeVoiceRemap(next: VoiceRemap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
}

export function remappedEdgeVoice(speaker: SpeakerId): string {
  const override = readVoiceRemap()[speaker]?.edge;
  if (override && isAllowedEdgeVoice(override)) return override;
  return DEFAULT_EDGE_VOICES[speaker];
}

export function setEdgeVoice(speaker: SpeakerId, voice: string): VoiceRemap {
  const current = readVoiceRemap();
  const next: VoiceRemap = {
    ...current,
    [speaker]: { ...current[speaker], edge: voice },
  };
  if (voice === DEFAULT_EDGE_VOICES[speaker]) {
    const copy = { ...next };
    delete copy[speaker];
    writeVoiceRemap(copy);
    return copy;
  }
  writeVoiceRemap(next);
  return next;
}
