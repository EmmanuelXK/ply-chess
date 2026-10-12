import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getOpening } from "./index";
import { MOVE_MARK_LABEL, moveMarkAt } from "./move-mark";

describe("move marks", () => {
  it("does not stamp the Clean tag on noted moves", () => {
    assert.equal("clean" in MOVE_MARK_LABEL, false);
    assert.equal(Object.values(MOVE_MARK_LABEL).includes("Clean" as never), false);
    const morra = getOpening("smith-morra");
    const london = getOpening("london");
    assert.ok(morra);
    assert.ok(london);
    for (const opening of [morra, london]) {
      opening.moves.forEach((_, ply) => {
        assert.equal(moveMarkAt(opening, ply), null);
      });
      assert.equal(moveMarkAt(opening, -1), null);
    }
  });
});
