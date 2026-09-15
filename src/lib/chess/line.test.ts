import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Chess } from "chess.js";
import { lastMoveFrom } from "./dests";
import { playLine, playLineFromFen, START_FEN } from "./line";

describe("playLine", () => {
  it("returns the applied ply, not the requested cap, when a SAN dies", () => {
    const pos = playLine(["e4", "e5", "NotAMove", "Nf3"], 4);
    assert.equal(pos.appliedPly, 2);
    assert.equal(pos.turnColor, "white");
    assert.deepEqual(pos.lastMove, ["e7", "e5"]);
    assert.equal(pos.chess.history().join(" "), "e4 e5");
  });

  it("caps at the line length and keeps lastMove in sync with history", () => {
    const pos = playLine(["e4", "c6", "d4", "d5"], 99);
    assert.equal(pos.appliedPly, 4);
    assert.deepEqual(pos.lastMove, lastMoveFrom(pos.chess));
    assert.equal(pos.fen, pos.chess.fen());
  });
});

describe("playLineFromFen", () => {
  it("plays SAN from a mid-game FEN as if those moves followed that position", () => {
    const afterD4 = playLine(["d4"], 1).fen;
    const fromFen = playLineFromFen(afterD4, ["d5", "Bf4"], 2);
    const fromStart = playLine(["d4", "d5", "Bf4"], 3);
    assert.equal(fromFen.appliedPly, 2);
    assert.equal(fromFen.fen, fromStart.fen);
    const offBook = playLineFromFen(afterD4, ["Nf6"], 1);
    assert.equal(offBook.appliedPly, 1);
    assert.match(offBook.fen, /n/);
  });

  it("falls back to the start position when the FEN is junk", () => {
    const pos = playLineFromFen("not-a-fen", ["e4"], 1);
    assert.equal(pos.appliedPly, 1);
    assert.equal(playLine(["e4"], 1).fen, pos.fen);
    assert.equal(START_FEN.split(" ")[1], "w");
  });
});

describe("lastMoveFrom", () => {
  it("restores the previous highlight after an undo", () => {
    const g = new Chess();
    g.move("e4");
    g.move("e5");
    g.move("Nf3");
    g.undo();
    assert.deepEqual(lastMoveFrom(g), ["e7", "e5"]);
    g.undo();
    g.undo();
    assert.equal(lastMoveFrom(g), null);
  });
});
