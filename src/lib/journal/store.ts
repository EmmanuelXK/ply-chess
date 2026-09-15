import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildGamePgn,
  isGameResult,
  type GameResult,
} from "@/lib/chess/game";
import { START_FEN } from "@/lib/chess/line";

export const NOTE_MAX = 180;
export const JOURNAL_CAP = 48;
export const JOURNAL_BASE = "opening-edge.journal.v1";

export type JournalKind = "game" | "moment";

export interface JournalPin {
  id: string;
  kind: JournalKind;
  createdAt: number;
  openingId: string;
  openingName: string;
  trapId: string | null;
  ply: number;
  fen: string;
  startFen: string;
  pgn: string;
  moves: string[];
  result: GameResult;
  mode: string;
  coachKind: string;
  coachText: string;
  note: string;
}

export interface JournalGameDraft {
  openingId: string;
  openingName: string;
  trapId?: string | null;
  startPly: number;
  startFen: string;
  moves: string[];
  pgn?: string;
  result: GameResult;
  mode: string;
  note?: string;
  white?: string;
  black?: string;
}

/** @deprecated moment-pins are hidden. Prefer JournalGameDraft. */
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

function parseMoves(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((item) => String(item)).filter(Boolean);
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item)).filter(Boolean);
      }
    } catch {
      return trimmed.split(/\s+/).filter(Boolean);
    }
  }
  return [];
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

export function isJournalGame(pin: JournalPin): boolean {
  return pin.kind === "game";
}

export function makeGame(draft: JournalGameDraft, now = Date.now()): JournalPin {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `game-${now}`;
  const startFen = draft.startFen || START_FEN;
  const pgn =
    draft.pgn?.trim() ||
    buildGamePgn({
      startFen,
      moves: draft.moves,
      white: draft.white ?? "You",
      black: draft.black ?? "Coach",
      result: draft.result,
      event: `${draft.openingName} spar`,
      date: new Date(now),
    });
  return normalizePin({
    id,
    kind: "game",
    createdAt: now,
    openingId: draft.openingId,
    openingName: draft.openingName,
    trapId: draft.trapId ?? null,
    ply: draft.startPly,
    fen: startFen,
    startFen,
    pgn,
    moves: draft.moves,
    result: draft.result,
    mode: draft.mode,
    note: clipNote(draft.note ?? ""),
  });
}

export function makePin(draft: JournalDraft, now = Date.now()): JournalPin {
  return makeGame(
    {
      openingId: draft.openingId,
      openingName: draft.openingName,
      trapId: draft.trapId,
      startPly: draft.ply,
      startFen: draft.fen,
      moves: parseMoves(draft.pgn),
      pgn: draft.pgn,
      result: "*",
      mode: draft.mode,
      note: draft.note,
    },
    now,
  );
}

export function normalizePin(row: Partial<JournalPin> & Record<string, unknown>): JournalPin {
  const ply = Math.max(0, Math.floor(Number(row.ply) || 0));
  const fen = String(row.fen ?? row.startFen ?? "");
  const startFen = String(row.startFen ?? fen);
  const moves = parseMoves(row.moves);
  const resultRaw = String(row.result ?? "*");
  const result: GameResult = isGameResult(resultRaw) ? resultRaw : "*";
  const kind: JournalKind = row.kind === "game" || moves.length > 0 ? "game" : "moment";
  return {
    id: String(row.id ?? ""),
    kind,
    createdAt: Number(row.createdAt) || Date.now(),
    openingId: String(row.openingId ?? ""),
    openingName: String(row.openingName ?? ""),
    trapId: row.trapId ? String(row.trapId) : null,
    ply,
    fen: startFen || fen,
    startFen: startFen || fen,
    pgn: String(row.pgn ?? ""),
    moves,
    result,
    mode: String(row.mode ?? "learn"),
    coachKind: String(row.coachKind ?? ""),
    coachText: String(row.coachText ?? "").replace(/\s+/g, " ").trim(),
    note: clipNote(String(row.note ?? "")),
  };
}

export function pinHref(pin: JournalPin): string {
  const params = new URLSearchParams();
  const reps =
    pin.mode === "plan" ||
    pin.mode === "analyze" ||
    pin.mode === "progress" ||
    pin.mode === "spar"
      ? "learn"
      : pin.mode;
  if (reps && reps !== "learn") params.set("reps", reps);
  if (pin.ply > 0) params.set("ply", String(pin.ply));
  if (pin.trapId) params.set("trap", pin.trapId);
  if (isJournalGame(pin)) params.set("memory", pin.id);
  const query = params.toString();
  return query ? `/drill/${pin.openingId}?${query}` : `/drill/${pin.openingId}`;
}

export function listPins(): JournalPin[] {
  return [...readPins()].sort((a, b) => b.createdAt - a.createdAt);
}

export function listGames(): JournalPin[] {
  return listPins().filter(isJournalGame);
}

export function listGamesForLine(openingId: string, trapId: string | null): JournalPin[] {
  const trap = trapId ?? null;
  return listGames().filter(
    (row) => row.openingId === openingId && (row.trapId ?? null) === trap,
  );
}

export function addGame(draft: JournalGameDraft): JournalPin {
  const pin = makeGame(draft);
  const next = [pin, ...readPins().filter((row) => row.id !== pin.id)].slice(
    0,
    JOURNAL_CAP,
  );
  writePins(next);
  return pin;
}

export function addPin(draft: JournalDraft): JournalPin {
  return addGame({
    openingId: draft.openingId,
    openingName: draft.openingName,
    trapId: draft.trapId,
    startPly: draft.ply,
    startFen: draft.fen,
    moves: parseMoves(draft.pgn),
    pgn: draft.pgn,
    result: "*",
    mode: draft.mode,
    note: draft.note,
  });
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
      "id, opening_id, opening_name, trap_id, ply, fen, pgn, mode, coach_kind, coach_text, note, created_at, kind, start_fen, result, moves",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !Array.isArray(data) || data.length === 0) return;
  const rows = data.map((row) => {
    const resultRaw = String(row.result ?? "*");
    return normalizePin({
      id: String(row.id),
      kind: row.kind === "game" ? "game" : "moment",
      createdAt: Date.parse(String(row.created_at)) || Date.now(),
      openingId: String(row.opening_id),
      openingName: String(row.opening_name ?? ""),
      trapId: row.trap_id ? String(row.trap_id) : null,
      ply: Number(row.ply) || 0,
      fen: String(row.start_fen || row.fen || ""),
      startFen: String(row.start_fen || row.fen || ""),
      pgn: String(row.pgn ?? ""),
      moves: parseMoves(row.moves),
      result: isGameResult(resultRaw) ? resultRaw : "*",
      mode: String(row.mode ?? "learn"),
      coachKind: String(row.coach_kind ?? ""),
      coachText: String(row.coach_text ?? ""),
      note: String(row.note ?? ""),
    });
  });
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
      fen: row.startFen || row.fen,
      pgn: row.pgn,
      mode: row.mode,
      coach_kind: row.coachKind,
      coach_text: row.coachText,
      note: row.note,
      kind: row.kind,
      start_fen: row.startFen || row.fen,
      result: row.result,
      moves: row.moves,
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
  if (isJournalGame(pin)) {
    const when = new Date(pin.createdAt);
    const date = Number.isNaN(when.getTime())
      ? ""
      : when.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `${pin.openingName} · ${pin.result}${date ? ` · ${date}` : ""}`;
  }
  const move = pin.ply <= 0 ? "Start" : String(Math.max(1, Math.ceil(pin.ply / 2)));
  const mode =
    pin.mode === "trial"
      ? "Time Trial"
      : pin.mode === "plan"
        ? "Plan"
        : pin.mode[0]?.toUpperCase() + pin.mode.slice(1);
  return `${pin.openingName} · ${mode} · ${move}`;
}
