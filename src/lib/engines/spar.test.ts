import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Chess } from "chess.js";
import { coachSparSan } from "./spar";

describe("coachSparSan", () => {
  it("returns a legal human-practical move from the current FEN", async () => {
    const fen = new Chess().fen();
    const san = await coachSparSan(fen);
    assert.ok(san);
    const g = new Chess(fen);
    assert.doesNotThrow(() => g.move(san!));
  });

  it("returns null when the game is already over", async () => {
    const mate = new Chess();
    for (const san of ["f3", "e5", "g4", "Qh4"]) mate.move(san);
    assert.equal(await coachSparSan(mate.fen()), null);
  });
});
