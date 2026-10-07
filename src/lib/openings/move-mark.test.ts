import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isUserPly } from "./helpers";
import { isKeyPly } from "./key-ply";
import { moveMarkAt } from "./move-mark";
import { getOpening } from "./index";

describe("move marks", () => {
  it("stays quiet on ordinary plies, their replies, and the start", () => {
    const morra = getOpening("smith-morra");
    assert.ok(morra);
    assert.equal(moveMarkAt(morra, -1), null);
    const quiet = morra.moves.findIndex((_, ply) => !isKeyPly(morra, ply));
    assert.ok(quiet >= 0);
    assert.equal(moveMarkAt(morra, quiet), null);
    const theirs = morra.moves.findIndex(
      (_, ply) => isKeyPly(morra, ply) && !isUserPly(morra.side, ply),
    );
    assert.ok(theirs >= 0);
    assert.equal(moveMarkAt(morra, theirs), null);
  });

  it("marks our noted moves and leaves the opponent's replies bare", () => {
    const morra = getOpening("smith-morra");
    const london = getOpening("london");
    assert.ok(morra);
    assert.ok(london);
    for (const opening of [morra, london]) {
      const marks = opening.moves.map((_, ply) => moveMarkAt(opening, ply));
      const praised = marks.filter((mark) => mark !== null);
      assert.ok(praised.length >= 1, `${opening.id} should mark a noted ply`);
      assert.ok(praised.every((mark) => mark === "clean"));
      marks.forEach((mark, ply) => {
        if (!mark) return;
        assert.equal(isKeyPly(opening, ply), true);
        assert.equal(isUserPly(opening.side, ply), true);
        assert.equal(opening.notes.some((note) => note.ply === ply && note.san === opening.moves[ply]), true);
      });
    }
  });
});
