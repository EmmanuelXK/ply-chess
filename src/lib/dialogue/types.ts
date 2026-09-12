import type { SpeakerId } from "@/lib/tts/types";
import type { CoachKind } from "@/lib/openings/coach";

export type DialogueMode = "dual" | "solo";
export type LessonMode = "podcast" | "teach";

export type DuoId = "voss-draven" | "vale-knox" | "crowe-marquez";

export type BeatKind =
  | "teach"
  | "challenge"
  | "agree"
  | "quiz"
  | "romantic"
  | "history"
  | "takeaway"
  | "fail"
  | "hint";

export interface DialogueAskChoice {
  id: string;
  text: string;
  correct: boolean;
}

export interface DialogueAsk {
  prompt: string;
  choices: DialogueAskChoice[];
  onCorrect: { speaker: SpeakerId; text: string };
  onWrong: { speaker: SpeakerId; text: string };
}

export interface DialogueBeat {
  speaker: SpeakerId;
  text: string;
  kind: BeatKind;
  ask?: DialogueAsk;
}

export interface DialogueScene {
  beats: DialogueBeat[];
  headline: string;
  detail?: string;
  speaker: SpeakerId;
  kind: CoachKind;
}

export interface Teacher {
  id: SpeakerId;
  name: string;
  short: string;
  role: string;
  color: string;
  gender: "male" | "female";
}

export interface DuoPack {
  id: DuoId;
  title: string;
  blurb: string;
  left: Teacher;
  right: Teacher;
}

export interface LessonFacts {
  openingId: string;
  openingName: string;
  shortName: string;
  san?: string;
  chunkName?: string;
  chunkJob?: string;
  concept: string;
  why: string;
  plan: string;
  /** Short positional kernels (8–15 words). Flavor must not dump the long copies. */
  idea?: string;
  whyShort?: string;
  planShort?: string;
  historyTitle?: string;
  historyYear?: number;
  historyEra?: string;
  historySummary?: string;
  historyHere?: string;
  famousGame?: string;
  quizPrompt?: string;
  quizChoices?: DialogueAskChoice[];
  kind: CoachKind;
  fen?: string;
  ply: number;
  romantic?: boolean;
  /** Student just played the book move (Teach). */
  studentMove?: boolean;
  /** Earlier soft-fail SAN in this line, if any. */
  recall?: string;
}
