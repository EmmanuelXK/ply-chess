import assert from "node:assert/strict";
import test from "node:test";
import { exportFen, exportPgn, importNotation } from "./pgn";
import { playSan, sanTree, sansAlong, stepBack, treeFromSans } from "./tree";

test("PGN export and import keep the mainline and a variation", () => {
  let tree = treeFromSans(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    ["e4", "e5", "Nf3", "Nc6"],
  );
  tree = stepBack(stepBack(stepBack(tree)));
  tree = playSan(tree, "c5");
  tree = playSan(tree, "Nf3");
  const pgn = exportPgn(tree);
  assert.match(pgn, /1\. e4 e5 \(1\.\.\. c5 2\. Nf3\) 2\. Nf3 Nc6/);
  const back = importNotation(pgn);
  assert.ok(back);
  assert.deepEqual(sanTree(back.children), sanTree(tree.children));
  assert.deepEqual(sansAlong(back), ["e4", "e5", "Nf3", "Nc6"]);
});

test("a pasted FEN replaces the tree and a FEN header round-trips", () => {
  const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
  const imported = importNotation(fen);
  assert.ok(imported);
  assert.equal(imported.startFen, fen);
  assert.equal(imported.children.length, 0);
  assert.equal(exportFen(imported), fen);
  const played = playSan(imported, "e5");
  const pgn = exportPgn(played);
  assert.match(pgn, /\[SetUp "1"\]/);
  assert.match(pgn, /\[FEN "rnbqkbnr\/pppppppp\/8\/8\/4P3\/8\/PPPP1PPP\/RNBQKBNR b KQkq - 0 1"\]/);
  const back = importNotation(pgn);
  assert.equal(back?.startFen, fen);
  assert.deepEqual(sansAlong(back!), ["e5"]);
});

test("junk is not a position", () => {
  assert.equal(importNotation("hello there"), null);
  assert.equal(importNotation("   "), null);
});
