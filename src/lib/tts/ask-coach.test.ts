import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldAutoSpeakOnScene } from "./ask-coach";

describe("Ask Coach", () => {
  it("never auto-speaks a new scene — the board stays quiet until Ask Coach", () => {
    assert.equal(shouldAutoSpeakOnScene(), false);
  });
});
