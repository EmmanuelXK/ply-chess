import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { HOUR_MS } from "./ladder";
import {
  STUDY_MODES,
  introduceMove,
  listDueCards,
  markReviewed,
  parseStudyMode,
  setProgressUser,
} from "./schedule";

describe("study modes", () => {
  it("exposes Learn, Quiz, and Review", () => {
    assert.deepEqual(
      STUDY_MODES.map((mode) => mode.id),
      ["learn", "quiz", "review"],
    );
  });

  it("maps older links onto the three modes", () => {
    assert.equal(parseStudyMode("learn"), "learn");
    assert.equal(parseStudyMode("spine"), "learn");
    assert.equal(parseStudyMode("practice"), "learn");
    assert.equal(parseStudyMode("trial"), "learn");
    assert.equal(parseStudyMode("quiz"), "quiz");
    assert.equal(parseStudyMode("drill"), "quiz");
    assert.equal(parseStudyMode("traps"), "quiz");
    assert.equal(parseStudyMode("review"), "review");
    assert.equal(parseStudyMode("reps"), "review");
    assert.equal(parseStudyMode("progress"), "review");
    assert.equal(parseStudyMode(null), "learn");
  });
});

describe("saved reps", () => {
  const now = Date.UTC(2026, 9, 5, 12, 0, 0);
  const mem = new Map<string, string>();

  before(() => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem: (key: string) => mem.get(key) ?? null,
          setItem: (key: string, value: string) => {
            mem.set(key, value);
          },
          removeItem: (key: string) => {
            mem.delete(key);
          },
        },
      },
    });
    setProgressUser(null);
  });

  it("keeps a miss off the queue until 4 hours, then due at level 1", () => {
    mem.clear();
    markReviewed("london", 2, false, now);
    assert.equal(listDueCards("london", now + 1000).length, 0);
    const due = listDueCards("london", now + 4 * HOUR_MS);
    assert.equal(due.length, 1);
    assert.equal(due[0].level, 1);
    assert.equal(due[0].ply, 2);
  });

  it("does not reset a seen move when Learn shows it again", () => {
    mem.clear();
    markReviewed("london", 0, true, now);
    introduceMove("london", 0, now + 10);
    const due = listDueCards("london", now + 4 * HOUR_MS);
    assert.equal(due.length, 1);
    assert.equal(due[0].level, 1);
    assert.equal(due[0].due, now + 4 * HOUR_MS);
  });
});
