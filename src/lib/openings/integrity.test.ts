import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { auditLine } from "./audit";
import { openings } from "./index";

describe("repertoire integrity", () => {
  it("keeps every line legal, named, evaluated, noted, and free of user blunders", () => {
    assert.equal(openings.length, 24);
    assert.equal(openings.some((opening) => opening.id === "kings-gambit"), false);
    assert.equal(openings.some((opening) => opening.id === "italian-attack"), false);

    const problems = openings.flatMap((opening) =>
      opening.lines.flatMap((line) => auditLine(opening.id, opening.side, line)),
    );
    assert.deepEqual(problems, []);

    const evans = openings.find((opening) => opening.id === "evans-gambit");
    assert.ok(evans);
    assert.ok(evans.moves.includes("Na5"));
    assert.equal(evans.moves.at(-1), "Qxc4");
    assert.ok((evans.evals.at(-1)?.cp ?? -999) > -80);
    assert.equal(evans.lines.length, 5);

    const scotch = openings.find((opening) => opening.id === "scotch-gambit");
    assert.ok(scotch?.lines.some((line) => /Max Lange/i.test(line.label)));

    const london = openings.find((opening) => opening.id === "london");
    assert.ok(london);
    assert.ok((london.evals.at(-1)?.cp ?? -999) > -80);
    assert.ok(london.moves.length < 40);
  });
});
