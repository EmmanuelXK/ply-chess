import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DAILY_QUEUE_CAP,
  DAILY_QUEUE_MINUTES,
  HOUR_MS,
  LADDER_HOURS,
  gradeCard,
  introduceCard,
  queueMinutes,
  takeDailyQueue,
  type RepCard,
} from "./ladder";

const NOW = Date.UTC(2026, 9, 5, 12, 0, 0);

describe("spacing ladder", () => {
  it("uses a 4h → 6 month ladder and a 12 minute queue cap", () => {
    assert.deepEqual(LADDER_HOURS, [4, 24, 72, 168, 336, 720, 2160, 4320]);
    assert.equal(DAILY_QUEUE_MINUTES, 12);
    assert.equal(DAILY_QUEUE_CAP, 40);
    assert.equal(queueMinutes(40), 12);
    assert.equal(queueMinutes(1), 1);
    assert.equal(queueMinutes(0), 0);
  });

  it("schedules a miss for 4 hours at level 1", () => {
    const card = gradeCard(
      { openingId: "london", ply: 4, level: 6, due: NOW - 1000 },
      "london",
      4,
      false,
      NOW,
    );
    assert.equal(card.level, 1);
    assert.equal(card.due, NOW + 4 * HOUR_MS);
  });

  it("climbs one step on a hit and stays capped", () => {
    const first = gradeCard(undefined, "london", 0, true, NOW);
    assert.equal(first.level, 1);
    assert.equal(first.due, NOW + 4 * HOUR_MS);

    const second = gradeCard(first, "london", 0, true, NOW);
    assert.equal(second.level, 2);
    assert.equal(second.due, NOW + 24 * HOUR_MS);

    const mature = gradeCard(
      { openingId: "london", ply: 0, level: LADDER_HOURS.length, due: NOW },
      "london",
      0,
      true,
      NOW,
    );
    assert.equal(mature.level, LADDER_HOURS.length);
    assert.equal(mature.due, NOW + LADDER_HOURS[LADDER_HOURS.length - 1] * HOUR_MS);
  });

  it("introduces an unseen move and leaves a live card alone", () => {
    const fresh = introduceCard(undefined, "alapin", 2, NOW);
    assert.ok(fresh);
    assert.equal(fresh?.level, 1);
    assert.equal(fresh?.due, NOW + 4 * HOUR_MS);

    const kept = introduceCard(
      { openingId: "alapin", ply: 2, level: 4, due: NOW + 99 },
      "alapin",
      2,
      NOW,
    );
    assert.equal(kept, null);
  });

  it("keeps the daily queue to due moves, oldest first", () => {
    const cards: RepCard[] = [
      { openingId: "b", ply: 1, level: 2, due: NOW - 50 },
      { openingId: "a", ply: 3, level: 1, due: NOW - 500 },
      { openingId: "a", ply: 1, level: 1, due: NOW + 5000 },
      { openingId: "a", ply: 0, level: 0, due: NOW - 9999 },
      { openingId: "c", ply: 0, level: 1, due: NOW - 10 },
    ];
    const extra = Array.from({ length: 45 }, (_, i) => ({
      openingId: "z",
      ply: i,
      level: 1,
      due: NOW - 1,
    }));
    const queue = takeDailyQueue([...cards, ...extra], NOW);
    assert.equal(queue.length, DAILY_QUEUE_CAP);
    assert.equal(queue[0].openingId, "a");
    assert.equal(queue[0].ply, 3);
    assert.equal(queue[1].openingId, "b");
    assert.ok(queue.every((card) => card.level > 0 && card.due <= NOW));
    assert.ok(!queue.some((card) => card.ply === 1 && card.openingId === "a" && card.due > NOW));
  });
});
