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
  it("uses RACK_SEQUENCE as the only membership list — 24 weapons, no duplicate tiles", () => {
    const specIds = openings.map((o) => o.id);
    assert.equal(openings.length, 24);

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

  it("keeps the four Home racks in order", () => {
    const racks = weaponRacks(openings);
    assert.deepEqual(
      racks.map((r) => r.title),
      ["White Gambits", "White Systems", "Black Gambits", "Black Systems"],
    );
    assert.deepEqual(
      racks.map((rack) => rack.openings.map((opening) => opening.id)),
      [
        ["evans-gambit", "scotch-gambit", "vienna-gambit", "smith-morra"],
        [
          "london",
          "jobava-london",
          "french-kia",
          "caro-fantasy",
          "grand-prix",
          "alapin",
          "english",
          "queens-gambit",
        ],
        ["benko", "budapest"],
        [
          "caro-kann",
          "black-lion",
          "pirc",
          "dragon",
          "scandinavian",
          "alekhine",
          "kings-indian",
          "modern-benoni",
          "dutch-leningrad",
          "slav",
        ],
      ],
    );
  });

  it("accepts likely aliases from a parallel spec PR", () => {
    assert.equal(canonicalOpeningId("qgd"), "queens-gambit");
    assert.equal(rackForOpeningId("qgd"), "white-systems");
    assert.equal(rackForOpeningId("caro"), "black-systems");
    assert.equal(rackForOpeningId("english-opening"), "white-systems");
    assert.equal(openingsInRack("white-systems", [{ id: "qgd" }])[0]?.id, "qgd");
    assert.ok(Object.keys(OPENING_ID_ALIASES).length > 0);
  });

  it("falls back by color when an unknown id appears", () => {
    assert.equal(
      rackForOpening({ id: "mystery-gambit", family: "black-d4", side: "black" }),
      "black-systems",
    );
    assert.equal(
      rackForOpening({ id: "new-white", family: "white", side: "white" }),
      "white-systems",
    );
  });

  it("keeps the reserved systems on their racks", () => {
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
    assert.equal(rackForOpeningId("caro-kann"), "black-systems");
    assert.equal(rackForOpeningId("slav"), "black-systems");
    assert.equal(rackForOpeningId("grand-prix"), "white-systems");
    assert.equal(rackForOpeningId("benko"), "black-gambits");
    assert.equal(rackForOpeningId("budapest"), "black-gambits");
    for (const id of RESERVED_OPENING_IDS) {
      assert.ok(RACK_SEQUENCE[rackForOpeningId(id)].includes(id), `${id} missing from its sequence`);
      assert.ok(openings.some((o) => o.id === id), `${id} missing from the book`);
    }
  });

  it("wires Learn routes for every weapon id", () => {
    for (const opening of openings) {
      assert.equal(studyHref(opening.id, "learn"), `/drill/${opening.id}`);
    }
  });
});
