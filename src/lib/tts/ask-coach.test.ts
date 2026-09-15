import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldAutoSpeakOnScene, shouldOpenExplainOnCoachTap } from "./ask-coach";

describe("Ask Coach", () => {
  it("never auto-speaks a new scene — the board stays quiet until Ask Coach", () => {
    assert.equal(shouldAutoSpeakOnScene(), false);
  });

  it("opens the richer explain view on any tap — miss or book ply", () => {
    assert.equal(shouldOpenExplainOnCoachTap("fail"), true);
    assert.equal(shouldOpenExplainOnCoachTap("ok"), true);
    assert.equal(shouldOpenExplainOnCoachTap("why"), true);
    assert.equal(shouldOpenExplainOnCoachTap("hint"), true);
    assert.equal(shouldOpenExplainOnCoachTap("plan"), true);
  });
});
