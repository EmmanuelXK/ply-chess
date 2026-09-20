import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { voiceOnFromStored } from "./prefs";

describe("voiceOnFromStored", () => {
  it("defaults ON when prefs are unset", () => {
    assert.equal(voiceOnFromStored(null), true);
    assert.equal(voiceOnFromStored(""), true);
  });

  it("honors an explicit mute", () => {
    assert.equal(voiceOnFromStored("0"), false);
  });

  it("stays ON when stored as on", () => {
    assert.equal(voiceOnFromStored("1"), true);
  });
});
