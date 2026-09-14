import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openings } from "./index";
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

const EXPECTED_NOW: Record<string, string[]> = {
  "white-gambits": [
    "scotch-gambit",
    "evans-gambit",
    "vienna-gambit",
    "kings-gambit",
    "smith-morra",
    "grand-prix",
  ],
  "white-systems": [
    "london",
    "jobava-london",
    "italian-attack",
    "french-kia",
    "caro-fantasy",
  ],
  "black-e4": ["black-lion", "pirc", "dragon", "scandinavian", "alekhine"],
  "black-d4": [
    "kings-indian",
    "modern-benoni",
    "benko",
    "dutch-leningrad",
    "budapest",
  ],
};

describe("weapon racks", () => {
  it("places every current opening in exactly one locked rack, in IA order", () => {
    const seen = new Set<string>();
    for (const rack of RACK_ORDER) {
      const ids = openingsInRack(rack, openings).map((o) => o.id);
      assert.deepEqual(ids, EXPECTED_NOW[rack], rack);
      for (const id of ids) {
        assert.equal(seen.has(id), false, `duplicate ${id}`);
        seen.add(id);
      }
    }
    assert.equal(seen.size, openings.length);
    assert.equal(openings.length, 21);
  });

  it("keeps the four Home racks — no color pages", () => {
    const racks = weaponRacks(openings);
    assert.deepEqual(
      racks.map((r) => r.title),
      ["White · Gambits", "White · Systems", "Black · vs 1.e4", "Black · vs 1.d4"],
    );
  });

  it("slots reserved ids into the right racks when specs exist", () => {
    const stubs = [
      ...openings,
      { id: "alapin", side: "white" as const, family: "white" as const },
      { id: "english", side: "white" as const, family: "white" as const },
      { id: "queens-gambit", side: "white" as const, family: "white" as const },
      { id: "caro-kann", side: "black" as const, family: "black-e4" as const },
      { id: "slav", side: "black" as const, family: "black-d4" as const },
    ];
    assert.deepEqual(
      openingsInRack("white-systems", stubs).map((o) => o.id),
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
    assert.equal(
      openingsInRack("black-e4", stubs).at(-1)?.id,
      "caro-kann",
    );
    assert.equal(openingsInRack("black-d4", stubs).at(-1)?.id, "slav");
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

  it("documents the five reserved hooks in White Systems / Black racks", () => {
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
    }
  });

  it("puts Grand Prix in Gambits as the locked semi-sharp, not Systems", () => {
    assert.equal(rackForOpeningId("grand-prix"), "white-gambits");
    assert.equal(rackForOpeningId("italian-attack"), "white-systems");
  });
});
