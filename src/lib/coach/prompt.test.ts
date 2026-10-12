import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { COACH_SYSTEM, coachUserPrompt, formatMoveList } from "./prompt";

describe("coach prompt", () => {
  it("sends the position and stays inside the stored data", () => {
    assert.match(COACH_SYSTEM, /Sinhala/);
    assert.match(COACH_SYSTEM, /Do not invent/);
    assert.equal(formatMoveList(["e4", "e5", "Nf3"]), "1. e4 e5 2. Nf3");
    const prompt = coachUserPrompt(
      {
        fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
        line: "The Evans",
        matchup: "Evans vs Italian",
        moves: ["e4"],
        side: "white",
        evalCp: 31,
        evalMate: null,
        evalDepth: 22,
        best: "c5",
        note: "Give the pawn.",
      },
      "why not Bc4?",
    );
    assert.match(prompt, /why not Bc4\?/);
    assert.match(prompt, /The Evans/);
    assert.match(prompt, /Evans vs Italian/);
    assert.match(prompt, /best move: c5/);
    assert.match(prompt, /Give the pawn/);
    assert.match(prompt, /FEN:/);
  });
});
