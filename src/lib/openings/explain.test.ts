import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { explainPly } from "./explain";
import { openings } from "./index";

describe("explain ply", () => {
  it("writes a plain explanation for every book ply", () => {
    assert.equal(openings.length, 26);
    for (const opening of openings) {
      for (let ply = 0; ply <= opening.moves.length; ply++) {
        const text = explainPly(opening, ply);
        assert.ok(text.length > 40, `${opening.id} ply ${ply} explanation is empty`);
        assert.doesNotMatch(text, /ask coach|why lesson|spaced review|quiz/i);
        assert.match(text, /[.!]$/);
      }
    }
  });
});
