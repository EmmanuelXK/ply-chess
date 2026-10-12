import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getOpening } from "./index";
import { judgeUserMove, passesPawnRule, pickReply, storedReplies } from "./practice";
import type { BookLine, Opening } from "./types";

describe("practice replies", () => {
  it("lists stored opponent branches and picks among them", () => {
    const evans = getOpening("evans-gambit");
    assert.ok(evans);
    let branched = 0;
    for (let ply = 0; ply < evans.moves.length; ply += 1) {
      const replies = storedReplies(evans, evans.moves.slice(0, ply));
      if (replies.length > 1) branched += 1;
      assert.ok(replies.every((reply) => reply.san && reply.lineId));
    }
    assert.ok(branched >= 1, "a repertoire line should fork");
    const only = [{ san: "e5", lineId: "a" }];
    assert.equal(pickReply(only, () => 0)?.san, "e5");
    assert.equal(pickReply([], () => 0), null);
  });

  it("accepts the book move and rejects a move that is not stored", () => {
    const evans = getOpening("evans-gambit");
    assert.ok(evans);
    const lineId = evans.lines[0]?.id ?? null;
    const book = judgeUserMove(evans, "white", [], "e4", lineId);
    assert.equal(book.ok, true);
    assert.equal(book.bookSan, "e4");
    const miss = judgeUserMove(evans, "white", [], "a4", lineId);
    assert.equal(miss.ok, false);
    assert.equal(miss.bookSan, "e4");
    assert.ok(miss.reason.length > 0);
  });

  it("rejects a user move that drops 0.8 pawns unless it is marked", () => {
    const line = {
      id: "toy",
      label: "Toy",
      matchup: "Toy vs Toy",
      nickname: "Toy",
      ecoName: "C00 Toy",
      main: true,
      forkPly: null,
      moves: ["e4"],
      eco: { eco: "C00", name: "Toy" },
      ecoPly: 0,
      evals: [
        { cp: 200, mate: null, depth: 12, best: "e4" },
        { cp: 100, mate: null, depth: 12, best: "e5" },
      ],
      notes: [{ ply: 0, san: "e4", text: "Open the game." }],
      flaggedDrops: [],
    } satisfies BookLine;
    const opening = { lines: [line] } as unknown as Opening;
    assert.equal(passesPawnRule(line, 0, "white"), false);
    const dropped = judgeUserMove(opening, "white", [], "e4", "toy");
    assert.equal(dropped.ok, false);
    assert.match(dropped.reason, /Open the game/);
    const marked: BookLine = {
      ...line,
      flaggedDrops: [{ ply: 0, san: "e4", sacrifice: true }],
    };
    assert.equal(passesPawnRule(marked, 0, "white"), true);
    const gambit = judgeUserMove({ lines: [marked] } as unknown as Opening, "white", [], "e4", "toy");
    assert.equal(gambit.ok, true);
  });
});
