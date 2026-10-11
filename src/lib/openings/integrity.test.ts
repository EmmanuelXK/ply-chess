import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { auditLine } from "./audit";
import { moveIsAcceptedOffbeat } from "./book";
import { openings } from "./index";
import type { BookLine } from "./types";

describe("repertoire integrity", () => {
  it("keeps every line legal, named, evaluated, noted, and free of user blunders", () => {
    assert.equal(openings.length, 25);
    assert.equal(
      openings.reduce((sum, opening) => sum + opening.lines.length, 0),
      121,
    );
    assert.equal(openings.some((opening) => opening.id === "kings-gambit"), false);
    assert.equal(openings.some((opening) => opening.id === "italian-attack"), false);

    const problems = openings.flatMap((opening) =>
      opening.lines.flatMap((line) => auditLine(opening.id, opening.side, line)),
    );
    assert.deepEqual(problems, []);

    for (const opening of openings) {
      for (const line of opening.lines) {
        assert.ok(line.label.trim(), `${opening.id}/${line.id} label`);
        assert.ok(line.matchup.trim(), `${opening.id}/${line.id} matchup`);
        assert.ok(line.nickname.trim(), `${opening.id}/${line.id} nickname`);
        assert.ok(line.eco.eco && line.eco.name.trim(), `${opening.id}/${line.id} eco`);
        assert.equal(line.ecoName, `${line.eco.eco} ${line.eco.name}`);
      }
    }

    const evans = openings.find((opening) => opening.id === "evans-gambit");
    assert.ok(evans);
    assert.ok(evans.moves.includes("Na5"));
    assert.equal(evans.moves.at(-1), "Qxc4");
    assert.ok((evans.evals.at(-1)?.cp ?? -999) > -80);
    assert.equal(evans.lines.length, 7);
    assert.ok(evans.lines.some((line) => /Two Knights/i.test(line.matchup)));
    assert.ok(evans.lines.some((line) => /Hungarian/i.test(line.matchup)));

    const scotch = openings.find((opening) => opening.id === "scotch-gambit");
    assert.ok(scotch?.lines.some((line) => /Max Lange/i.test(line.matchup)));
    assert.equal(scotch?.lines.length, 7);

    const london = openings.find((opening) => opening.id === "london");
    assert.ok(london);
    assert.ok((london.evals.at(-1)?.cp ?? -999) > -80);
    assert.ok(london.moves.length < 40);
    assert.equal(
      london.lines.find((line) => line.matchup === "London vs KID")?.nickname,
      "The Quiet Triangle",
    );

    const carr = openings.find((opening) => opening.id === "carr-defence");
    assert.ok(carr);
    assert.equal(carr.side, "black");
    assert.equal(carr.lines.length, 9);
    const main = carr.lines[0];
    assert.equal(main?.moves[1], "h6");
    assert.equal(moveIsAcceptedOffbeat(main!, 1), true);

    const spiked: BookLine = {
      ...main!,
      evals: main!.evals.map((row, index) =>
        index === 2 ? { ...row, cp: (row.cp ?? 0) + 400 } : row,
      ),
    };
    assert.deepEqual(auditLine(carr.id, carr.side, spiked), []);
    const unmarked: BookLine = {
      ...spiked,
      notes: spiked.notes.filter((note) => note.ply !== 1),
      flaggedDrops: [],
    };
    assert.equal(moveIsAcceptedOffbeat(unmarked, 1), false);
    assert.ok(
      auditLine(carr.id, carr.side, unmarked).some((problem) => problem.includes("h6")),
    );
  });
});
