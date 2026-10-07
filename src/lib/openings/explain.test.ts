import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { explainPly } from "./explain";
import { openings } from "./index";

describe("explain ply", () => {
  it("is not the teaching text under the move", () => {
    const screen = readFileSync(new URL("../../components/drill/drill-screen.tsx", import.meta.url), "utf8");
    assert.equal(screen.includes("explainPly"), false);
    assert.match(screen, /note\.comment/);
    assert.match(screen, /data-testid="branch-chooser"/);
    assert.match(screen, /data-testid="book-ends"/);
  });

  it("writes a plain explanation for every book ply", () => {
    assert.equal(openings.length, 24);
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
