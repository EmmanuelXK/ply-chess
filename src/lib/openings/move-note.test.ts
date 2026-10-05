import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getOpening, openingFromTrap } from "./index";
import { factualComment, moveNoteAt } from "./move-note";

describe("move note", () => {
  it("shows the SAN and one stored comment, not generated coach prose", () => {
    const scotch = getOpening("scotch-gambit");
    assert.ok(scotch);
    const start = moveNoteAt(scotch, 0);
    assert.equal(start.san, "Start");
    assert.equal(start.comment, "Don't recapture.");

    const e4 = moveNoteAt(scotch, 1);
    assert.equal(e4.san, "e4");
    assert.equal(e4.comment, "Open game.");
    assert.doesNotMatch(e4.comment ?? "", /plan|their idea|if you miss|ask coach/i);

    const quiet = scotch.moves.findIndex(
      (_, ply) => !scotch.coach.some((row) => row.afterPly === ply),
    );
    assert.ok(quiet >= 0);
    const note = moveNoteAt(scotch, quiet + 1);
    assert.equal(note.san, scotch.moves[quiet]);
    assert.equal(note.comment, undefined);
    assert.equal(factualComment(scotch, quiet), undefined);
  });

  it("uses the trap's stored shot comment only on that ply", () => {
    const scotch = getOpening("scotch-gambit");
    assert.ok(scotch);
    const trap = scotch.traps[0];
    const line = openingFromTrap(scotch, trap);
    const shot = moveNoteAt(line, trap.shotPly + 1);
    assert.equal(shot.san, line.moves[trap.shotPly]);
    assert.equal(shot.comment, "King walked.");
    const other = moveNoteAt(line, 1);
    assert.equal(other.comment, undefined);
  });
});
