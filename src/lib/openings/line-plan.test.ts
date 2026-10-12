import assert from "node:assert/strict";
import { describe, it } from "node:test";

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
