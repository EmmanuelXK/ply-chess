import "server-only";

import type { SpeakerId } from "./types";

export { SPEAKER_PROSODY, speakerProsody } from "./prosody";

export const MAX_TTS_CHARS = 140;

/**
 * Stock / neural IDs only. Never celebrity clones.
 * Override any speaker with TTS_VOICE_<SPEAKER> (active provider)
 * or EDGE_TTS_VOICE_<SPEAKER> / GOOGLE_TTS_VOICE_<SPEAKER> /
 * ELEVENLABS_VOICE_<SPEAKER>.
 */
const MALE_EDGE = "en-GB-RyanNeural";

export const DEFAULT_EDGE_VOICES: Record<SpeakerId, string> = {
  aldric: MALE_EDGE,
  kael: MALE_EDGE,
  soren: MALE_EDGE,
  rhea: MALE_EDGE,
  silas: MALE_EDGE,
  lena: MALE_EDGE,
};

/** WaveNet defaults — 4M free chars/month, more generous than Neural2's 1M. */
const MALE_GOOGLE = "en-GB-Wavenet-B";

export const DEFAULT_GOOGLE_VOICES: Record<SpeakerId, string> = {
  aldric: MALE_GOOGLE,
  kael: MALE_GOOGLE,
  soren: MALE_GOOGLE,
  rhea: MALE_GOOGLE,
  silas: MALE_GOOGLE,
  lena: MALE_GOOGLE,
};

/** ElevenLabs premade library voices — not likeness clones. */
const MALE_ELEVEN = "JBFqnCBsd6RMkjVDRZzb"; // George — stock male

export const DEFAULT_ELEVENLABS_VOICES: Record<SpeakerId, string> = {
  aldric: MALE_ELEVEN,
  kael: MALE_ELEVEN,
  soren: MALE_ELEVEN,
  rhea: MALE_ELEVEN,
  silas: MALE_ELEVEN,
  lena: MALE_ELEVEN,
};

function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function speakerEnv(prefix: string, speaker: SpeakerId): string | undefined {
  return env(`${prefix}_${speaker.toUpperCase()}`);
}

export function edgeVoice(speaker: SpeakerId): string {
  void speaker;
  return (
    speakerEnv("EDGE_TTS_VOICE", "aldric") ||
    speakerEnv("TTS_VOICE", "aldric") ||
    env("EDGE_TTS_VOICE") ||
    DEFAULT_EDGE_VOICES.aldric
  );
}

export function googleVoice(speaker: SpeakerId): string {
  void speaker;
  return (
    speakerEnv("GOOGLE_TTS_VOICE", "aldric") ||
    speakerEnv("TTS_VOICE", "aldric") ||
    env("GOOGLE_TTS_VOICE") ||
    DEFAULT_GOOGLE_VOICES.aldric
  );
}

export function elevenLabsVoiceId(speaker: SpeakerId): string {
  void speaker;
  return (
    speakerEnv("ELEVENLABS_VOICE", "aldric") ||
    env("ELEVENLABS_VOICE_ID") ||
    DEFAULT_ELEVENLABS_VOICES.aldric
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

