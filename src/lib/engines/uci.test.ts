import assert from "node:assert/strict";
import test from "node:test";
import { emptyAnalysis, formatNodes, formatScore, reduceInfo, uciToSan } from "./uci";

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const SCOTCH =
  "rnbqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3";

test("uciToSan reads a Scotch pawn break", () => {
  const beforeD4 = "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3";
  assert.equal(uciToSan(beforeD4, "d2d4"), "d4");
});

test("black-to-move scores flip to White's point of view", () => {
  const view = reduceInfo(
    emptyAnalysis(),
    "info depth 8 nodes 1200 nps 40000 multipv 1 score cp 35 pv d7d5 g1f3",
    SCOTCH,
  );
  assert.equal(view.depth, 8);
  assert.equal(view.nodes, 1200);
  assert.equal(view.lines[0]?.cp, -35);
  assert.equal(view.lines[0]?.san[0], "d5");
  assert.equal(formatScore(view.lines[0]), "-0.35");
});

test("mate distance flips with the side to move", () => {
  const view = reduceInfo(
    emptyAnalysis(),
    "info depth 6 multipv 1 score mate 2 pv h4f6",
    "rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2",
  );
  assert.equal(view.lines[0]?.mate, -2);
  assert.equal(formatScore(view.lines[0]), "-M2");
});

test("multipv keeps three lines sorted", () => {
  let view = emptyAnalysis();
  view = reduceInfo(view, "info depth 6 multipv 2 score cp 10 pv d2d4", START);
  view = reduceInfo(view, "info depth 7 multipv 1 score cp 30 pv e2e4", START);
  view = reduceInfo(view, "info depth 7 multipv 3 score cp 4 pv c2c4", START);
  view = reduceInfo(view, "info depth 8 multipv 4 score cp 1 pv g1f3", START);
  assert.deepEqual(
    view.lines.map((line) => line.san[0]),
    ["e4", "d4", "c4"],
  );
  assert.equal(view.depth, 8);
  assert.equal(view.lines[0]?.cp, 30);
});

test("info string and currmove lines do not invent a pv", () => {
  const view = reduceInfo(
    emptyAnalysis(),
    "info string Fairy-Stockfish failed to start",
    START,
  );
  assert.equal(view.lines.length, 0);
  const nodesOnly = reduceInfo(emptyAnalysis(), "info depth 3 nodes 40 currmove e2e4", START);
  assert.equal(nodesOnly.depth, 3);
  assert.equal(nodesOnly.nodes, 40);
  assert.equal(nodesOnly.lines.length, 0);
});

test("formatNodes stays short on a phone", () => {
  assert.equal(formatNodes(0), "0");
  assert.equal(formatNodes(840), "840");
  assert.equal(formatNodes(1500), "1.5k");
  assert.equal(formatNodes(22400), "22k");
  assert.equal(formatNodes(2_500_000), "2.5m");
});
