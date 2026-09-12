import type { DialogueBeat } from "@/lib/dialogue/types";
import { ClipCache } from "@/lib/tts/cache";
import { clipHash } from "@/lib/tts/hash";
import { SPEAKER_PROSODY } from "@/lib/tts/prosody";
import { remappedEdgeVoice } from "@/lib/tts/remap";
import type { SpeakerId } from "@/lib/tts/types";
import { pickWebVoice } from "@/lib/tts/voices-web";

export type SpeakHandle = {
  stop: () => void;
  done: Promise<void>;
};

let playGen = 0;
let currentAudio: HTMLAudioElement | null = null;
let objectUrl: string | null = null;
let inflight: AbortController | null = null;

const sessionClips = new ClipCache<Blob>(64);

const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";

function mergeAbort(controller: AbortController, timeoutMs: number): AbortSignal {
  if (typeof AbortSignal !== "undefined") {
    if (
      typeof AbortSignal.any === "function" &&
      typeof AbortSignal.timeout === "function"
    ) {
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

function speakWeb(text: string, speaker: SpeakerId, gen: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    if (gen !== playGen) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const voice = pickWebVoice(speaker);
    const prosody = SPEAKER_PROSODY[speaker];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice?.lang ?? "en-GB";
    if (voice) utterance.voice = voice;
    utterance.rate = prosody.webRate;
    utterance.pitch = prosody.webPitch;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

function playBlob(
  blob: Blob,
  text: string,
  speaker: SpeakerId,
  gen: number,
): Promise<void> {
  return new Promise((resolve) => {
    if (gen !== playGen || typeof window === "undefined") {
      resolve();
      return;
    }
    const url = URL.createObjectURL(blob);
    objectUrl = url;
    const audio = new Audio(url);
    currentAudio = audio;
    const finish = (fallback: boolean) => {
      if (objectUrl === url) {
        URL.revokeObjectURL(url);
        objectUrl = null;
      }
      if (currentAudio === audio) currentAudio = null;
      if (fallback && gen === playGen) {
        void speakWeb(text, speaker, gen).then(resolve);
        return;
      }
      resolve();
    };
    audio.onended = () => finish(false);
    audio.onerror = () => finish(true);
    void audio.play().catch(() => finish(true));
  });
}

async function speakNeural(
  text: string,
  speaker: SpeakerId,
  premium: boolean,
  gen: number,
): Promise<void> {
  const key = clipHash(speaker, premium ? "p" : "f", text);
  const cached = sessionClips.get(key);
  if (cached) {
    await playBlob(cached, text, speaker, gen);
    return;
  }

  const controller = new AbortController();
  inflight = controller;

  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        speaker,
        premium,
        voice: remappedEdgeVoice(speaker),
      }),
      signal: mergeAbort(controller, 12_000),
    });
    if (gen !== playGen) return;
    if (!response.ok) {
      await speakWeb(text, speaker, gen);
      return;
    }
    const blob = await response.blob();
    if (gen !== playGen) return;
    if (!blob.size) {
      await speakWeb(text, speaker, gen);
      return;
    }
    sessionClips.set(key, blob);
    await playBlob(blob, text, speaker, gen);
  } catch {
    if (gen !== playGen) return;
    await speakWeb(text, speaker, gen);
  } finally {
    if (inflight === controller) inflight = null;
  }
}

/** Unlock iOS audio on the Voice tap so later coach lines can autoplay. */
export function unlockSpeech(): void {
  if (typeof window === "undefined") return;
  const tap = new Audio(SILENT_WAV);
  void tap.play().catch(() => {});
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", () => {}, {
      once: true,
    });
  }
}

export function speak(
  text: string,
  opts?: { speaker?: SpeakerId; premium?: boolean; interrupt?: boolean },
): SpeakHandle {
  const trimmed = text.replace(/\s+/g, " ").trim();
  const speaker = opts?.speaker ?? "aldric";
  const premium = opts?.premium === true;
  if (!trimmed) {
    return { stop() {}, done: Promise.resolve() };
  }
  const gen = opts?.interrupt === false ? playGen : ++playGen;
  if (opts?.interrupt !== false) stopPlayback();
  const done = speakNeural(trimmed, speaker, premium, gen);
  return {
    stop() {
      if (playGen === gen) {
        playGen += 1;
        stopPlayback();
      }
    },
    done,
  };
}

export function speakProfessor(
  text: string,
  opts?: { interrupt?: boolean; speaker?: SpeakerId; premium?: boolean },
): SpeakHandle {
  return speak(text, opts);
}

export function speakDialogue(
  beats: DialogueBeat[],
  opts?: {
    premium?: boolean;
    onBeat?: (index: number, beat: DialogueBeat) => void;
    waitForAsk?: (beat: DialogueBeat) => Promise<string | null>;
  },
): SpeakHandle {
  const gen = ++playGen;
  stopPlayback();
  let stopped = false;

  const done = (async () => {
    for (let i = 0; i < beats.length; i++) {
      if (stopped || gen !== playGen) return;
      const beat = beats[i];
      opts?.onBeat?.(i, beat);
      const handleGen = playGen;
      await speakNeural(beat.text, beat.speaker, opts?.premium === true, handleGen);
      if (stopped || gen !== playGen) return;
      if (beat.ask && opts?.waitForAsk) {
        const choice = await opts.waitForAsk(beat);
        if (stopped || gen !== playGen) return;
        const reaction =
          choice && beat.ask.choices.find((c) => c.id === choice)?.correct
            ? beat.ask.onCorrect
            : beat.ask.onWrong;
        opts?.onBeat?.(i, { ...beat, text: reaction.text, speaker: reaction.speaker });
        await speakNeural(
          reaction.text,
          reaction.speaker,
          opts?.premium === true,
          playGen,
        );
      }
    }
  })();

  return {
    stop() {
      stopped = true;
      playGen += 1;
      stopPlayback();
    },
    done,
  };
}

export function silence(): void {
  playGen += 1;
  stopPlayback();
}
