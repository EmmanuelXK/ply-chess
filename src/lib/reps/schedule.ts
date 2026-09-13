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

const REPS_KEY = "opening-edge.reps.v1";
const PROGRESS_KEY = "opening-edge.progress.v1";

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

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
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

export function markReviewed(openingId: string, ply: number, ok: boolean): void {
  const rows = readJson<RepEntry[]>(REPS_KEY, []);
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
  writeJson(REPS_KEY, rows);
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
  const rows = readJson<RepEntry[]>(REPS_KEY, []).filter((r) => r.openingId === openingId);
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
  const rows = readJson<RepEntry[]>(REPS_KEY, []).filter(
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
  const rows = readJson<ProgressEntry[]>(PROGRESS_KEY, []);
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
  writeJson(PROGRESS_KEY, rows);
}

export function progressFor(openingId: string): { seen: number; best: number } {
  const row = readJson<ProgressEntry[]>(PROGRESS_KEY, []).find((r) => r.openingId === openingId);
  return { seen: row?.seen ?? 0, best: row?.best ?? 0 };
}

export function dueCount(openingId: string): number {
  const now = Date.now();
  return readJson<RepEntry[]>(REPS_KEY, []).filter(
    (r) => r.openingId === openingId && r.due <= now,
  ).length;
}
