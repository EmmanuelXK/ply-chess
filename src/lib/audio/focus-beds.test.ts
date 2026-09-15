import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openings } from "../openings";
import {
  FOCUS_BEDS,
  FOCUS_DUCK_RATIO,
  focusBedFor,
  focusBedSignature,
} from "./focus-beds";
import { musicOnFromStored } from "./prefs";

describe("focus beds", () => {
  it("maps every playable system to a distinct bed", () => {
    const seen = new Set<string>();
    for (const opening of openings) {
      const bed = focusBedFor(opening.id);
      assert.equal(bed.id, opening.id, `missing bed for ${opening.id}`);
      const sig = focusBedSignature(bed);
      assert.equal(seen.has(sig), false, `duplicate texture ${opening.id}: ${sig}`);
      seen.add(sig);
      assert.ok(bed.room.trim().length >= 4, opening.id);
      assert.ok(bed.why.trim().length >= 12, opening.id);
      assert.ok(bed.droneHz >= 30 && bed.droneHz <= 90, opening.id);
    }
    assert.equal(Object.keys(FOCUS_BEDS).length, openings.length);
  });

  it("ducks under coach speech instead of competing", () => {
    assert.ok(FOCUS_DUCK_RATIO > 0 && FOCUS_DUCK_RATIO < 0.3);
  });
});

describe("focus music pref", () => {
  it("defaults on so the palace bed plays until muted", () => {
    assert.equal(musicOnFromStored(null), true);
    assert.equal(musicOnFromStored(""), true);
    assert.equal(musicOnFromStored("1"), true);
    assert.equal(musicOnFromStored("0"), false);
  });
});
