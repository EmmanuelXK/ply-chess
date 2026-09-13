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

export function duePly(openingId: string, maxPly: number): number {
  const rows = readJson<RepEntry[]>(REPS_KEY, []).filter((r) => r.openingId === openingId);
  const now = Date.now();
  const due = rows
    .filter((r) => r.due <= now && r.ply < maxPly)
    .sort((a, b) => a.ply - b.ply);
  return due[0]?.ply ?? 0;
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
