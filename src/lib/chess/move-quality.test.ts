import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getOpening } from "@/lib/openings";
import { userDrop } from "@/lib/openings/audit";
import { gradeBookPly, gradeMove, BLUNDER_CP, MISTAKE_CP, GOOD_CP, QUALITY_NAME } from "./move-quality";

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

  it("grades a sample of lines from the stored eval drop", () => {
    for (const id of ["london", "dragon", "slav", "queens-gambit", "caro-kann"]) {
      const opening = getOpening(id);
      assert.ok(opening, id);
      assert.ok(opening.moves.length > 8, id);
      for (let ply = 0; ply < opening.moves.length; ply += 1) {
        const before = opening.evals[ply];
        const after = opening.evals[ply + 1];
        const grade = gradeBookPly(opening, ply);
        assert.ok(before && after, `${id} ply ${ply}`);
        const mover = ply % 2 === 0 ? "white" : "black";
        const loss = userDrop(before, after, mover);
        if (loss >= BLUNDER_CP) assert.equal(grade, "blunder", `${id} ${opening.moves[ply]}`);
        else if (loss >= MISTAKE_CP) assert.equal(grade, "mistake", `${id} ${opening.moves[ply]}`);
        else if (loss > GOOD_CP) assert.equal(grade, "inaccuracy", `${id} ${opening.moves[ply]}`);
        else assert.ok(grade === "brilliant" || grade === "best" || grade === "good" || grade === "positional", `${id} ${ply} ${grade}`);
      }
    }
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
