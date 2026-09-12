import "server-only";

import {
  DEFAULT_EDGE_VOICES,
  DEFAULT_GOOGLE_VOICES,
  maskVoiceId,
} from "./catalog";
import { SPEAKER_IDS, type SpeakerId } from "./types";

export { SPEAKER_PROSODY, speakerProsody } from "./prosody";
export { DEFAULT_EDGE_VOICES, DEFAULT_GOOGLE_VOICES } from "./catalog";

export const MAX_TTS_CHARS = 800;

/**
 * Stock / neural IDs only. Never celebrity clones.
 * Override any speaker with TTS_VOICE_<SPEAKER> (active provider)
 * or EDGE_TTS_VOICE_<SPEAKER> / GOOGLE_TTS_VOICE_<SPEAKER> /
 * ELEVENLABS_VOICE_<SPEAKER>.
 * Settings can remap Edge voices per coach without env vars.
 */

/**
 * Example stock library IDs (M/F matched). Not used unless pasted
 * as ELEVENLABS_VOICE_<SPEAKER>. Instant Voice Clone IDs go in the
 * same env slots. Never celebrity / likeness clones.
 */
export const DEFAULT_ELEVENLABS_VOICES: Record<SpeakerId, string> = {
  aldric: "JBFqnCBsd6RMkjVDRZzb", // George (male)
  kael: "AZnzlk1XvdvUeBnXmlld", // Domi (female)
  soren: "onwK4e9ZLuTAKqWW03F9", // Daniel (male)
  rhea: "EXAVITQu4vr4xnSDxMaL", // Bella (female)
  silas: "TxGEqnHWrfWFTfGW9XjX", // Josh (male)
  lena: "21m00Tcm4TlvDq8ikWAM", // Rachel (female)
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

/** Instant Voice Clone (or stock) ID pasted for this coach. */
export function elevenLabsVoiceOverride(
  speaker: SpeakerId,
): string | undefined {
  return speakerEnv("ELEVENLABS_VOICE", speaker);
}

export function elevenLabsVoiceId(speaker: SpeakerId): string {
  return elevenLabsVoiceOverride(speaker) || DEFAULT_ELEVENLABS_VOICES[speaker];
}

export function elevenLabsSpeakerStatus(): Record<
  SpeakerId,
  { configured: boolean; masked?: string }
> {
  const out = {} as Record<SpeakerId, { configured: boolean; masked?: string }>;
  for (const speaker of SPEAKER_IDS) {
    const id = elevenLabsVoiceOverride(speaker);
    out[speaker] = id
      ? { configured: true, masked: maskVoiceId(id) }
      : { configured: false };
  }
  return out;
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

