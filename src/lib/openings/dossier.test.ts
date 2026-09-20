import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openings } from "./index";
import { openingDossier, openingHouses, studyHref } from "./dossier";
import { WEAPON_MARK_IDS } from "./mark-ids";

describe("openingDossier", () => {
  it("moves trap counts, time, kind, and vs-line off the home card copy", () => {
    const scotch = openings.find((o) => o.id === "scotch-gambit");
    assert.ok(scotch);
    const line = openingDossier(scotch);
    assert.match(line, /^Semi · White · 1\.\.\.e5 · \d+m · \d+ traps$/);
    assert.ok(openingHouses(scotch).length > 0);
    assert.ok(!openingHouses(scotch).includes("Semi"));
  });

  it("keeps Learn on the existing drill route", () => {
    assert.equal(studyHref("scotch-gambit", "learn"), "/drill/scotch-gambit");
    assert.equal(studyHref("scotch-gambit", "reps"), "/drill/scotch-gambit?reps=reps");
    assert.equal(
      studyHref("london", "progress"),
      "/drill/london?reps=reps",
    );
  });

  it("labels system openings", () => {
    const london = openings.find((o) => o.id === "london");
    assert.ok(london);
    assert.match(openingDossier(london), /^System · White/);
    const italian = openings.find((o) => o.id === "italian-attack");
    assert.ok(italian);
    assert.match(openingDossier(italian), /^System · White/);
    const alapin = openings.find((o) => o.id === "alapin");
    assert.ok(alapin);
    assert.match(openingDossier(alapin), /^System · White/);
    const prix = openings.find((o) => o.id === "grand-prix");
    assert.ok(prix);
    assert.match(openingDossier(prix), /^Semi · White/);
  });
});

describe("weapon marks", () => {
  it("covers every production opening with a unique square mark", () => {
    const ids = new Set<string>(WEAPON_MARK_IDS);
    for (const opening of openings) {
      assert.ok(ids.has(opening.id), `missing widget mark for ${opening.id}`);
    }
    assert.equal(WEAPON_MARK_IDS.length, openings.length);
  });
});
