import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openings } from "../openings";
import {
  FOCUS_BEDS,
  FOCUS_DRONE_GAIN,
  FOCUS_DUCK_RATIO,
  FOCUS_FADE_IN_SEC,
  FOCUS_FIFTH_GAIN,
  FOCUS_MASTER_GAIN,
  FOCUS_NOISE_SCALE,
  FOCUS_PULSE_DEPTH,
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

  it("is mixed loud enough for phones, still a calm room", () => {
    assert.ok(FOCUS_MASTER_GAIN > 0.18 && FOCUS_MASTER_GAIN < 0.4);
    assert.ok(FOCUS_DRONE_GAIN > 0.08 && FOCUS_DRONE_GAIN < 0.22);
    assert.ok(FOCUS_FIFTH_GAIN > 0.02 && FOCUS_FIFTH_GAIN < 0.1);
    assert.ok(FOCUS_NOISE_SCALE > 0.28 && FOCUS_NOISE_SCALE < 0.55);
    assert.ok(FOCUS_PULSE_DEPTH > 0.02 && FOCUS_PULSE_DEPTH < 0.08);
    assert.ok(FOCUS_FADE_IN_SEC > 0.2 && FOCUS_FADE_IN_SEC < 1.2);
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
