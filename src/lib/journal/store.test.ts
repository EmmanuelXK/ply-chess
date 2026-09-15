import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clipNote,
  makePin,
  NOTE_MAX,
  pgnSnippet,
  pinHref,
  pinLabel,
} from "./store";

describe("player journal", () => {
  it("clips notes and keeps a short PGN snippet", () => {
    assert.equal(clipNote("  keep this  "), "keep this");
    assert.equal(clipNote("x".repeat(NOTE_MAX + 20)).length, NOTE_MAX);
    assert.equal(pgnSnippet(["d4", "d5", "Bf4"], 2), "d5 Bf4");
  });

  it("stores opening, fen, ply, mode, and coach context on a pin", () => {
    const pin = makePin({
      openingId: "london",
      openingName: "London",
      ply: 2,
      fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
      pgn: "d4 d5",
      mode: "learn",
      coachKind: "ok",
      coachText: "This pawn is a rock, not a ram.",
      note: "Remember the triangle",
    });
    assert.equal(pin.openingId, "london");
    assert.equal(pin.ply, 2);
    assert.equal(pin.mode, "learn");
    assert.match(pin.fen, /3P4/);
    assert.equal(pin.pgn, "d4 d5");
    assert.equal(pin.coachText, "This pawn is a rock, not a ram.");
    assert.equal(pin.note, "Remember the triangle");
    assert.ok(pin.id);
  });

  it("opens a pin back into the same study context", () => {
    const pin = makePin({
      openingId: "london",
      openingName: "London",
      trapId: "qb6",
      ply: 6,
      fen: "8/8/8/8/8/8/8/8 w - - 0 1",
      pgn: "d4 d5 Bf4",
      mode: "reps",
    });
    assert.equal(
      pinHref(pin),
      "/drill/london?reps=reps&ply=6&trap=qb6",
    );
    assert.match(pinLabel(pin), /London · Reps · 3/);
  });

  it("maps plan / analyze pins onto Learn without a silent mode jump in the href", () => {
    const plan = makePin({
      openingId: "black-lion",
      openingName: "Black Lion",
      ply: 42,
      fen: "8/8/8/8/8/8/8/8 w - - 0 1",
      pgn: "",
      mode: "plan",
    });
    assert.equal(pinHref(plan), "/drill/black-lion?ply=42");
  });
});
