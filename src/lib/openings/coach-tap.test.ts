import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { textForCoachTap } from "./coach";

describe("textForCoachTap", () => {
  it("returns the current coach line when one is showing", () => {
    assert.equal(
      textForCoachTap("Hold e5. That's the wake.", "older beat"),
      "Hold e5. That's the wake.",
    );
  });

  it("replays the last beat on a quiet ply", () => {
    assert.equal(textForCoachTap("", "Hold e5. That's the wake."), "Hold e5. That's the wake.");
    assert.equal(textForCoachTap("   ", "  last beat  "), "last beat");
  });

  it("returns null when there is nothing to replay", () => {
    assert.equal(textForCoachTap("", ""), null);
  });
});
