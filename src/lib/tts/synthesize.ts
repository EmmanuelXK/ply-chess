import "server-only";

import { ClipCache } from "./cache";
import {
  edgeVoice,
  elevenLabsKey,
  elevenLabsVoiceId,
  googleConfigured,
  MAX_TTS_CHARS,
} from "./config";
import { synthesizeEdgeTts } from "./edge";
import { synthesizeElevenLabs } from "./elevenlabs";
import { synthesizeGoogleTts } from "./google";
import { clipHash } from "./hash";
import type { SpeakerId, TtsClip, TtsRequest } from "./types";

const serverCache = new ClipCache<TtsClip>(96);

export function normalizeTtsText(text: string): string | null {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed || trimmed.length > MAX_TTS_CHARS) return null;
  return trimmed;
}

export function parseSpeaker(value: unknown): SpeakerId {
  if (
    value === "aldric" ||
    value === "kael" ||
    value === "soren" ||
    value === "rhea" ||
    value === "silas" ||
    value === "lena"
  ) {
    return value;
  }
  return "aldric";
}

/**
 * Priority:
 * 1. ElevenLabs — only when a key is set AND the lesson asked for premium characters
 * 2. Google Cloud TTS — when credentials / API key are configured
 * 3. Edge TTS — free neural path (needs network; not true offline)
 *
 * Web Speech is the client-only last resort.
 */
export async function synthesizeSpeech(request: TtsRequest): Promise<TtsClip> {
  const text = request.text;
  const speaker = request.speaker;

  if (request.premium) {
    const key = elevenLabsKey();
    if (key) {
      const voice = elevenLabsVoiceId(speaker);
      const cacheKey = clipHash("elevenlabs", speaker, voice, text);
      const hit = serverCache.get(cacheKey);
      if (hit) return hit;
      try {
        const raw = await synthesizeElevenLabs(text, key, voice, speaker);
        const clip: TtsClip = { ...raw, provider: "elevenlabs" };
        serverCache.set(cacheKey, clip);
        return clip;
      } catch {
        // Fall through to Google / Edge.
      }
    }
  }

  if (googleConfigured()) {
    const cacheKey = clipHash("google", speaker, text);
    const hit = serverCache.get(cacheKey);
    if (hit) return hit;
    try {
      const raw = await synthesizeGoogleTts(text, speaker);
      const clip: TtsClip = { ...raw, provider: "google" };
      serverCache.set(cacheKey, clip);
      return clip;
    } catch {
      // Fall through to free Edge TTS.
    }
  }

  const voice = edgeVoice(speaker);
  const cacheKey = clipHash("edge", speaker, voice, text);
  const hit = serverCache.get(cacheKey);
  if (hit) return hit;
  const raw = await synthesizeEdgeTts(text, voice, speaker);
  const clip: TtsClip = { ...raw, provider: "edge" };
  serverCache.set(cacheKey, clip);
  return clip;
}
