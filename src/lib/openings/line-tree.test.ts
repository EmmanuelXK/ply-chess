import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getOpening } from "./index";
import { repertoireLineTree } from "./line-tree";

describe("repertoireLineTree", () => {
  it("puts the mainline first, then opponent branches", () => {
    const london = getOpening("london");
    assert.ok(london);
    const tree = repertoireLineTree(london);
    assert.equal(tree[0]?.id, null);
    assert.equal(tree[0]?.nickname, london.lines[0]?.nickname);
    assert.equal(tree[0]?.matchup, london.lines[0]?.matchup);
    assert.equal(tree[0]?.ecoName, london.lines[0]?.ecoName);
    assert.ok((tree[0]?.leaves.length ?? 0) >= 2);
    assert.equal(tree.length, london.lines.length);
    assert.equal(tree[1]?.id, london.lines[1]?.id);
    assert.equal(tree.at(-1)?.leaves.at(-1)?.title, "Book ends");
  });

  it("folds the Max Lange into the Scotch Gambit and keeps Evans branches", () => {
    const evans = getOpening("evans-gambit");
    const scotch = getOpening("scotch-gambit");
    assert.ok(evans);
    assert.ok(scotch);
    const tree = repertoireLineTree(evans);
    assert.equal(tree.length, 7);
    assert.ok(tree.every((branch) => branch.nickname.trim().length > 0));
    assert.ok(tree.every((branch) => branch.matchup.trim().length > 0));
    assert.ok(tree.every((branch) => branch.leaves.length >= 1));
    assert.match(
      repertoireLineTree(scotch)
        .map((branch) => branch.matchup)
        .join(" "),
      /Max Lange/,
    );
  });
});
