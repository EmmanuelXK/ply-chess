import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getOpening } from "./index";
import { repertoireLineTree } from "./line-tree";

describe("repertoireLineTree", () => {
  it("puts the spine first with houses, then trap branches", () => {
    const london = getOpening("london");
    assert.ok(london);
    const tree = repertoireLineTree(london);
    assert.equal(tree[0]?.id, null);
    assert.equal(tree[0]?.title, london.shortName);
    assert.ok((tree[0]?.leaves.length ?? 0) >= 2);
    assert.equal(tree.length, 1 + london.traps.length);
    assert.equal(tree[1]?.id, london.traps[0]?.id);
    assert.ok((tree[1]?.leaves.length ?? 0) >= 1);
  });

  it("keeps every weapon pickable as spine plus traps", () => {
    const evans = getOpening("evans-gambit");
    assert.ok(evans);
    const tree = repertoireLineTree(evans);
    assert.ok(tree.every((branch) => branch.title.trim().length > 0));
    assert.ok(tree.every((branch) => branch.leaves.length >= 1));
  });
});
