import type { SupabaseClient } from "@supabase/supabase-js";
import type { Opening } from "@/lib/openings/types";

export type StudyMode =
  | "learn"
  | "reps"
  | "practice"
  | "drill"
  | "trial"
  | "progress";

export const STUDY_MODES: { id: StudyMode; label: string; blurb: string }[] = [
  { id: "learn", label: "Learn", blurb: "Coach walks the spine. You move." },
  { id: "reps", label: "Reps", blurb: "Spaced recall. Soft-fail, then retry." },
  { id: "practice", label: "Practice", blurb: "Hybrid engines. Human-practical plans." },
  { id: "drill", label: "Drill", blurb: "Traps and positional shots." },
  { id: "trial", label: "Time Trial", blurb: "Beat the clock through the line." },
  { id: "progress", label: "Progress", blurb: "What stuck — and what to review next." },
];

const REPS_BASE = "opening-edge.reps.v1";
const PROGRESS_BASE = "opening-edge.progress.v1";
const USER_KEY = "opening-edge.progress-user";

let progressUser: string | null = null;
let dirtyHandler: (() => void) | null = null;

export function setProgressUser(id: string | null): void {
  progressUser = id;
  if (typeof window === "undefined") return;
  try {
    if (id) window.localStorage.setItem(USER_KEY, id);
    else window.localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

export function setProgressDirtyHandler(fn: (() => void) | null): void {
  dirtyHandler = fn;
}

function repsKey(): string {
  return progressUser ? `${REPS_BASE}.${progressUser}` : REPS_BASE;
}

function progressKey(): string {
  return progressUser ? `${PROGRESS_BASE}.${progressUser}` : PROGRESS_BASE;
}

export function adoptAnonIfNeeded(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    const nextReps = `${REPS_BASE}.${userId}`;
    const nextProg = `${PROGRESS_BASE}.${userId}`;
    if (!window.localStorage.getItem(nextReps)) {
      const anon = window.localStorage.getItem(REPS_BASE);
      if (anon) window.localStorage.setItem(nextReps, anon);
    }
    if (!window.localStorage.getItem(nextProg)) {
      const anon = window.localStorage.getItem(PROGRESS_BASE);
      if (anon) window.localStorage.setItem(nextProg, anon);
    }
  } catch {
    /* ignore */
  }
}

interface RepEntry {
  openingId: string;
  ply: number;
  due: number;
  ease: number;
  streak: number;
}

interface ProgressEntry {
  openingId: string;
  seen: number;
  best: number;
  lastAt: number;
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

function writeJson(key: string, value: unknown, remote = true): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    if (remote) dirtyHandler?.();
  } catch {
    /* ignore */
  }
}

export function getProgressUser(): string | null {
  return progressUser;
}

export function parseStudyMode(value?: string | null): StudyMode {
  if (
    value === "learn" ||
    value === "reps" ||
    value === "practice" ||
    value === "drill" ||
    value === "trial" ||
    value === "progress"
  ) {
    return value;
  }
  if (value === "spine") return "learn";
  if (value === "traps" || value === "quiz") return "drill";
  if (value === "think") return "practice";
  return "learn";
}

/** Home Progress is a dashboard filter — drill has no Progress chip. */
export function drillStudyMode(
  mode: StudyMode,
): Exclude<StudyMode, "progress"> {
  return mode === "progress" ? "reps" : mode;
}

export function markReviewed(openingId: string, ply: number, ok: boolean): void {
  const rows = readJson<RepEntry[]>(repsKey(), []);
  const now = Date.now();
  const idx = rows.findIndex((r) => r.openingId === openingId && r.ply === ply);
  const prev = idx >= 0 ? rows[idx] : { openingId, ply, due: now, ease: 2.3, streak: 0 };
  const streak = ok ? prev.streak + 1 : 0;
  const ease = Math.max(1.3, prev.ease + (ok ? 0.12 : -0.28));
  const waitMin = ok ? Math.round(20 * ease ** Math.min(streak, 6)) : 8;
  const next: RepEntry = {
    openingId,
    ply,
    due: now + waitMin * 60_000,
    ease,
    streak,
  };
  if (idx >= 0) rows[idx] = next;
  else rows.push(next);
  writeJson(repsKey(), rows);
}

function plyRecord(
  rows: RepEntry[],
  openingId: string,
  ply: number,
): RepEntry | undefined {
  return rows.find((r) => r.openingId === openingId && r.ply === ply);
}

function recordIsWeak(rec: RepEntry | undefined, now: number): boolean {
  if (!rec) return false;
  return rec.due <= now || rec.ease < 2.2 || rec.streak === 0;
}

export function duePly(openingId: string, maxPly: number): number {
  const rows = readJson<RepEntry[]>(repsKey(), []).filter((r) => r.openingId === openingId);
  const now = Date.now();
  const due = rows
    .filter((r) => r.due <= now && r.ply < maxPly)
    .sort((a, b) => a.ply - b.ply);
  return due[0]?.ply ?? 0;
}

/** Houses that contain a failed, stale, or due review ply. */
export function dueChunks(opening: Opening): {
  start: number;
  name: string;
  due: boolean;
}[] {
  const rows = readJson<RepEntry[]>(repsKey(), []).filter(
    (r) => r.openingId === opening.id,
  );
  const now = Date.now();
  return opening.chunks.map((chunk) => {
    let due = false;
    for (let ply = chunk.fromPly; ply <= chunk.toPly; ply++) {
      if (recordIsWeak(plyRecord(rows, opening.id, ply), now)) {
        due = true;
        break;
      }
    }
    return { start: chunk.fromPly, name: chunk.name, due };
  });
}

export function weakHouseName(opening: Opening): string | null {
  return dueChunks(opening).find((chunk) => chunk.due)?.name ?? null;
}

/** First ply of the weakest due house, else the oldest due ply. */
export function reviewStartPly(opening: Opening): number {
  const house = dueChunks(opening).find((chunk) => chunk.due);
  if (house) return house.start;
  return duePly(opening.id, opening.moves.length);
}

export function markProgress(openingId: string, ply: number): void {
  const rows = readJson<ProgressEntry[]>(progressKey(), []);
  const idx = rows.findIndex((r) => r.openingId === openingId);
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
  const row = readJson<ProgressEntry[]>(progressKey(), []).find((r) => r.openingId === openingId);
  return { seen: row?.seen ?? 0, best: row?.best ?? 0 };
}

export function dueCount(openingId: string): number {
  const now = Date.now();
  return readJson<RepEntry[]>(repsKey(), []).filter(
    (r) => r.openingId === openingId && r.due <= now,
  ).length;
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
      reps.map((row) => ({
        openingId: String(row.opening_id),
        ply: Number(row.ply) || 0,
        due: Date.parse(String(row.due)) || Date.now(),
        ease: Number(row.ease) || 2.3,
        streak: Number(row.streak) || 0,
      })),
      false,
    );
  }
}

export async function pushRemoteProgress(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const progress = readJson<ProgressEntry[]>(`${PROGRESS_BASE}.${userId}`, []);
  const reps = readJson<RepEntry[]>(`${REPS_BASE}.${userId}`, []);
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
        streak: row.streak,
      })),
    );
  }
}
