import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Chess } from "chess.js";
import { buildGamePgn, gameResult, pgnDate } from "./game";
import { START_FEN } from "./line";

describe("gameResult", () => {
  it("scores checkmate for the side that just moved", () => {
    const mate = new Chess();
    for (const san of ["f3", "e5", "g4", "Qh4"]) mate.move(san);
    assert.equal(gameResult(mate), "0-1");
    assert.equal(mate.isCheckmate(), true);
  });

  it("scores stalemate as a draw and an unfinished game as *", () => {
    const live = new Chess();
    live.move("e4");
    assert.equal(gameResult(live), "*");
    const stale = new Chess("k7/8/1Q6/8/8/8/8/K7 b - - 0 1");
    assert.equal(stale.isStalemate(), true);
    assert.equal(gameResult(stale), "1/2-1/2");
  });
});

describe("buildGamePgn", () => {
  it("writes headers, result, and a FEN setup when the spar starts mid-line", () => {
    const startFen = new Chess();
    startFen.move("d4");
    const pgn = buildGamePgn({
      startFen: startFen.fen(),
      moves: ["d5", "Bf4"],
      white: "You",
      black: "Coach",
      result: "1-0",
      event: "London spar",
      date: new Date("2026-09-15T12:00:00Z"),
    });
    assert.match(pgn, /\[Event "London spar"\]/);
    assert.match(pgn, /\[White "You"\]/);
    assert.match(pgn, /\[Black "Coach"\]/);
    assert.match(pgn, /\[Result "1-0"\]/);
    assert.match(pgn, /\[SetUp "1"\]/);
    assert.match(pgn, /\[FEN "/);
    assert.match(pgn, /d5/);
    assert.match(pgn, /Bf4/);
    assert.equal(pgnDate(new Date("2026-09-15T12:00:00Z")), "2026.09.15");
  });

  it("skips SetUp when the game starts from the initial position", () => {
    const pgn = buildGamePgn({
      startFen: START_FEN,
      moves: ["e4", "e5"],
      white: "You",
      black: "Coach",
      result: "*",
      event: "Open spar",
      date: new Date("2026-09-15T12:00:00Z"),
    });
    assert.doesNotMatch(pgn, /SetUp/);
    assert.match(pgn, /1\. e4 e5/);
  });
});
