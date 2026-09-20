import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { voiceOnFromStored } from "./prefs";

describe("voiceOnFromStored", () => {
  it("defaults silent when prefs are unset", () => {
    assert.equal(voiceOnFromStored(null), false);
    assert.equal(voiceOnFromStored(""), false);
  });

  it("stays off unless explicitly enabled", () => {
    assert.equal(voiceOnFromStored("0"), false);
    assert.equal(voiceOnFromStored("1"), true);
  });
});
