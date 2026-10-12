import assert from "node:assert/strict";
import test from "node:test";
import { analysisKey, uciGo } from "./search";

test("Learn stays on the short live search", () => {
  assert.equal(uciGo({ kind: "live" }), "go depth 20 movetime 2500");
});

test("Analyze can run until stopped or to a depth and time", () => {
  assert.equal(uciGo({ kind: "infinite" }), "go infinite");
  assert.equal(
    uciGo({ kind: "bounded", depth: 24, movetimeMs: 5000 }),
    "go depth 24 movetime 5000",
  );
  assert.equal(
    uciGo({ kind: "bounded", depth: 99, movetimeMs: 1 }),
    "go depth 40 movetime 100",
  );
});

test("a new limit or position changes the search key", () => {
  const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const live = analysisKey({ id: "stockfish", limit: { kind: "live" }, multipv: 1, nonce: 0, fen });
  const infinite = analysisKey({
    id: "stockfish",
    limit: { kind: "infinite" },
    multipv: 3,
    nonce: 0,
    fen,
  });
  assert.notEqual(live, infinite);
  assert.match(infinite, /infinite/);
  assert.match(live, /\|1\|/);
});
