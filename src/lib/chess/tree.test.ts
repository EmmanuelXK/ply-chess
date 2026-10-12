import assert from "node:assert/strict";
import test from "node:test";
import {
  canDelete,
  canPromote,
  canStepForward,
  deleteNode,
  fenAt,
  graphPoints,
  playSan,
  promoteNode,
  recordScore,
  sanTree,
  sansAlong,
  stepBack,
  stepForward,
  treeFromSans,
} from "./tree";

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

test("a book line is the mainline and the cursor can sit in the middle", () => {
  const tree = treeFromSans(START, ["e4", "e5", "Nf3"], 1, [
    { cp: 20, mate: null },
    { cp: 30, mate: null },
    { cp: 15, mate: null },
    { cp: 25, mate: null },
  ]);
  assert.deepEqual(sansAlong(tree), ["e4"]);
  assert.equal(canStepForward(tree), true);
  const end = stepForward(stepForward(tree));
  assert.deepEqual(sansAlong(end), ["e4", "e5", "Nf3"]);
  assert.equal(graphPoints(tree)[1]?.cp, 30);
  assert.equal(graphPoints(end).at(-1)?.cp, 25);
});

test("a free move from any position becomes a variation", () => {
  let tree = treeFromSans(START, ["e4", "e5", "Nf3"]);
  tree = stepBack(stepBack(tree));
  tree = playSan(tree, "c5");
  assert.deepEqual(sanTree(tree.children), [
    {
      san: "e4",
      children: [
        { san: "e5", children: [{ san: "Nf3", children: [] }] },
        { san: "c5", children: [] },
      ],
    },
  ]);
  assert.deepEqual(sansAlong(tree), ["e4", "c5"]);
  tree = playSan(tree, "c5");
  assert.equal(tree.children[0]?.children.length, 2);
});

test("promote lifts a variation to the mainline and delete removes it", () => {
  let tree = treeFromSans(START, ["e4", "e5"]);
  tree = stepBack(tree);
  tree = playSan(tree, "c5");
  assert.equal(canPromote(tree), true);
  tree = promoteNode(tree, tree.path);
  assert.deepEqual(sansAlong(tree), ["e4", "c5"]);
  assert.equal(tree.children[0]?.children[0]?.san, "c5");
  assert.equal(canPromote(tree), false);
  assert.equal(canDelete(tree), true);
  tree = deleteNode(tree, tree.path);
  assert.deepEqual(sansAlong(tree), ["e4"]);
  assert.equal(tree.children[0]?.children[0]?.san, "e5");
  assert.equal(fenAt(tree).split(" ")[1], "b");
});

test("recordScore keeps the same tree when the eval does not change", () => {
  const tree = treeFromSans(START, ["e4"]);
  const next = recordScore(tree, 12, null);
  assert.equal(next.children[0]?.cp, 12);
  assert.equal(recordScore(next, 12, null), next);
  const root = stepBack(next);
  const scored = recordScore(root, 4, null);
  assert.equal(scored.rootCp, 4);
  assert.equal(recordScore(scored, 4, null), scored);
});
