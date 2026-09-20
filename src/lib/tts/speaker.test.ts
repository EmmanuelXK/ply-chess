import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { COACH_SPEAKER, toCoachSpeaker } from "./types";

describe("male coach speaker", () => {
  it("remaps every speaker id to Aldric", () => {
    assert.equal(toCoachSpeaker("kael"), COACH_SPEAKER);
    assert.equal(toCoachSpeaker("rhea"), COACH_SPEAKER);
    assert.equal(toCoachSpeaker("lena"), COACH_SPEAKER);
    assert.equal(toCoachSpeaker("soren"), COACH_SPEAKER);
    assert.equal(toCoachSpeaker("aldric"), COACH_SPEAKER);
  });
});
