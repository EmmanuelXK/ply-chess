/**
 * Client speech is off. Learn stays silent — Ask Coach / Why / Explain are text.
 * Playback helpers remain as no-ops so leftover calls cannot start TTS or Web Speech.
 */
import type { DialogueBeat } from "@/lib/dialogue/types";
import type { SpeakerId } from "@/lib/tts/types";

export type SpeakHandle = {
  stop: () => void;
  done: Promise<void>;
};

function silentHandle(): SpeakHandle {
  return { stop() {}, done: Promise.resolve() };
}

export function prefetchDialogue(
  _beats: DialogueBeat[],
  _opts?: { premium?: boolean },
): void {}

export function unlockSpeech(): void {}

export function speak(
  _text: string,
  _opts?: { speaker?: SpeakerId; premium?: boolean; interrupt?: boolean },
): SpeakHandle {
  return silentHandle();
}

export function speakProfessor(
  text: string,
  opts?: { interrupt?: boolean; speaker?: SpeakerId; premium?: boolean },
): SpeakHandle {
  return speak(text, opts);
}

export function speakDialogue(
  _beats: DialogueBeat[],
  _opts?: {
    premium?: boolean;
    onBeat?: (index: number, beat: DialogueBeat) => void;
    waitForAsk?: (beat: DialogueBeat) => Promise<string | null>;
  },
): SpeakHandle {
  return silentHandle();
}

export function silence(): void {}
