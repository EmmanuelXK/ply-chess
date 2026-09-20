import { COACH_SPEAKER, type SpeakerId } from "./types";
import type { TtsRatePref } from "./prosody";

const RATE_KEY = "opening-edge.tts-rate";
const MAP_KEY = "opening-edge.voice-map";
const VOICE_ON_KEY = "opening-edge.voice-on";

const MALE_PRESETS = [
  { id: "default", label: "Warm UK", edge: "en-GB-RyanNeural" },
  { id: "deep", label: "Deep US", edge: "en-US-AndrewNeural" },
  { id: "soft", label: "Soft UK", edge: "en-GB-ThomasNeural" },
] as const;

export const VOICE_PRESETS: Record<
  SpeakerId,
  { id: string; label: string; edge: string }[]
> = {
  aldric: [...MALE_PRESETS],
  kael: [...MALE_PRESETS],
  soren: [...MALE_PRESETS],
  rhea: [...MALE_PRESETS],
  silas: [...MALE_PRESETS],
  lena: [...MALE_PRESETS],
};

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function readTtsRate(): TtsRatePref {
  const raw = read(RATE_KEY);
  if (raw === "slow" || raw === "clear" || raw === "brisk") return raw;
  return "clear";
}

export function writeTtsRate(rate: TtsRatePref): void {
  write(RATE_KEY, rate);
}

export function readVoiceMap(): Partial<Record<SpeakerId, string>> {
  const raw = read(MAP_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed;
  } catch {
    return {};
  }
}

export function writeVoicePreset(speaker: SpeakerId, presetId: string): void {
  const next = { ...readVoiceMap(), [speaker]: presetId };
  write(MAP_KEY, JSON.stringify(next));
}

export function edgeVoiceFor(speaker: SpeakerId = COACH_SPEAKER): string {
  void speaker;
  const presetId = readVoiceMap()[COACH_SPEAKER] ?? "default";
  const row = VOICE_PRESETS[COACH_SPEAKER].find((p) => p.id === presetId);
  return row?.edge ?? VOICE_PRESETS[COACH_SPEAKER][0].edge;
}

/** Voice playback is off. Unset prefs stay silent. */
export function voiceOnFromStored(raw: string | null): boolean {
  return raw === "1";
}

export function readVoiceOnDefault(): boolean {
  return voiceOnFromStored(read(VOICE_ON_KEY));
}

export function writeVoiceOnDefault(on: boolean): void {
  write(VOICE_ON_KEY, on ? "1" : "0");
}

export function isWhitelistedEdgeVoice(speaker: SpeakerId, voice: string): boolean {
  void speaker;
  return VOICE_PRESETS[COACH_SPEAKER].some((p) => p.edge === voice);
}
