import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  clearChessgroundTransients,
  dropStuckFadingPieces,
  type TransientPiece,
} from "./clear-transients";

function fakePiece(className: string): TransientPiece & {
  props: Record<string, string>;
  removed: boolean;
} {
  const props: Record<string, string> = {};
  const piece: TransientPiece & { props: Record<string, string>; removed: boolean } =
    {
      className,
      props,
      removed: false,
      classList: {
        remove: (token: string) => {
          piece.className = piece.className
            .split(/\s+/)
            .filter((c) => c && c !== token)
            .join(" ");
        },
      },
      style: {
        setProperty: (name, value, priority) => {
          props[name] = priority ? `${value} !${priority}` : value;
        },
        removeProperty: (name) => {
          delete props[name];
        },
      },
      remove: () => {
        piece.removed = true;
      },
    };
  return piece;
}

describe("clearChessgroundTransients", () => {
  it("strips ghost piece classes and hides with display:none !important", () => {
    const ghost = fakePiece("ghost white knight");
    const dragging = fakePiece("white knight dragging");
    const root = {
      querySelectorAll: (sel: string) => {
        if (sel === "piece.ghost") return [ghost];
        if (sel === "piece.dragging") return [dragging];
        return [];
      },
    };
    clearChessgroundTransients(root);
    assert.equal(ghost.className, "ghost");
    assert.equal(ghost.props.display, "none !important");
    assert.equal(ghost.props.visibility, "hidden !important");
    assert.equal(ghost.props.opacity, "0 !important");
    assert.equal(dragging.className, "white knight");
  });
});

describe("dropStuckFadingPieces", () => {
  it("removes fading clones and leftover anim class after motion ends", () => {
    const fading = fakePiece("white knight fading");
    const anim = fakePiece("white knight anim");
    const root = {
      querySelectorAll: (sel: string) => {
        if (sel === "piece.fading") return [fading];
        if (sel === "piece.anim") return [anim];
        return [];
      },
    };
    dropStuckFadingPieces(root);
    assert.equal(fading.removed, true);
    assert.equal(anim.className, "white knight");
  });
});

describe("chessground ghost CSS contract", () => {
  it("hides piece.ghost with display:none !important so block pieces cannot leak", () => {
    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../../app/chessground.css"),
      "utf8",
    );
    assert.match(css, /piece\.ghost[\s\S]*display:\s*none\s*!important/);
  });
});
