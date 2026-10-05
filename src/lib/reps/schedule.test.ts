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
  it("exposes Learn only", () => {
    assert.deepEqual(
      STUDY_MODES.map((mode) => mode.id),
      ["learn"],
    );
  });

  it("folds older quiz and review links into Learn", () => {
    assert.equal(parseStudyMode("learn"), "learn");
    assert.equal(parseStudyMode("spine"), "learn");
    assert.equal(parseStudyMode("practice"), "learn");
    assert.equal(parseStudyMode("trial"), "learn");
    assert.equal(parseStudyMode("quiz"), "learn");
    assert.equal(parseStudyMode("drill"), "learn");
    assert.equal(parseStudyMode("traps"), "learn");
    assert.equal(parseStudyMode("review"), "learn");
    assert.equal(parseStudyMode("reps"), "learn");
    assert.equal(parseStudyMode("progress"), "learn");
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
