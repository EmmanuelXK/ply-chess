import assert from "node:assert/strict";
import { test } from "node:test";

import { startOfTomorrow, calendarDaysUntil, formatDueLabel } from "./dates";
import { enrollNewCard, reviewCard } from "./fsrs";
import { scoreToGrade } from "./grade";
import {
  collectPin,
  dueCards,
  dueCount,
  enrollLearn,
  lineStatus,
  loadJournal,
  reviewTrain,
  STORAGE_KEY,
} from "./store";

test("score map: 100% first review is Good, not Easy", () => {
  assert.equal(scoreToGrade(1, { hintsUsed: 0, priorReps: 0 }), "good");
  assert.equal(scoreToGrade(1, { hintsUsed: 0, priorReps: 1 }), "easy");
  assert.equal(scoreToGrade(1, { hintsUsed: 1, priorReps: 1 }), "good");
  assert.equal(scoreToGrade(0.7, { hintsUsed: 0, priorReps: 0 }), "hard");
  assert.equal(scoreToGrade(0.69, { hintsUsed: 0, priorReps: 0 }), "again");
});

test("learn enroll is due next local day with zero reps", () => {
  const now = new Date(2026, 8, 20, 22, 15, 0);
  const card = enrollNewCard(now);
  assert.equal(card.reps, 0);
  assert.equal(card.due.getTime(), startOfTomorrow(now).getTime());
  assert.equal(calendarDaysUntil(card.due, now), 1);
  assert.equal(formatDueLabel(card.due, now), "Tomorrow");
});

test("Again schedules sooner than Good", () => {
  const now = new Date("2026-09-21T15:00:00Z");
  const again = reviewCard(null, 0.2, { hintsUsed: 0, now });
  const good = reviewCard(null, 1, { hintsUsed: 0, now });
  assert.equal(again.grade, "again");
  assert.equal(good.grade, "good");
  assert.ok(
    again.card.due.getTime() < good.card.due.getTime(),
    "fail should due before a clean recall",
  );
  const againDays =
    (again.card.due.getTime() - now.getTime()) / 86_400_000;
  assert.ok(againDays >= 0.9 && againDays < 2, `again days ${againDays}`);
});

function memoryStorage() {
  const data = new Map<string, string>();
  const storage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
    removeItem: (k: string) => {
      data.delete(k);
    },
    clear: () => data.clear(),
    key: (i: number) => [...data.keys()][i] ?? null,
    get length() {
      return data.size;
    },
  };
  Object.defineProperty(globalThis, "window", {
    value: { localStorage: storage },
    configurable: true,
    writable: true,
  });
  storage.clear();
}

test("journal persist: learn then train updates due and survives reload", () => {
  memoryStorage();
  const now = new Date(2026, 8, 20, 10, 0, 0);
  const learned = enrollLearn("london", now);
  assert.ok(learned.learnCompletedAt);
  assert.equal(learned.fsrs.reps, 0);
  assert.equal(dueCount(loadJournal(), now), 0);
  assert.equal(dueCount(loadJournal(), startOfTomorrow(now)), 1);

  const snap1 = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!) as {
    cards: Record<string, { learnCompletedAt: string }>;
  };
  assert.ok(snap1.cards.london.learnCompletedAt);

  const nextDay = new Date(2026, 8, 21, 10, 0, 0);
  const { card, grade } = reviewTrain("london", {
    correct: 30,
    total: 30,
    hintsUsed: 0,
    now: nextDay,
  });
  assert.equal(grade, "good");
  assert.equal(card.lastScore, 1);
  assert.ok(new Date(card.fsrs.due).getTime() > nextDay.getTime());
  assert.equal(lineStatus(card, nextDay).kind, "waiting");
});

test("due queue sorts fragile first", () => {
  memoryStorage();
  const now = new Date(2026, 8, 21, 12, 0, 0);
  enrollLearn("london", new Date(2026, 8, 20));
  enrollLearn("pirc", new Date(2026, 8, 20));
  reviewTrain("london", {
    correct: 30,
    total: 30,
    hintsUsed: 0,
    now,
  });
  reviewTrain("pirc", {
    correct: 5,
    total: 30,
    hintsUsed: 0,
    now,
  });
  const later = new Date(2026, 8, 23, 12, 0, 0);
  const due = dueCards(
    JSON.parse(window.localStorage.getItem(STORAGE_KEY)!),
    later,
  );
  assert.ok(due.length >= 1);
  assert.equal(due[0].variationId, "pirc");
});

test("pins collect once per ply", () => {
  memoryStorage();
  collectPin({
    openingId: "london",
    afterPly: 16,
    label: "at the e5 pin…",
    now: new Date(2026, 8, 20),
  });
  collectPin({
    openingId: "london",
    afterPly: 16,
    label: "at the e5 pin…",
    now: new Date(2026, 8, 21),
  });
  const snap = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
  assert.equal(snap.pins.length, 1);
});
