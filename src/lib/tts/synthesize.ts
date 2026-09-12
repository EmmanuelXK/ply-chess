import "server-only";

import { ClipCache } from "./cache";
import {
  edgeVoice,
  elevenLabsKey,
  elevenLabsVoiceId,
  MAX_TTS_CHARS,
} from "./config";
import { synthesizeEdgeTts } from "./edge";
import { synthesizeElevenLabs } from "./elevenlabs";
import { clipHash } from "./hash";

export type TtsProvider = "edge" | "elevenlabs";

export interface TtsClip {
  audio: Buffer;
  contentType: string;
  provider: TtsProvider;
}

const serverCache = new ClipCache<Omit<TtsClip, "provider">>(64);

export function normalizeTtsText(text: string): string | null {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed || trimmed.length > MAX_TTS_CHARS) return null;
  return trimmed;
}

/**
 * Optional ElevenLabs if a key is present, otherwise free Edge TTS.
 * ElevenLabs quota/network errors fall through to Edge so production
 * still sounds good with zero paid accounts.
 */
export async function synthesizeSpeech(text: string): Promise<TtsClip> {
  const key = elevenLabsKey();
  if (key) {
    const voice = elevenLabsVoiceId();
    const cacheKey = clipHash("elevenlabs", voice, text);
    const hit = serverCache.get(cacheKey);
    if (hit) return { ...hit, provider: "elevenlabs" };
    try {
      const clip = await synthesizeElevenLabs(text, key, voice);
      serverCache.set(cacheKey, clip);
      return { ...clip, provider: "elevenlabs" };
    } catch {
      // Fall through to free Edge TTS.
    }
  }

  const voice = edgeVoice();
  const cacheKey = clipHash("edge", voice, text);
  const hit = serverCache.get(cacheKey);
  if (hit) return { ...hit, provider: "edge" };
  const clip = await synthesizeEdgeTts(text, voice);
  serverCache.set(cacheKey, clip);
  return { ...clip, provider: "edge" };
}
