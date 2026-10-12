import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseCoachShow } from "@/lib/coach/show";

const FEN = "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";

describe("coach show", () => {
  it("keeps legal arrows and drops moves that are not in the position", () => {
    const show = parseCoachShow(
      JSON.stringify({
        text: "The bishop belongs on c4.",
        arrows: ["f1c4", "e2e5", "a1a1"],
        squares: ["f7", "nope", "c4"],
      }),
      FEN,
    );
    assert.equal(show?.text, "The bishop belongs on c4.");
    assert.deepEqual(show?.arrows, ["f1c4"]);
    assert.deepEqual(show?.squares, ["f7", "c4"]);
  });

  it("accepts a plain sentence with nothing to draw", () => {
    const show = parseCoachShow("Look at the center.", FEN);
    assert.equal(show?.text, "Look at the center.");
    assert.deepEqual(show?.arrows, []);
  });
});
