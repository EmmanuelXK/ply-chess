import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Chess, type Square } from "chess.js";

import { weapons } from "@/lib/openings/book";
import { buildLinePlan, catalogGamesPlay, planForLine } from "@/lib/openings/line-plan";

describe("line plans", () => {
  it("only cites games that can be played", () => {
    assert.equal(catalogGamesPlay(), true);
  });

  it("stores two or three grounded plans for every line", () => {
    for (const weapon of weapons) {
      for (const line of weapon.lines) {
        const built = buildLinePlan(line, weapon.side);
        const stored = planForLine(line.id);
        assert.ok(stored, line.id);
        assert.deepEqual(stored, built);
        assert.ok(stored.steps.length >= 2 && stored.steps.length <= 3);
        for (const step of stored.steps) {
          assert.ok(step.text.length >= 8);
          assert.equal(step.text.includes("Clean"), false);
          if (step.uci) assert.match(step.uci, /^[a-h][1-8][a-h][1-8][qrbn]?$/);
        }
        const end = new Chess();
        for (const san of line.moves) end.move(san);
        const user = weapon.side === "white" ? "w" : "b";
        const parts = end.fen().split(" ");
        parts[1] = user;
        parts[3] = "-";
        const seat = new Chess(parts.join(" "));
        for (const step of stored.steps) {
          if (!step.uci) continue;
          const from = step.uci.slice(0, 2);
          const piece = end.get(from as Square);
          assert.equal(piece?.color, user, `${line.id} ${step.uci} piece`);
          const played = seat.move({
            from,
            to: step.uci.slice(2, 4),
            promotion: step.uci[4],
          });
          assert.ok(played, `${line.id} ${step.uci}`);
          seat.undo();
        }
      }
    }
  });

  it("attaches the Evergreen game only to the Evans prefix", () => {
    const evans = planForLine("evans-gambit--0");
    assert.equal(evans?.game?.year, 1852);
    assert.equal(evans?.game?.white, "Anderssen");
    assert.equal(planForLine("london--0")?.game, null);
  });
});
