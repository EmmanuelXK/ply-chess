import type { SpeakerId } from "./types";
import type { TtsRatePref } from "./prosody";

const RATE_KEY = "opening-edge.tts-rate";
const MAP_KEY = "opening-edge.voice-map";
const VOICE_ON_KEY = "opening-edge.voice-on";

export const VOICE_PRESETS: Record<
  SpeakerId,
  { id: string; label: string; edge: string }[]
> = {
  aldric: [
    { id: "default", label: "Warm UK", edge: "en-GB-RyanNeural" },
    { id: "deep", label: "Deep US", edge: "en-US-AndrewNeural" },
    { id: "soft", label: "Soft UK", edge: "en-GB-ThomasNeural" },
  ],
  kael: [
    { id: "default", label: "Warm US", edge: "en-US-AvaNeural" },
    { id: "bright", label: "Bright", edge: "en-US-JennyNeural" },
    { id: "soft", label: "Soft", edge: "en-US-EmmaNeural" },
  ],
  soren: [
    { id: "default", label: "Calm UK", edge: "en-GB-ThomasNeural" },
    { id: "warm", label: "Warm UK", edge: "en-GB-RyanNeural" },
    { id: "low", label: "Low US", edge: "en-US-ChristopherNeural" },
  ],
  rhea: [
    { id: "default", label: "Warm", edge: "en-US-JennyNeural" },
    { id: "bright", label: "Bright", edge: "en-US-AvaNeural" },
    { id: "story", label: "Story", edge: "en-US-AriaNeural" },
  ],
  silas: [
    { id: "default", label: "Clear US", edge: "en-US-AndrewNeural" },
    { id: "warm", label: "Warm", edge: "en-US-ChristopherNeural" },
    { id: "uk", label: "UK", edge: "en-GB-RyanNeural" },
  ],
  lena: [
    { id: "default", label: "Warm", edge: "en-US-EmmaNeural" },
    { id: "bright", label: "Bright", edge: "en-US-JennyNeural" },
    { id: "soft", label: "Soft", edge: "en-US-AvaNeural" },
  ],
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

export function edgeVoiceFor(speaker: SpeakerId): string {
  const presetId = readVoiceMap()[speaker] ?? "default";
  const row = VOICE_PRESETS[speaker].find((p) => p.id === presetId);
  return row?.edge ?? VOICE_PRESETS[speaker][0].edge;
}

export function readVoiceOnDefault(): boolean {
  return read(VOICE_ON_KEY) === "1";
}

export function writeVoiceOnDefault(on: boolean): void {
  write(VOICE_ON_KEY, on ? "1" : "0");
}

export function isWhitelistedEdgeVoice(speaker: SpeakerId, voice: string): boolean {
  return VOICE_PRESETS[speaker].some((p) => p.edge === voice);
}
