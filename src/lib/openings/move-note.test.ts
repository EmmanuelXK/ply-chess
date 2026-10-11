import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getOpening, openingOnLine } from "./index";
import { factualComment, moveNoteAt } from "./move-note";

describe("move note", () => {
  it("shows the coach note whose SAN matches the move on the board", () => {
    const evans = getOpening("evans-gambit");
    assert.ok(evans);
    assert.equal(moveNoteAt(evans, 0).san, "Start");
    assert.equal(moveNoteAt(evans, 0).comment, undefined);

    const b4 = evans.moves.indexOf("b4");
    const note = moveNoteAt(evans, b4 + 1);
    assert.equal(note.san, "b4");
    assert.match(note.comment ?? "", /Evans Gambit/);
    assert.equal(factualComment(evans, b4), note.comment);

    const quiet = evans.moves.findIndex((_, ply) => !evans.notes.some((row) => row.ply === ply));
    assert.ok(quiet >= 0);
    const bare = moveNoteAt(evans, quiet + 1);
    assert.equal(bare.san, evans.moves[quiet]);
    assert.equal(bare.comment, undefined);
  });

  it("keeps mainline notes on a shared branch prefix", () => {
    const evans = getOpening("evans-gambit");
    assert.ok(evans);
    const branch = evans.lines.find((line) => line.moves[13] === "Nge7");
    assert.ok(branch);
    const line = openingOnLine(evans, branch.id);
    const b4 = line.moves.indexOf("b4");
    assert.match(moveNoteAt(line, b4 + 1).comment ?? "", /Evans Gambit/);
    const reply = moveNoteAt(line, 14);
    assert.equal(reply.san, "Nge7");
    assert.match(reply.comment ?? "", /develops/i);
  });
});
