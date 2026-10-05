import type { SupabaseClient } from "@supabase/supabase-js";
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

const REPS_BASE = "opening-edge.reps.v1";
const PROGRESS_BASE = "opening-edge.progress.v1";
const STREAK_BASE = "opening-edge.streak.v1";
const USER_KEY = "opening-edge.progress-user";

let progressUser: string | null = null;
let dirtyHandler: (() => void) | null = null;
let progressVersion = 0;
const progressListeners = new Set<() => void>();

export interface DueMove {
  openingId: string;
  ply: number;
  due: number;
  level: number;
}

export function setProgressUser(id: string | null): void {
  progressUser = id;
  if (typeof window === "undefined") return;
  try {
    if (id) window.localStorage.setItem(USER_KEY, id);
    else window.localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
  emitProgress();
}

export function setProgressDirtyHandler(fn: (() => void) | null): void {
  dirtyHandler = fn;
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
      repsKey(),
      window.localStorage.getItem(repsKey()) ?? "",
      streakKey(),
      window.localStorage.getItem(streakKey()) ?? "",
    ].join("\n");
  } catch {
    return "";
  }
}

function repsKey(): string {
  return progressUser ? `${REPS_BASE}.${progressUser}` : REPS_BASE;
}

function progressKey(): string {
  return progressUser ? `${PROGRESS_BASE}.${progressUser}` : PROGRESS_BASE;
}

function streakKey(): string {
  return progressUser ? `${STREAK_BASE}.${progressUser}` : STREAK_BASE;
}

export function adoptAnonIfNeeded(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    const pairs = [
      [REPS_BASE, `${REPS_BASE}.${userId}`],
      [PROGRESS_BASE, `${PROGRESS_BASE}.${userId}`],
      [STREAK_BASE, `${STREAK_BASE}.${userId}`],
    ];
    for (const [anonKey, userKey] of pairs) {
      if (!window.localStorage.getItem(userKey)) {
        const anon = window.localStorage.getItem(anonKey);
        if (anon) window.localStorage.setItem(userKey, anon);
      }
    }
    emitProgress();
  } catch {
    /* ignore */
  }
}

interface RepEntry extends RepCard {
  ease: number;
  /** Mirrors level so the existing remote row still round-trips. */
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

function writeJson(key: string, value: unknown, remote = true): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    emitProgress();
    if (remote) dirtyHandler?.();
  } catch {
    /* ignore */
  }
}

export function getProgressUser(): string | null {
  return progressUser;
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
  return readJson<Partial<RepEntry>[]>(repsKey(), [])
    .map((row) => coerceRep(row))
    .filter((row): row is RepEntry => row != null);
}

function writeReps(rows: RepEntry[]): void {
  writeJson(repsKey(), rows);
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
  const prev = readJson<StreakEntry | null>(streakKey(), null);
  let count = 1;
  if (prev?.day === today) count = Math.max(1, prev.count || 1);
  else if (prev?.day === previousDay(today)) count = Math.max(1, prev.count || 1) + 1;
  writeJson(streakKey(), { day: today, count } satisfies StreakEntry, false);
}

export function currentStreak(now = Date.now()): number {
  const prev = readJson<StreakEntry | null>(streakKey(), null);
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
  const rows = readJson<ProgressEntry[]>(progressKey(), []);
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
  writeJson(progressKey(), rows);
}

export function progressFor(openingId: string): { seen: number; best: number } {
  const row = readJson<ProgressEntry[]>(progressKey(), []).find((item) => item.openingId === openingId);
  return { seen: row?.seen ?? 0, best: row?.best ?? 0 };
}

export function dueCount(openingId: string, now = Date.now()): number {
  return listDueCards(openingId, now).length;
}

export async function pullRemoteProgress(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const [{ data: progress }, { data: reps }] = await Promise.all([
    supabase.from("opening_progress").select("opening_id, seen, best, last_at").eq("user_id", userId),
    supabase.from("opening_reps").select("opening_id, ply, due, ease, streak").eq("user_id", userId),
  ]);
  if (Array.isArray(progress) && progress.length) {
    writeJson(
      `${PROGRESS_BASE}.${userId}`,
      progress.map((row) => ({
        openingId: String(row.opening_id),
        seen: Number(row.seen) || 0,
        best: Number(row.best) || 0,
        lastAt: Date.parse(String(row.last_at)) || Date.now(),
      })),
      false,
    );
  }
  if (Array.isArray(reps) && reps.length) {
    writeJson(
      `${REPS_BASE}.${userId}`,
      reps.map((row) => {
        const level = clampLevel(Number(row.streak) || 0);
        return {
          openingId: String(row.opening_id),
          ply: Number(row.ply) || 0,
          due: Date.parse(String(row.due)) || Date.now(),
          ease: Number(row.ease) || 2.3,
          streak: level,
          level,
        };
      }),
      false,
    );
  }
}

export async function pushRemoteProgress(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const progress = readJson<ProgressEntry[]>(`${PROGRESS_BASE}.${userId}`, []);
  const reps = readJson<Partial<RepEntry>[]>(`${REPS_BASE}.${userId}`, [])
    .map((row) => coerceRep(row))
    .filter((row): row is RepEntry => row != null);
  if (progress.length) {
    await supabase.from("opening_progress").upsert(
      progress.map((row) => ({
        user_id: userId,
        opening_id: row.openingId,
        seen: row.seen,
        best: row.best,
        last_at: new Date(row.lastAt || Date.now()).toISOString(),
      })),
    );
  }
  if (reps.length) {
    await supabase.from("opening_reps").upsert(
      reps.map((row) => ({
        user_id: userId,
        opening_id: row.openingId,
        ply: row.ply,
        due: new Date(row.due).toISOString(),
        ease: row.ease,
        streak: row.level,
      })),
    );
  }
}
