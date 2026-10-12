import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseExplorer, pickWeighted } from "@/lib/explorer/crowd";

const FEN = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";

describe("crowd weights", () => {
  it("weights stored replies by game count and reports the position share", () => {
    const table = parseExplorer({
      white: 500,
      draws: 300,
      black: 200,
      moves: [
        { san: "e5", white: 300, draws: 80, black: 40 },
        { san: "c5", white: 80, draws: 40, black: 30 },
        { san: "e6", white: 10, draws: 5, black: 5 },
      ],
    });
    assert.equal(table?.total, 1000);
    const replies = [
      { san: "e5", lineId: "a" },
      { san: "e6", lineId: "b" },
    ];
    const heavy = pickWeighted(replies, table, FEN, () => 0);
    assert.equal(heavy?.reply.san, "e5");
    assert.equal(heavy?.percent, 42);
    const light = pickWeighted(replies, table, FEN, () => 0.99);
    assert.equal(light?.reply.san, "e6");
    assert.equal(light?.percent, 2);
  });

  it("falls back to an even pick when the explorer is empty", () => {
    const replies = [
      { san: "e5", lineId: "a" },
      { san: "c5", lineId: "b" },
    ];
    assert.equal(pickWeighted(replies, null, FEN, () => 0)?.reply.san, "e5");
    assert.equal(pickWeighted(replies, null, FEN, () => 0)?.percent, null);
    assert.equal(parseExplorer({ white: 0, draws: 0, black: 0, moves: [] }), null);
  });
});
