import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getOpening, openings } from "./index";
import { isKeyPly, keyPlyReasons } from "./key-ply";
import { isUserPly } from "./helpers";

describe("isKeyPly", () => {
  it("marks Lion pins, story, history, and authored theory — not every develop ply", () => {
    const lion = getOpening("black-lion");
    assert.ok(lion);
    const keys = lion.moves
      .map((_, ply) => ply)
      .filter((ply) => isKeyPly(lion, ply));
    assert.ok(keys.length >= 4, `expected several key plies, got ${keys.length}`);
    assert.ok(
      keys.length <= Math.floor(lion.moves.length * 0.45),
      `too chatty: ${keys.length}/${lion.moves.length} plies`,
    );
    assert.ok(isKeyPly(lion, 7), "…e5 should be a key Lion ply");
    assert.equal(isKeyPly(lion, 2), false, "d4 is a developing move");
    assert.equal(isKeyPly(lion, 3), false, "…Nf6 is a developing move");
    assert.equal(isKeyPly(lion, 6), false, "Nf3 is a developing move, not a leaked history key");
    const quiet = lion.moves.findIndex((_, ply) => !isKeyPly(lion, ply));
    assert.ok(quiet >= 0, "Lion should have at least one quiet develop ply");
    assert.ok(keyPlyReasons(lion, 7).length > 0);
  });

  it("stays sparse across the repertoire", () => {
    for (const opening of openings) {
      const keys = opening.moves.filter((_, ply) => isKeyPly(opening, ply)).length;
      assert.ok(
        keys < opening.moves.length,
        `${opening.id} marks every ply`,
      );
    }
  });

  it("adds the five new weapons as sparse systems", () => {
    const ids = ["alapin", "english", "caro-kann", "queens-gambit", "slav"];
    for (const id of ids) {
      const opening = getOpening(id);
      assert.ok(opening, `missing ${id}`);
      const keys = opening.moves
        .map((_, ply) => ply)
        .filter((ply) => isKeyPly(opening, ply));
      assert.ok(keys.length >= 4, `${id} needs concept keys, got ${keys.length}`);
      assert.ok(
        keys.length <= Math.floor(opening.moves.length * 0.45),
        `${id} too chatty: ${keys.length}/${opening.moves.length}`,
      );
      assert.ok(opening.traps.length >= 3, `${id} needs a trap pack`);
    }
    assert.equal(getOpening("alapin")?.side, "white");
    assert.equal(getOpening("english")?.side, "white");
    assert.equal(getOpening("queens-gambit")?.side, "white");
    assert.equal(getOpening("caro-kann")?.side, "black");
    assert.equal(getOpening("slav")?.side, "black");
    assert.ok(isKeyPly(getOpening("alapin")!, 2), "c3 should be an Alapin key");
    assert.ok(isKeyPly(getOpening("english")!, 8), "e4 clamp should be an English key");
    assert.ok(isKeyPly(getOpening("caro-kann")!, 5), "…Bf5 should be a Caro key");
    assert.ok(isKeyPly(getOpening("queens-gambit")!, 20), "Rab1 should be a minority key");
    assert.ok(isKeyPly(getOpening("slav")!, 9), "…Bf5 should be a Slav key");
    assert.equal(getOpening("alapin")?.moves.length, 42);
    assert.equal(getOpening("english")?.moves.length, 42);
    assert.equal(getOpening("caro-kann")?.moves.length, 42);
    assert.equal(getOpening("alapin")?.moves.at(-1), "Qd7");
    assert.equal(getOpening("english")?.moves.at(-1), "Re8");
    assert.equal(getOpening("caro-kann")?.moves.at(-1), "Rd8");
    assert.equal(isUserPly("black", (getOpening("caro-kann")?.moves.length ?? 0) - 1), true);
  });
});
