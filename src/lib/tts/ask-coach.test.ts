import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldAutoSpeakOnScene, shouldOpenExplainOnCoachTap } from "./ask-coach";

describe("Ask Coach", () => {
  it("never auto-speaks a new scene — the board stays quiet until Ask Coach", () => {
    assert.equal(shouldAutoSpeakOnScene(), false);
  });

  it("opens the richer explain view only on a miss", () => {
    assert.equal(shouldOpenExplainOnCoachTap("fail"), true);
    assert.equal(shouldOpenExplainOnCoachTap("ok"), false);
    assert.equal(shouldOpenExplainOnCoachTap("why"), false);
  });
});
