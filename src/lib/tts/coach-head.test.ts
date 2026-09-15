import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { coachHeadPresence } from "./coach-head";

describe("Ask Coach board mark", () => {
  it("stays hidden until Ask Coach opens a session", () => {
    assert.equal(
      coachHeadPresence({ sessionOpen: false, speaking: false }),
      "hidden",
    );
    assert.equal(
      coachHeadPresence({ sessionOpen: false, speaking: true }),
      "hidden",
    );
  });

  it("idles on the board while the explain sheet is open but silent", () => {
    assert.equal(
      coachHeadPresence({ sessionOpen: true, speaking: false }),
      "idle",
    );
  });

  it("runs the speak-wave only while TTS is live", () => {
    assert.equal(
      coachHeadPresence({ sessionOpen: true, speaking: true }),
      "speak",
    );
  });
});
