import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { arrangeTiles, guessTileLayout } from "./arranger";

describe("arrangeTiles", () => {
  it("uses two columns on a small phone stage", () => {
    const layout = arrangeTiles(318);
    assert.equal(layout.cols, 2);
    assert.ok(layout.tile >= 96);
  });

  it("uses three columns on iPhone-class widths", () => {
    assert.equal(arrangeTiles(350).cols, 3);
    assert.equal(arrangeTiles(390).cols, 3);
    assert.equal(arrangeTiles(430).cols, 3);
  });

  it("fits iPad Air 3 portrait (~834) with four to five widget columns", () => {
    const air = arrangeTiles(834 - 72);
    assert.ok(air.cols >= 4 && air.cols <= 5, `cols=${air.cols}`);
    assert.equal(air.cols, 5);
    assert.ok(air.tile >= 120 && air.tile <= 152, `tile=${air.tile}`);
  });

  it("adds columns in iPad landscape", () => {
    const land = arrangeTiles(1112 - 80);
    assert.ok(land.cols >= 6, `cols=${land.cols}`);
    assert.ok(land.cols <= 8);
  });

  it("keeps tiles square-capable (positive size, even gutters)", () => {
    for (const width of [320, 390, 762, 1032]) {
      const { cols, tile, gap } = arrangeTiles(width);
      const used = cols * tile + (cols - 1) * gap;
      assert.ok(used <= width, `${width}: used ${used}`);
      assert.ok(tile >= 72);
    }
  });
});

describe("guessTileLayout", () => {
  it("pads a phone viewport before arranging", () => {
    const layout = guessTileLayout(390);
    assert.equal(layout.cols, 3);
  });

  it("pads an iPad Air 3 portrait viewport to five columns", () => {
    const layout = guessTileLayout(834);
    assert.equal(layout.cols, 5);
  });
});
