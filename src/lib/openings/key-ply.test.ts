import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openings } from "./index";
import { isKeyPly, keyPlyReasons } from "./key-ply";

describe("isKeyPly", () => {
  it("marks only plies whose stored note SAN matches the move", () => {
    for (const opening of openings) {
      opening.moves.forEach((san, ply) => {
        const noted = opening.notes.some((note) => note.ply === ply && note.san === san);
        assert.equal(isKeyPly(opening, ply), noted, `${opening.id} ply ${ply} ${san}`);
        if (noted) assert.deepEqual(keyPlyReasons(opening, ply), ["note"]);
      });
      const keys = opening.moves.filter((_, ply) => isKeyPly(opening, ply)).length;
      assert.ok(keys < opening.moves.length, `${opening.id} marks every ply`);
      assert.ok(keys > 0, `${opening.id} has no coach notes`);
    }
  });
});
