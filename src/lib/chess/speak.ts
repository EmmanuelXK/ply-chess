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
  beats: DialogueBeat[],
  opts?: { premium?: boolean },
): void {
  void beats;
  void opts;
}

export function unlockSpeech(): void {}

export function speak(
  text: string,
  opts?: { speaker?: SpeakerId; premium?: boolean; interrupt?: boolean },
): SpeakHandle {
  void text;
  void opts;
  return silentHandle();
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
  void beats;
  void opts;
  return silentHandle();
}

export function silence(): void {}
