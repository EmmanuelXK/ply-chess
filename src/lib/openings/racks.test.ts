import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openings } from "./index";
import { studyHref } from "./dossier";
import {
  OPENING_ID_ALIASES,
  RACK_ORDER,
  RACK_SEQUENCE,
  RESERVED_OPENING_IDS,
  canonicalOpeningId,
  openingsInRack,
  rackForOpening,
  rackForOpeningId,
  weaponRacks,
} from "./racks";

describe("weapon racks", () => {
  it("uses RACK_SEQUENCE as the only membership list — 26 specs, no duplicate tiles", () => {
    const specIds = openings.map((o) => o.id);
    assert.equal(openings.length, 26);

    const sequence = RACK_ORDER.flatMap((rack) => [...RACK_SEQUENCE[rack]]);
    assert.equal(new Set(sequence).size, sequence.length, "duplicate id in RACK_SEQUENCE");
    assert.deepEqual([...sequence].sort(), [...specIds].sort());

    const seen = new Set<string>();
    for (const rack of RACK_ORDER) {
      const expected = RACK_SEQUENCE[rack].filter((id) => specIds.includes(id));
      const ids = openingsInRack(rack, openings).map((o) => o.id);
      assert.deepEqual(ids, expected, rack);
      for (const id of ids) {
        assert.equal(seen.has(id), false, `duplicate tile ${id}`);
        seen.add(id);
      }
    }
    assert.equal(seen.size, openings.length);

    const racks = weaponRacks(openings);
    assert.equal(
      racks.reduce((sum, rack) => sum + rack.openings.length, 0),
      openings.length,
    );
  });

  it("keeps the four Home racks — no color pages", () => {
    const racks = weaponRacks(openings);
    assert.deepEqual(
      racks.map((r) => r.title),
      ["White · Gambits", "White · Systems", "Black · vs 1.e4", "Black · vs 1.d4"],
    );
  });

  it("slots the five new systems into the locked racks", () => {
    assert.deepEqual(
      openingsInRack("white-systems", openings).map((o) => o.id),
      [
        "london",
        "jobava-london",
        "italian-attack",
        "french-kia",
        "caro-fantasy",
        "alapin",
        "english",
        "queens-gambit",
      ],
    );
    assert.equal(openingsInRack("black-e4", openings).at(-1)?.id, "caro-kann");
    assert.equal(openingsInRack("black-d4", openings).at(-1)?.id, "slav");
  });

  it("accepts likely aliases from a parallel spec PR", () => {
    assert.equal(canonicalOpeningId("qgd"), "queens-gambit");
    assert.equal(rackForOpeningId("qgd"), "white-systems");
    assert.equal(rackForOpeningId("caro"), "black-e4");
    assert.equal(rackForOpeningId("english-opening"), "white-systems");
    assert.equal(
      openingsInRack("white-systems", [{ id: "qgd" }])[0]?.id,
      "qgd",
    );
    assert.ok(Object.keys(OPENING_ID_ALIASES).length > 0);
  });

  it("falls back by family when an unknown id appears", () => {
    assert.equal(
      rackForOpening({ id: "mystery-gambit", family: "black-d4", side: "black" }),
      "black-d4",
    );
    assert.equal(
      rackForOpening({ id: "new-white", family: "white", side: "white" }),
      "white-systems",
    );
  });

  it("documents the five systems in White Systems / Black racks", () => {
    assert.deepEqual([...RESERVED_OPENING_IDS], [
      "alapin",
      "english",
      "queens-gambit",
      "caro-kann",
      "slav",
    ]);
    assert.equal(rackForOpeningId("alapin"), "white-systems");
    assert.equal(rackForOpeningId("english"), "white-systems");
    assert.equal(rackForOpeningId("queens-gambit"), "white-systems");
    assert.equal(rackForOpeningId("caro-kann"), "black-e4");
    assert.equal(rackForOpeningId("slav"), "black-d4");
    for (const id of RESERVED_OPENING_IDS) {
      assert.ok(
        RACK_SEQUENCE[rackForOpeningId(id)].includes(id),
        `${id} missing from its sequence`,
      );
      assert.ok(openings.some((o) => o.id === id), `${id} missing from specs`);
    }
  });

  it("puts Grand Prix in Gambits as the locked semi-sharp, not Systems", () => {
    assert.equal(rackForOpeningId("grand-prix"), "white-gambits");
    assert.equal(rackForOpeningId("italian-attack"), "white-systems");
  });

  it("wires Learn routes for every spec id", () => {
    for (const opening of openings) {
      assert.equal(studyHref(opening.id, "learn"), `/drill/${opening.id}`);
    }
  });
});
