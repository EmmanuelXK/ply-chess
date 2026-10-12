import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { cachedCrowd, explorerUrl, rememberCrowd, resetExplorerCache } from "@/lib/explorer/lichess";

describe("lichess explorer cache", () => {
  it("asks the lichess database for blitz and rapid around 1200-2000", () => {
    const url = new URL(explorerUrl("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"));
    assert.equal(url.hostname, "explorer.lichess.ovh");
    assert.equal(url.searchParams.get("speeds"), "blitz,rapid");
    assert.equal(url.searchParams.get("ratings"), "1200,1400,1600,1800,2000");
    assert.match(url.searchParams.get("fen") ?? "", /4P3/);
  });

  it("remembers a table until it expires", () => {
    resetExplorerCache();
    const fen = "start";
    rememberCrowd(fen, { total: 10, moves: [{ san: "e5", games: 4 }] }, 1_000);
    assert.equal(cachedCrowd(fen, 1_000 + 1000)?.moves[0]?.san, "e5");
    assert.equal(cachedCrowd(fen, 1_000 + 7 * 60 * 60 * 1000), null);
    resetExplorerCache();
  });
});
