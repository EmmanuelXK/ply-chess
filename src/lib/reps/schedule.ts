import type { StudyMode } from "@/lib/openings/types";
import {
  DAILY_QUEUE_CAP,
  clampLevel,
  gradeCard,
  introduceCard,
  queueMinutes,
  takeDailyQueue,
  type RepCard,
} from "@/lib/reps/ladder";

export type { StudyMode };

export const STUDY_MODES: { id: StudyMode; label: string; blurb: string }[] = [
  {
    id: "learn",
    label: "Learn",
    blurb: "One move at a time, with the book note. Analyze any position yourself.",
  },
];

export { DAILY_QUEUE_CAP, queueMinutes };

const REPS_KEY = "opening-edge.reps.v1";
const PROGRESS_KEY = "opening-edge.progress.v1";
const STREAK_KEY = "opening-edge.streak.v1";

let progressVersion = 0;
const progressListeners = new Set<() => void>();

export interface DueMove {
  openingId: string;
  ply: number;
  due: number;
  level: number;
}

export function subscribeProgress(listener: () => void): () => void {
  progressListeners.add(listener);
  return () => progressListeners.delete(listener);
}

export function getProgressVersion(): number {
  return progressVersion;
}

/** localStorage fingerprint for Learn / Quiz / Review progress. */
export function readProgressSnapshot(): string {
  if (typeof window === "undefined") return "";
  try {
    return [
      REPS_KEY,
      window.localStorage.getItem(REPS_KEY) ?? "",
      STREAK_KEY,
      window.localStorage.getItem(STREAK_KEY) ?? "",
    ].join("\n");
  } catch {
    return "";
  }
}

interface RepEntry extends RepCard {
  ease: number;
  /** Mirrors level so older stored rows still load. */
  streak: number;
}

interface ProgressEntry {
  openingId: string;
  seen: number;
  best: number;
  lastAt: number;
}

interface StreakEntry {
  day: string;
  count: number;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function emitProgress(): void {
  progressVersion += 1;
  for (const listener of progressListeners) listener();
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    emitProgress();
  } catch {
    /* ignore */
  }
}

/** Older Quiz / Review links open Learn. Stored reps stay on disk, unused. */
export function parseStudyMode(value?: string | null): StudyMode {
  void value;
  return "learn";
}

/** The board is Learn only. */
export function drillStudyMode(mode: StudyMode): StudyMode {
  void mode;
  return "learn";
}

function coerceRep(row: Partial<RepEntry> | null | undefined): RepEntry | null {
  if (!row?.openingId || row.ply == null || !Number.isFinite(Number(row.ply))) return null;
  const level = clampLevel(row.level ?? row.streak ?? 0);
  return {
    openingId: String(row.openingId),
    ply: Number(row.ply),
    level,
    due: Number(row.due) || Date.now(),
    ease: Number(row.ease) || 2.3,
    streak: level,
  };
}

function readReps(): RepEntry[] {
  return readJson<Partial<RepEntry>[]>(REPS_KEY, [])
    .map((row) => coerceRep(row))
    .filter((row): row is RepEntry => row != null);
}

function writeReps(rows: RepEntry[]): void {
  writeJson(REPS_KEY, rows);
}

function upsertRep(next: RepCard): void {
  const rows = readReps();
  const idx = rows.findIndex((row) => row.openingId === next.openingId && row.ply === next.ply);
  const stored: RepEntry = { ...next, ease: 2.3, streak: next.level };
  if (idx >= 0) rows[idx] = stored;
  else rows.push(stored);
  writeReps(rows);
}

function dayKey(now: number): string {
  const date = new Date(now);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function previousDay(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  date.setDate(date.getDate() - 1);
  return dayKey(date.getTime());
}

export function touchStreak(now = Date.now()): void {
  const today = dayKey(now);
  const prev = readJson<StreakEntry | null>(STREAK_KEY, null);
  let count = 1;
  if (prev?.day === today) count = Math.max(1, prev.count || 1);
  else if (prev?.day === previousDay(today)) count = Math.max(1, prev.count || 1) + 1;
  writeJson(STREAK_KEY, { day: today, count } satisfies StreakEntry);
}

export function currentStreak(now = Date.now()): number {
  const prev = readJson<StreakEntry | null>(STREAK_KEY, null);
  if (!prev?.day || !prev.count) return 0;
  const today = dayKey(now);
  if (prev.day === today || prev.day === previousDay(today)) return prev.count;
  return 0;
}

export function markReviewed(openingId: string, ply: number, ok: boolean, now = Date.now()): void {
  const prev = readReps().find((row) => row.openingId === openingId && row.ply === ply);
  upsertRep(gradeCard(prev, openingId, ply, ok, now));
  touchStreak(now);
}

export function introduceMove(openingId: string, ply: number, now = Date.now()): void {
  const prev = readReps().find((row) => row.openingId === openingId && row.ply === ply);
  const next = introduceCard(prev, openingId, ply, now);
  if (next) upsertRep(next);
  touchStreak(now);
}

export function listDueCards(openingId?: string, now = Date.now()): DueMove[] {
  const cards = readReps().filter((row) => (openingId ? row.openingId === openingId : true));
  return takeDailyQueue(cards, now, Math.max(cards.length, 1)).map((row) => ({
    openingId: row.openingId,
    ply: row.ply,
    due: row.due,
    level: row.level,
  }));
}

export function markProgress(openingId: string, ply: number): void {
  const rows = readJson<ProgressEntry[]>(PROGRESS_KEY, []);
  const idx = rows.findIndex((row) => row.openingId === openingId);
  const prev = idx >= 0 ? rows[idx] : { openingId, seen: 0, best: 0, lastAt: 0 };
  const next: ProgressEntry = {
    openingId,
    seen: prev.seen + 1,
    best: Math.max(prev.best, ply),
    lastAt: Date.now(),
  };
  if (idx >= 0) rows[idx] = next;
  else rows.push(next);
  writeJson(PROGRESS_KEY, rows);
}

export function progressFor(openingId: string): { seen: number; best: number } {
  const row = readJson<ProgressEntry[]>(PROGRESS_KEY, []).find((item) => item.openingId === openingId);
  return { seen: row?.seen ?? 0, best: row?.best ?? 0 };
}

export function dueCount(openingId: string, now = Date.now()): number {
  return listDueCards(openingId, now).length;
}
