import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldAutoSpeakOnScene } from "./ask-coach";

describe("Ask Coach", () => {
  it("never auto-speaks — Learn stays silent", () => {
    assert.equal(shouldAutoSpeakOnScene(), false);
  });
});
