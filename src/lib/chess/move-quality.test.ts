import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getOpening } from "@/lib/openings";
import { gradeBookPly, gradeMove, QUALITY_NAME } from "./move-quality";

describe("move quality", () => {
  it("does not use the Clean tag", () => {
    assert.equal(Object.values(QUALITY_NAME).includes("Clean" as never), false);
  });

  it("marks the engine's top move, a sound pawn offer, and a quiet improvement", () => {
    const evans = getOpening("evans-gambit");
    assert.ok(evans);
    assert.equal(gradeBookPly(evans, evans.moves.indexOf("e4")), "best");
    const b4 = evans.moves.indexOf("b4");
    assert.equal(gradeBookPly(evans, b4), "brilliant");
    const e5 = evans.moves.indexOf("e5");
    assert.equal(gradeBookPly(evans, e5), "positional");
  });

  it("uses eval-drop thresholds for inaccuracy, mistake, and blunder", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const base = { fenBefore: fen, san: "e4", before: { cp: 0, mate: null, best: "d4" } };
    assert.equal(gradeMove({ ...base, after: { cp: -40, mate: null } }), "inaccuracy");
    assert.equal(gradeMove({ ...base, after: { cp: -150, mate: null } }), "mistake");
    assert.equal(gradeMove({ ...base, after: { cp: -400, mate: null } }), "blunder");
    assert.equal(gradeMove({ ...base, after: { cp: -20, mate: null } }), "good");
  });

  it("leaves a move unmarked when the book has no score", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    assert.equal(
      gradeMove({
        fenBefore: fen,
        san: "e4",
        before: { cp: null, mate: null },
        after: { cp: null, mate: null },
      }),
      null,
    );
  });
});
