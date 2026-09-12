import { ClipCache } from "@/lib/tts/cache";
import { clipHash } from "@/lib/tts/hash";

let playGen = 0;
let currentAudio: HTMLAudioElement | null = null;
let objectUrl: string | null = null;
let inflight: AbortController | null = null;

const sessionClips = new ClipCache<Blob>(48);

const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";

function mergeAbort(controller: AbortController, timeoutMs: number): AbortSignal {
  if (typeof AbortSignal !== "undefined") {
    if (typeof AbortSignal.any === "function" && typeof AbortSignal.timeout === "function") {
      return AbortSignal.any([controller.signal, AbortSignal.timeout(timeoutMs)]);
    }
    if (typeof AbortSignal.timeout === "function") {
      const timed = AbortSignal.timeout(timeoutMs);
      timed.addEventListener("abort", () => controller.abort(), { once: true });
    } else {
      window.setTimeout(() => controller.abort(), timeoutMs);
    }
  }
  return controller.signal;
}

function stopPlayback(): void {
  inflight?.abort();
  inflight = null;
  if (currentAudio) {
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio.pause();
    currentAudio.removeAttribute("src");
    currentAudio.load();
    currentAudio = null;
  }
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function speakWeb(text: string, gen: number): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (gen !== playGen) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.94;
  utterance.pitch = 0.88;
  utterance.lang = "en-GB";
  window.speechSynthesis.speak(utterance);
}

function playBlob(blob: Blob, text: string, gen: number): void {
  if (gen !== playGen || typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  objectUrl = url;
  const audio = new Audio(url);
  currentAudio = audio;
  audio.onended = () => {
    if (objectUrl === url) {
      URL.revokeObjectURL(url);
      objectUrl = null;
    }
    if (currentAudio === audio) currentAudio = null;
  };
  audio.onerror = () => {
    if (objectUrl === url) {
      URL.revokeObjectURL(url);
      objectUrl = null;
    }
    if (currentAudio === audio) currentAudio = null;
    speakWeb(text, gen);
  };
  void audio.play().catch(() => {
    if (gen === playGen) speakWeb(text, gen);
  });
}

async function speakNeural(text: string, gen: number): Promise<void> {
  const key = clipHash(text);
  const cached = sessionClips.get(key);
  if (cached) {
    playBlob(cached, text, gen);
    return;
  }

  const controller = new AbortController();
  inflight = controller;

  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: mergeAbort(controller, 12_000),
    });
    if (gen !== playGen) return;
    if (!response.ok) {
      speakWeb(text, gen);
      return;
    }
    const blob = await response.blob();
    if (gen !== playGen) return;
    if (!blob.size) {
      speakWeb(text, gen);
      return;
    }
    sessionClips.set(key, blob);
    playBlob(blob, text, gen);
  } catch {
    if (gen !== playGen) return;
    speakWeb(text, gen);
  } finally {
    if (inflight === controller) inflight = null;
  }
}

/** Unlock iOS audio on the Voice tap so later coach lines can autoplay. */
export function unlockSpeech(): void {
  if (typeof window === "undefined") return;
  const tap = new Audio(SILENT_WAV);
  void tap.play().catch(() => {});
}

export function speak(text: string): void {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) return;
  const gen = ++playGen;
  stopPlayback();
  void speakNeural(trimmed, gen);
}

export function silence(): void {
  playGen += 1;
  stopPlayback();
}
