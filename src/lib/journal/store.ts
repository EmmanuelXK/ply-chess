import type { SupabaseClient } from "@supabase/supabase-js";

export const NOTE_MAX = 180;
export const JOURNAL_CAP = 48;
export const JOURNAL_BASE = "opening-edge.journal.v1";

export interface JournalPin {
  id: string;
  createdAt: number;
  openingId: string;
  openingName: string;
  trapId: string | null;
  ply: number;
  fen: string;
  pgn: string;
  mode: string;
  coachKind: string;
  coachText: string;
  note: string;
}

export interface JournalDraft {
  openingId: string;
  openingName: string;
  trapId?: string | null;
  ply: number;
  fen: string;
  pgn: string;
  mode: string;
  coachKind?: string;
  coachText?: string;
  note?: string;
}

let journalUser: string | null = null;
let dirtyHandler: (() => void) | null = null;

export function setJournalUser(id: string | null): void {
  journalUser = id;
}

export function getJournalUser(): string | null {
  return journalUser;
}

export function setJournalDirtyHandler(fn: (() => void) | null): void {
  dirtyHandler = fn;
}

function storageKey(): string {
  return journalUser ? `${JOURNAL_BASE}.${journalUser}` : JOURNAL_BASE;
}

function readPins(): JournalPin[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<JournalPin>[];
    return Array.isArray(parsed) ? parsed.map(normalizePin).filter((row) => row.id) : [];
  } catch {
    return [];
  }
}

function writePins(rows: JournalPin[], remote = true): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(rows));
    if (remote) dirtyHandler?.();
  } catch {
    /* ignore */
  }
}

export function clipNote(note: string): string {
  return note.replace(/\s+/g, " ").trim().slice(0, NOTE_MAX);
}

export function pgnSnippet(moves: string[], cap = 10): string {
  return moves.slice(Math.max(0, moves.length - cap)).join(" ");
}

export function makePin(draft: JournalDraft, now = Date.now()): JournalPin {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `pin-${now}`;
  return normalizePin({
    id,
    createdAt: now,
    openingId: draft.openingId,
    openingName: draft.openingName,
    trapId: draft.trapId ?? null,
    ply: draft.ply,
    fen: draft.fen,
    pgn: draft.pgn,
    mode: draft.mode,
    coachKind: draft.coachKind ?? "",
    coachText: draft.coachText ?? "",
    note: clipNote(draft.note ?? ""),
  });
}

export function normalizePin(row: Partial<JournalPin>): JournalPin {
  const ply = Math.max(0, Math.floor(Number(row.ply) || 0));
  return {
    id: String(row.id ?? ""),
    createdAt: Number(row.createdAt) || Date.now(),
    openingId: String(row.openingId ?? ""),
    openingName: String(row.openingName ?? ""),
    trapId: row.trapId ? String(row.trapId) : null,
    ply,
    fen: String(row.fen ?? ""),
    pgn: String(row.pgn ?? ""),
    mode: String(row.mode ?? "learn"),
    coachKind: String(row.coachKind ?? ""),
    coachText: String(row.coachText ?? "").replace(/\s+/g, " ").trim(),
    note: clipNote(String(row.note ?? "")),
  };
}

export function pinHref(pin: JournalPin): string {
  const params = new URLSearchParams();
  const reps =
    pin.mode === "plan" || pin.mode === "analyze" || pin.mode === "progress"
      ? "learn"
      : pin.mode;
  if (reps && reps !== "learn") params.set("reps", reps);
  if (pin.ply > 0) params.set("ply", String(pin.ply));
  if (pin.trapId) params.set("trap", pin.trapId);
  const query = params.toString();
  return query ? `/drill/${pin.openingId}?${query}` : `/drill/${pin.openingId}`;
}

export function listPins(): JournalPin[] {
  return [...readPins()].sort((a, b) => b.createdAt - a.createdAt);
}

export function addPin(draft: JournalDraft): JournalPin {
  const pin = makePin(draft);
  const next = [pin, ...readPins().filter((row) => row.id !== pin.id)].slice(
    0,
    JOURNAL_CAP,
  );
  writePins(next);
  return pin;
}

export function updatePinNote(id: string, note: string): void {
  const next = readPins().map((row) =>
    row.id === id ? { ...row, note: clipNote(note) } : row,
  );
  writePins(next);
}

export function removePin(id: string): void {
  writePins(readPins().filter((row) => row.id !== id));
}

export function adoptAnonJournalIfNeeded(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    const named = `${JOURNAL_BASE}.${userId}`;
    if (!window.localStorage.getItem(named)) {
      const anon = window.localStorage.getItem(JOURNAL_BASE);
      if (anon) window.localStorage.setItem(named, anon);
    }
  } catch {
    /* ignore */
  }
}

export async function pullRemoteJournal(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("journal_pins")
    .select(
      "id, opening_id, opening_name, trap_id, ply, fen, pgn, mode, coach_kind, coach_text, note, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !Array.isArray(data) || data.length === 0) return;
  const rows = data.map((row) =>
    normalizePin({
      id: String(row.id),
      createdAt: Date.parse(String(row.created_at)) || Date.now(),
      openingId: String(row.opening_id),
      openingName: String(row.opening_name ?? ""),
      trapId: row.trap_id ? String(row.trap_id) : null,
      ply: Number(row.ply) || 0,
      fen: String(row.fen ?? ""),
      pgn: String(row.pgn ?? ""),
      mode: String(row.mode ?? "learn"),
      coachKind: String(row.coach_kind ?? ""),
      coachText: String(row.coach_text ?? ""),
      note: String(row.note ?? ""),
    }),
  );
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${JOURNAL_BASE}.${userId}`, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

export async function pushRemoteJournal(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const prev = journalUser;
  journalUser = userId;
  const rows = readPins();
  journalUser = prev;
  const { data: remote } = await supabase
    .from("journal_pins")
    .select("id")
    .eq("user_id", userId);
  const localIds = new Set(rows.map((row) => row.id));
  const stale = (remote ?? [])
    .map((row) => String(row.id))
    .filter((id) => !localIds.has(id));
  if (stale.length) {
    await supabase.from("journal_pins").delete().eq("user_id", userId).in("id", stale);
  }
  if (!rows.length) return;
  await supabase.from("journal_pins").upsert(
    rows.map((row) => ({
      id: row.id,
      user_id: userId,
      opening_id: row.openingId,
      opening_name: row.openingName,
      trap_id: row.trapId,
      ply: row.ply,
      fen: row.fen,
      pgn: row.pgn,
      mode: row.mode,
      coach_kind: row.coachKind,
      coach_text: row.coachText,
      note: row.note,
      created_at: new Date(row.createdAt).toISOString(),
      updated_at: new Date().toISOString(),
    })),
  );
}

export async function deleteRemotePin(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<void> {
  await supabase.from("journal_pins").delete().eq("user_id", userId).eq("id", id);
}

export function pinLabel(pin: JournalPin): string {
  const move = Math.max(1, Math.ceil(pin.ply / 2));
  const mode =
    pin.mode === "trial"
      ? "Time Trial"
      : pin.mode === "plan"
        ? "Plan"
        : pin.mode[0]?.toUpperCase() + pin.mode.slice(1);
  return `${pin.openingName} · ${mode} · ${move}`;
}
