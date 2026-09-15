import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  modeSwitchCopy,
  shouldPromptModeSwitch,
  shouldResumeAfterExplain,
} from "./mode-switch";

describe("mode switch preview", () => {
  it("prompts whenever the destination differs — never a silent jump", () => {
    assert.equal(shouldPromptModeSwitch("learn", "reps"), true);
    assert.equal(shouldPromptModeSwitch("learn", "practice"), true);
    assert.equal(shouldPromptModeSwitch("learn", "drill"), true);
    assert.equal(shouldPromptModeSwitch("learn", "trial"), true);
    assert.equal(shouldPromptModeSwitch("learn", "analyze"), true);
    assert.equal(shouldPromptModeSwitch("learn", "plan"), true);
    assert.equal(shouldPromptModeSwitch("learn", "spar"), true);
    assert.equal(shouldPromptModeSwitch("spar", "learn"), true);
    assert.equal(shouldPromptModeSwitch("plan", "learn"), true);
    assert.equal(shouldPromptModeSwitch("reps", "analyze"), true);
  });

  it("skips the popup only when already in that mode", () => {
    assert.equal(shouldPromptModeSwitch("learn", "learn"), false);
    assert.equal(shouldPromptModeSwitch("analyze", "analyze"), false);
    assert.equal(shouldPromptModeSwitch("plan", "plan"), false);
    assert.equal(shouldPromptModeSwitch("spar", "spar"), false);
  });

  it("resumes the same plan / mode after Ask Coach — no auto Learn→Analyze", () => {
    assert.equal(shouldResumeAfterExplain(), true);
  });

  it("names the destination for the popup viewer", () => {
    assert.equal(modeSwitchCopy("reps").title, "Reps");
    assert.match(modeSwitchCopy("reps").confirm, /Reps/);
    assert.equal(modeSwitchCopy("analyze").confirm, "Open Analyze");
    assert.equal(modeSwitchCopy("plan").confirm, "Enter Plan");
    assert.equal(modeSwitchCopy("spar").confirm, "Spar from here");
    assert.match(modeSwitchCopy("spar").blurb, /club human/i);
    assert.match(modeSwitchCopy("analyze").blurb, /same study mode/i);
  });
});
