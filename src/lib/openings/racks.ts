import type { Family, Opening, Side } from "./types";

/**
 * Home information architecture — four racks on one page.
 * Membership follows the prepared repertoire: gambits and systems, both colors.
 */
export type RackId =
  | "white-gambits"
  | "white-systems"
  | "black-gambits"
  | "black-systems";

export const RACK_ORDER: readonly RackId[] = [
  "white-gambits",
  "white-systems",
  "black-gambits",
  "black-systems",
] as const;

export const RACK_META: Record<
  RackId,
  { title: string; kicker: string; label: string; blurb: string }
> = {
  "white-gambits": {
    title: "White Gambits",
    kicker: "White",
    label: "Gambits",
    blurb: "Open files. Give a pawn for time.",
  },
  "white-systems": {
    title: "White Systems",
    kicker: "White",
    label: "Systems",
    blurb: "Same setups, every game.",
  },
  "black-gambits": {
    title: "Black Gambits",
    kicker: "Black",
    label: "Gambits",
    blurb: "Give a pawn. Take the file.",
  },
  "black-systems": {
    title: "Black Systems",
    kicker: "Black",
    label: "Systems",
    blurb: "A setup against their center.",
  },
};

/** Canonical ids for the five systems added on this cut. */
export const RESERVED_OPENING_IDS = [
  "alapin",
  "english",
  "queens-gambit",
  "caro-kann",
  "slav",
] as const;

export type ReservedOpeningId = (typeof RESERVED_OPENING_IDS)[number];

/** Spec ids a parallel PR might choose instead of the canonical reserved id. */
export const OPENING_ID_ALIASES: Record<string, ReservedOpeningId> = {
  qg: "queens-gambit",
  qgd: "queens-gambit",
  "queens-gambit-declined": "queens-gambit",
  "queen-gambit": "queens-gambit",
  caro: "caro-kann",
  "caro-kann-black": "caro-kann",
  "english-opening": "english",
  "alapin-sicilian": "alapin",
  "sicilian-alapin": "alapin",
};

export function canonicalOpeningId(id: string): string {
  return OPENING_ID_ALIASES[id] ?? id;
}

/** Display order per rack. Home tiles follow this sequence when the spec exists. */
export const RACK_SEQUENCE: Record<RackId, readonly string[]> = {
  "white-gambits": ["evans-gambit", "scotch-gambit", "vienna-gambit", "smith-morra"],
  "white-systems": [
    "london",
    "jobava-london",
    "french-kia",
    "caro-fantasy",
    "grand-prix",
    "alapin",
    "english",
    "queens-gambit",
  ],
  "black-gambits": ["benko", "budapest"],
  "black-systems": [
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
};

const rackById = new Map<string, RackId>();
for (const rack of RACK_ORDER) {
  for (const id of RACK_SEQUENCE[rack]) {
    rackById.set(id, rack);
  }
}
for (const [alias, canonical] of Object.entries(OPENING_ID_ALIASES)) {
  const rack = rackById.get(canonical);
  if (rack) rackById.set(alias, rack);
}

export type Rackable = {
  id: string;
  family?: Family;
  side?: Side;
};

export function rackForOpeningId(
  id: string,
  hint?: Pick<Rackable, "family" | "side">,
): RackId {
  const mapped = rackById.get(id) ?? rackById.get(canonicalOpeningId(id));
  if (mapped) return mapped;
  if (hint?.family === "black-e4" || hint?.family === "black-d4" || hint?.side === "black") {
    return "black-systems";
  }
  return "white-systems";
}

export function rackForOpening(opening: Rackable): RackId {
  return rackForOpeningId(opening.id, opening);
}

function aliasesOf(canonical: string): string[] {
  return Object.entries(OPENING_ID_ALIASES)
    .filter(([, target]) => target === canonical)
    .map(([alias]) => alias);
}

export function openingsInRack<T extends Rackable>(
  rack: RackId,
  catalog: readonly T[],
): T[] {
  const present = new Map(catalog.map((item) => [item.id, item]));
  const ordered: T[] = [];
  const seen = new Set<string>();

  for (const id of RACK_SEQUENCE[rack]) {
    for (const key of [id, ...aliasesOf(id)]) {
      const item = present.get(key);
      if (item && !seen.has(item.id)) {
        ordered.push(item);
        seen.add(item.id);
      }
    }
  }

  for (const item of catalog) {
    if (seen.has(item.id)) continue;
    if (rackForOpening(item) === rack) {
      ordered.push(item);
      seen.add(item.id);
    }
  }

  return ordered;
}

export interface WeaponRack<T extends Rackable = Opening> {
  id: RackId;
  title: string;
  kicker: string;
  label: string;
  blurb: string;
  openings: T[];
}

export function weaponRacks<T extends Rackable>(
  catalog: readonly T[],
): WeaponRack<T>[] {
  return RACK_ORDER.map((id) => ({
    id,
    ...RACK_META[id],
    openings: openingsInRack(id, catalog),
  })).filter((rack) => rack.openings.length > 0);
}
