import { DEFAULT_DUO, isDuoId } from "./duos";
import type { DialogueMode, DuoId, LessonStyle } from "./types";

const DUO_KEY = "opening-edge.duo";
const MODE_KEY = "opening-edge.dialogue-mode";
const LESSON_KEY = "opening-edge.lesson-style";

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function readStoredDuo(): DuoId {
  const raw = read(DUO_KEY);
  if (raw && isDuoId(raw)) return raw;
  return DEFAULT_DUO;
}

export function writeStoredDuo(id: DuoId): void {
  write(DUO_KEY, id);
}

export function readStoredMode(): DialogueMode {
  const raw = read(MODE_KEY);
  if (raw === "solo" || raw === "dual") return raw;
  return "dual";
}

export function writeStoredMode(mode: DialogueMode): void {
  write(MODE_KEY, mode);
}

export function readStoredLesson(): LessonStyle {
  const raw = read(LESSON_KEY);
  if (raw === "podcast" || raw === "teach") return raw;
  return "teach";
}

export function writeStoredLesson(style: LessonStyle): void {
  write(LESSON_KEY, style);
}
