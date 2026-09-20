import { isDueAt } from "./dates";
import { enrollNewCard, reviewCard, toStored } from "./fsrs";
import type {
  JournalPin,
  JournalSnapshot,
  LineStatus,
  MemoryCard,
  MemorySession,
} from "./types";
import { formatDueLabel } from "./dates";

export const STORAGE_KEY = "opening-edge.journal.v1";

export const EMPTY_JOURNAL: JournalSnapshot = {
  version: 1,
  cards: {},
  pins: [],
  lastSession: null,
};

const listeners = new Set<() => void>();

let cachedRaw: string | null | undefined;
let cachedSnap: JournalSnapshot = EMPTY_JOURNAL;

export function emptyJournal(): JournalSnapshot {
  return EMPTY_JOURNAL;
}

export function loadJournal(): JournalSnapshot {
  if (typeof window === "undefined") return EMPTY_JOURNAL;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedSnap;
    cachedRaw = raw;
    if (!raw) {
      cachedSnap = EMPTY_JOURNAL;
      return cachedSnap;
    }
    const parsed = JSON.parse(raw) as Partial<JournalSnapshot>;
    if (parsed.version !== 1 || !parsed.cards) {
      cachedSnap = EMPTY_JOURNAL;
      return cachedSnap;
    }
    cachedSnap = {
      version: 1,
      cards: parsed.cards,
      pins: parsed.pins ?? [],
      lastSession: parsed.lastSession ?? null,
    };
    return cachedSnap;
  } catch {
    cachedRaw = null;
    cachedSnap = EMPTY_JOURNAL;
    return cachedSnap;
  }
}

function saveJournal(snap: JournalSnapshot): JournalSnapshot {
  const raw = JSON.stringify(snap);
  cachedRaw = raw;
  cachedSnap = snap;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, raw);
  }
  for (const fn of listeners) fn();
  return snap;
}

export function subscribeJournal(fn: () => void): () => void {
  listeners.add(fn);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cachedRaw = undefined;
    fn();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(fn);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function mutate(
  fn: (snap: JournalSnapshot) => JournalSnapshot,
): JournalSnapshot {
  return saveJournal(fn(loadJournal()));
}

function stampCard(
  variationId: string,
  now: Date,
  patch: Partial<MemoryCard> & { fsrs: MemoryCard["fsrs"] },
  existing?: MemoryCard,
): MemoryCard {
  return {
    learnCompletedAt: null,
    lastGrade: null,
    lastScore: null,
    lastCorrect: null,
    lastTotal: null,
    lastHintsUsed: null,
    lastReviewedAt: null,
    ...existing,
    ...patch,
    id: variationId,
    variationId,
    updatedAt: now.toISOString(),
  };
}

/** Completing Learn enrolls (or stamps learnCompletedAt) without a recall grade. */
export function enrollLearn(
  variationId: string,
  now: Date = new Date(),
): MemoryCard {
  const snap = mutate((current) => {
    const existing = current.cards[variationId];
    const fsrs = existing?.fsrs ?? toStored(enrollNewCard(now));
    const card = stampCard(
      variationId,
      now,
      {
        fsrs,
        learnCompletedAt: existing?.learnCompletedAt ?? now.toISOString(),
      },
      existing,
    );
    return {
      ...current,
      cards: { ...current.cards, [variationId]: card },
      lastSession: {
        id: sessionId(now),
        startedAt: now.toISOString(),
        endedAt: now.toISOString(),
        mode: "learn",
        variationId,
        firstAttemptCorrect: 0,
        totalUserPlies: 0,
        hintsUsed: 0,
      },
    };
  });
  return snap.cards[variationId];
}

export function reviewTrain(
  variationId: string,
  input: {
    correct: number;
    total: number;
    hintsUsed: number;
    now?: Date;
  },
): { card: MemoryCard; grade: NonNullable<MemoryCard["lastGrade"]> } {
  const now = input.now ?? new Date();
  const total = Math.max(1, input.total);
  const score = Math.min(1, Math.max(0, input.correct / total));
  const snap = mutate((current) => {
    const existing = current.cards[variationId];
    const { card: nextFsrs, grade } = reviewCard(existing?.fsrs ?? null, score, {
      hintsUsed: input.hintsUsed,
      now,
    });
    const card = stampCard(
      variationId,
      now,
      {
        fsrs: toStored(nextFsrs),
        lastGrade: grade,
        lastScore: score,
        lastCorrect: input.correct,
        lastTotal: total,
        lastHintsUsed: input.hintsUsed,
        lastReviewedAt: now.toISOString(),
      },
      existing,
    );
    const session: MemorySession = {
      id: sessionId(now),
      startedAt: now.toISOString(),
      endedAt: now.toISOString(),
      mode: "train",
      variationId,
      firstAttemptCorrect: input.correct,
      totalUserPlies: total,
      grade,
      hintsUsed: input.hintsUsed,
    };
    return {
      ...current,
      cards: { ...current.cards, [variationId]: card },
      lastSession: session,
    };
  });
  const card = snap.cards[variationId];
  return { card, grade: card.lastGrade! };
}

export function collectPin(input: {
  openingId: string;
  afterPly: number;
  label: string;
  now?: Date;
}): JournalPin {
  const now = input.now ?? new Date();
  const id = `${input.openingId}:${input.afterPly}`;
  const snap = mutate((current) => {
    if (current.pins.some((p) => p.id === id)) return current;
    const pin: JournalPin = {
      id,
      openingId: input.openingId,
      afterPly: input.afterPly,
      label: input.label,
      collectedAt: now.toISOString(),
    };
    return { ...current, pins: [...current.pins, pin] };
  });
  return snap.pins.find((p) => p.id === id)!;
}

export function dueCards(
  snap: JournalSnapshot,
  now: Date = new Date(),
): MemoryCard[] {
  return Object.values(snap.cards)
    .filter((card) => isScheduled(card) && isDueAt(new Date(card.fsrs.due), now))
    .sort((a, b) => {
      const aFail = fragileScore(a);
      const bFail = fragileScore(b);
      if (aFail !== bFail) return bFail - aFail;
      return new Date(a.fsrs.due).getTime() - new Date(b.fsrs.due).getTime();
    });
}

export function dueCount(
  snap: JournalSnapshot,
  now: Date = new Date(),
): number {
  return dueCards(snap, now).length;
}

export function lineStatus(
  card: MemoryCard | undefined,
  now: Date,
): LineStatus {
  if (!card || !isScheduled(card)) return { kind: "new" };
  const due = new Date(card.fsrs.due);
  if (isDueAt(due, now)) return { kind: "due" };
  return {
    kind: "waiting",
    dueAt: card.fsrs.due,
    label: formatDueLabel(due, now),
  };
}

function isScheduled(card: MemoryCard): boolean {
  return Boolean(card.learnCompletedAt) || card.fsrs.reps > 0;
}

function fragileScore(card: MemoryCard): number {
  let n = card.fsrs.lapses * 2;
  if (card.lastGrade === "again") n += 3;
  if (card.lastGrade === "hard") n += 1;
  return n;
}

function sessionId(now: Date): string {
  return `ses-${now.getTime().toString(36)}`;
}
