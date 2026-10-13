import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { markAnchor } from "./mark-anchor";

function percent(value: string): number {
  return Number(value.replace("%", ""));
}

describe("mark anchor", () => {
  it("keeps the badge inside the destination square on both orientations", () => {
    const files = "abcdefgh";
    for (const orientation of ["white", "black"] as const) {
      for (let file = 0; file < 8; file += 1) {
        for (let rank = 1; rank <= 8; rank += 1) {
          const square = `${files[file]}${rank}`;
          const anchor = markAnchor(square, orientation);
          const x = orientation === "white" ? file : 7 - file;
          const y = orientation === "white" ? 7 - (rank - 1) : rank - 1;
          const left = percent(anchor.left);
          const top = percent(anchor.top);
          assert.equal(anchor.transform, "translate(-100%, 0)");
          assert.ok(left > x * 12.5 && left < (x + 1) * 12.5, `${orientation} ${square} left`);
          assert.ok(top >= y * 12.5 && top < (y + 1) * 12.5, `${orientation} ${square} top`);
        }
      }
    }
  });
});
