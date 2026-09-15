export type {
  BeatKind,
  DialogueAsk,
  DialogueBeat,
  DialogueMode,
  DialogueScene,
  DuoId,
  DuoPack,
  LessonFacts,
  LessonStyle,
  MissMemory,
  PurposeTag,
  Teacher,
} from "./types";
export { MAX_BEAT_WORDS, MIN_BEAT_WORDS } from "./types";
export { DUOS, DEFAULT_DUO, getDuo, isDuoId, otherTeacher } from "./duos";
export { ACTIVE_COACH, activeTeachers, teacherById } from "./coach";
export {
  readStoredDuo,
  readStoredLesson,
  readStoredMode,
  writeStoredDuo,
  writeStoredLesson,
  writeStoredMode,
} from "./prefs";
export { squaresInSpeech } from "./points";
export { limitWords, nugget, wordCount, leadsWithSan, stripLeadingSanLabel, stripMoveDumpLead, twoBeatLine } from "./short";
export { SHORT_HOOKS, spokenHook, hookAt } from "./hooks";
export type { ShortHook } from "./hooks";
export {
  inferPurpose,
  PURPOSE_LABELS,
  purposeBeats,
} from "./purpose";
export {
  collectFacts,
  dialogueForHistory,
  dialogueForPly,
  dialogueForQuizReaction,
  dialogueForStart,
  dialogueForWhy,
  sceneFromFacts,
  silentScene,
} from "./generate";
export { validateDialogue } from "./validate";
export { COACH_SPEAKER, toCoachSpeaker } from "@/lib/tts/types";
