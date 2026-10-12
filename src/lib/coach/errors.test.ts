import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { coachFailureMessage, spentCount } from "@/lib/coach/errors";

describe("coach errors", () => {
  it("names credit and overload without spending a failed answer", () => {
    assert.equal(
      coachFailureMessage(400, "Your credit balance is too low to access the Anthropic API."),
      "Coach account out of credit",
    );
    assert.equal(coachFailureMessage(402, "payment required"), "Coach account out of credit");
    assert.equal(coachFailureMessage(429, "rate limit"), "Coach busy, try again");
    assert.equal(coachFailureMessage(529, "Overloaded"), "Coach busy, try again");
    assert.equal(coachFailureMessage(0, "coach-not-configured"), "Coach not connected yet");
    assert.equal(coachFailureMessage(500, "boom"), "Coach could not answer. Try again.");
    assert.equal(spentCount(4, true), 3);
    assert.equal(spentCount(4, false), 4);
  });
});
