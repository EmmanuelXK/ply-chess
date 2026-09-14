import type { Family, Opening, Side } from "./types";

/**
 * Home information architecture — four racks on one page.
 * Mapping is by opening id (canonical + aliases in OPENING_ID_ALIASES).
 *
 *   alapin, english, queens-gambit  → White · Systems
 *   caro-kann                       → Black · vs 1.e4
 *   slav                            → Black · vs 1.d4
 *   grand-prix                      → White · Gambits (semi-sharp)
 */
export type RackId =
  | "white-gambits"
  | "white-systems"
  | "black-e4"
  | "black-d4";

export const RACK_ORDER: readonly RackId[] = [
  "white-gambits",
  "white-systems",
  "black-e4",
  "black-d4",
] as const;

export const RACK_META: Record<
  RackId,
  { title: string; kicker: string; label: string; blurb: string }
> = {
  "white-gambits": {
    title: "White · Gambits",
    kicker: "White",
    label: "Gambits",
    blurb: "Open files. Semi-sharp sits here too.",
  },
  "white-systems": {
    title: "White · Systems",
    kicker: "White",
    label: "Systems",
    blurb: "Same setups, every game.",
  },
  "black-e4": {
    title: "Black · vs 1.e4",
    kicker: "Black",
    label: "vs 1.e4",
    blurb: "They open the king file.",
  },
  "black-d4": {
    title: "Black · vs 1.d4",
    kicker: "Black",
    label: "vs 1.d4",
    blurb: "They want the queen file.",
  },
};

/** Canonical ids for the five systems that slot into the locked racks. */
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

/**
 * Display order per rack. Reserved ids stay in the list so they slot in
 * the moment their specs exist — no Home rewrite required.
 */
export const RACK_SEQUENCE: Record<RackId, readonly string[]> = {
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
    "alapin",
    "english",
    "queens-gambit",
  ],
  "black-e4": [
    "black-lion",
    "pirc",
    "dragon",
    "scandinavian",
    "alekhine",
    "caro-kann",
  ],
  "black-d4": [
    "kings-indian",
    "modern-benoni",
    "benko",
    "dutch-leningrad",
    "budapest",
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
  if (hint?.family === "black-e4") return "black-e4";
  if (hint?.family === "black-d4") return "black-d4";
  if (hint?.side === "black") return "black-e4";
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
