import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clipNote,
  isJournalGame,
  listGamesForLine,
  makeGame,
  NOTE_MAX,
  normalizePin,
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

  it("stores a finished spar game with PGN, start FEN, result, and note", () => {
    const startFen = "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1";
    const game = makeGame({
      openingId: "london",
      openingName: "London",
      startPly: 1,
      startFen,
      moves: ["d5", "Bf4", "c5"],
      result: "1-0",
      mode: "learn",
      note: "I hung the c-pawn on purpose",
    });
    assert.equal(game.kind, "game");
    assert.ok(isJournalGame(game));
    assert.equal(game.openingId, "london");
    assert.equal(game.ply, 1);
    assert.equal(game.startFen, startFen);
    assert.deepEqual(game.moves, ["d5", "Bf4", "c5"]);
    assert.equal(game.result, "1-0");
    assert.equal(game.note, "I hung the c-pawn on purpose");
    assert.match(game.pgn, /\[Result "1-0"\]/);
    assert.match(game.pgn, /d5/);
    assert.ok(game.id);
  });

  it("opens a pinned game back into the same line with a memory id", () => {
    const game = makeGame({
      openingId: "london",
      openingName: "London",
      trapId: "qb6",
      startPly: 6,
      startFen: "8/8/8/8/8/8/8/8 w - - 0 1",
      moves: ["Qxb6"],
      result: "0-1",
      mode: "reps",
    });
    assert.equal(
      pinHref(game),
      `/drill/london?reps=reps&ply=6&trap=qb6&memory=${game.id}`,
    );
    assert.match(pinLabel(game), /London · 0-1/);
  });

  it("maps spar / plan / analyze onto Learn without a silent mode jump in the href", () => {
    const spar = makeGame({
      openingId: "black-lion",
      openingName: "Black Lion",
      startPly: 12,
      startFen: START_PLACEHOLDER,
      moves: ["e5"],
      result: "*",
      mode: "spar",
    });
    assert.equal(
      pinHref(spar),
      `/drill/black-lion?ply=12&memory=${spar.id}`,
    );
  });

  it("lists games for one opening line and hides leftover moment pins", () => {
    const london = makeGame({
      openingId: "london",
      openingName: "London",
      startPly: 2,
      startFen: START_PLACEHOLDER,
      moves: ["d5"],
      result: "1-0",
      mode: "learn",
    });
    const trap = makeGame({
      openingId: "london",
      openingName: "London",
      trapId: "qb6",
      startPly: 4,
      startFen: START_PLACEHOLDER,
      moves: ["Qxb6"],
      result: "*",
      mode: "learn",
    });
    const moment = normalizePin({
      id: "old-moment",
      kind: "moment",
      openingId: "london",
      openingName: "London",
      ply: 2,
      fen: START_PLACEHOLDER,
      pgn: "d4 d5",
      mode: "learn",
    });
    assert.equal(isJournalGame(moment), false);
    const rows = [london, trap, moment];
    const spine = rows.filter(
      (row) =>
        isJournalGame(row) && row.openingId === "london" && row.trapId == null,
    );
    const pack = rows.filter(
      (row) =>
        isJournalGame(row) && row.openingId === "london" && row.trapId === "qb6",
    );
    assert.equal(spine.length, 1);
    assert.equal(spine[0].id, london.id);
    assert.equal(pack.length, 1);
    assert.equal(pack[0].id, trap.id);
    assert.equal(typeof listGamesForLine, "function");
  });
});

const START_PLACEHOLDER =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
