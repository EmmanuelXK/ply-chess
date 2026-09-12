import "server-only";

import type { SpeakerId } from "./types";

export { SPEAKER_PROSODY, speakerProsody } from "./prosody";

export const MAX_TTS_CHARS = 800;

/**
 * Stock / neural IDs only. Never celebrity clones.
 * Override any speaker with TTS_VOICE_<SPEAKER> (active provider)
 * or EDGE_TTS_VOICE_<SPEAKER> / GOOGLE_TTS_VOICE_<SPEAKER> /
 * ELEVENLABS_VOICE_<SPEAKER>.
 */
export const DEFAULT_EDGE_VOICES: Record<SpeakerId, string> = {
  aldric: "en-GB-RyanNeural",
  kael: "en-US-GuyNeural",
  soren: "en-GB-ThomasNeural",
  rhea: "en-US-AriaNeural",
  silas: "en-US-ChristopherNeural",
  lena: "en-US-JennyNeural",
};

/** WaveNet defaults — 4M free chars/month, more generous than Neural2's 1M. */
export const DEFAULT_GOOGLE_VOICES: Record<SpeakerId, string> = {
  aldric: "en-GB-Wavenet-B",
  kael: "en-US-Wavenet-D",
  soren: "en-GB-Wavenet-D",
  rhea: "en-US-Wavenet-F",
  silas: "en-US-Wavenet-B",
  lena: "en-US-Wavenet-C",
};

/** ElevenLabs premade library voices — not likeness clones. */
export const DEFAULT_ELEVENLABS_VOICES: Record<SpeakerId, string> = {
  aldric: "JBFqnCBsd6RMkjVDRZzb", // George
  kael: "pNInz6obpgDQGcFmaJgB", // Adam
  soren: "onwK4e9ZLuTAKqWW03F9", // Daniel
  rhea: "EXAVITQu4vr4xnSDxMaL", // Bella
  silas: "TxGEqnHWrfWFTfGW9XjX", // Josh
  lena: "21m00Tcm4TlvDq8ikWAM", // Rachel
};

function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function speakerEnv(prefix: string, speaker: SpeakerId): string | undefined {
  return env(`${prefix}_${speaker.toUpperCase()}`);
}

export function edgeVoice(speaker: SpeakerId): string {
  return (
    speakerEnv("EDGE_TTS_VOICE", speaker) ||
    speakerEnv("TTS_VOICE", speaker) ||
    env("EDGE_TTS_VOICE") ||
    DEFAULT_EDGE_VOICES[speaker]
  );
}

export function googleVoice(speaker: SpeakerId): string {
  return (
    speakerEnv("GOOGLE_TTS_VOICE", speaker) ||
    speakerEnv("TTS_VOICE", speaker) ||
    env("GOOGLE_TTS_VOICE") ||
    DEFAULT_GOOGLE_VOICES[speaker]
  );
}

export function elevenLabsVoiceId(speaker: SpeakerId): string {
  return (
    speakerEnv("ELEVENLABS_VOICE", speaker) ||
    env("ELEVENLABS_VOICE_ID") ||
    DEFAULT_ELEVENLABS_VOICES[speaker]
  );
}

export function elevenLabsKey(): string | undefined {
  return env("ELEVENLABS_API_KEY");
}

export function googleApiKey(): string | undefined {
  const dedicated = env("GOOGLE_CLOUD_TTS_API_KEY");
  if (dedicated) return dedicated;
  const blob = env("GOOGLE_CLOUD_TTS");
  if (blob && !blob.startsWith("{")) return blob;
  return undefined;
}

export function googleServiceAccountJson(): string | undefined {
  const blob = env("GOOGLE_CLOUD_TTS");
  if (blob?.startsWith("{")) return blob;
  return undefined;
}

export function googleCredentialsPath(): string | undefined {
  return env("GOOGLE_APPLICATION_CREDENTIALS");
}

export function googleConfigured(): boolean {
  return Boolean(
    googleApiKey() || googleServiceAccountJson() || googleCredentialsPath(),
  );
}

