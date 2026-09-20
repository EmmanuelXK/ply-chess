import { ATLAS } from "./catalog";
import type { AtlasEntry, AtlasSide } from "./types";

export interface AtlasTreeBranch {
  id: string;
  title: string;
  hint: string;
  entryIds: string[];
}

export interface AtlasTreeFamily {
  id: string;
  title: string;
  moves: string;
  blurb: string;
  branches: AtlasTreeBranch[];
}

/** Stylish world tree — every catalog id appears exactly once. */
export const ATLAS_TREE: AtlasTreeFamily[] = [
  {
    id: "open",
    title: "Open Games",
    moves: "1.e4 e5",
    blurb: "Files open. Pieces fly.",
    branches: [
      {
        id: "italian",
        title: "Italian",
        hint: "Bc4",
        entryIds: [
          "italian-game",
          "giuoco-piano",
          "two-knights",
          "fried-liver",
          "traxler",
          "evans-gambit",
          "hungarian",
        ],
      },
      {
        id: "scotch",
        title: "Scotch",
        hint: "d4",
        entryIds: ["scotch-game", "scotch-gambit", "four-knights-scotch"],
      },
      {
        id: "ruy",
        title: "Ruy Lopez",
        hint: "Bb5",
        entryIds: ["ruy-lopez", "ruy-berlin", "ruy-marshall", "ruy-exchange"],
      },
      {
        id: "kings-gambit",
        title: "King's Gambit",
        hint: "f4",
        entryIds: ["kings-gambit", "kga", "kgd"],
      },
      {
        id: "vienna",
        title: "Vienna",
        hint: "Nc3",
        entryIds: ["vienna", "vienna-gambit"],
      },
      {
        id: "other-open",
        title: "Other open",
        hint: "Petrov · Four Knights",
        entryIds: [
          "petrov",
          "four-knights",
          "ponziani",
          "philidor",
          "latvian",
          "elephant",
          "bishops-opening",
          "center-game",
          "danish",
        ],
      },
    ],
  },
  {
    id: "semi-open",
    title: "Semi-Open",
    moves: "1.e4 other",
    blurb: "Black declines the mirror.",
    branches: [
      {
        id: "sicilian-black",
        title: "Sicilian",
        hint: "…c5",
        entryIds: [
          "sicilian",
          "najdorf",
          "dragon",
          "accel-dragon",
          "classical-sicilian",
          "scheveningen",
          "sveshnikov",
          "taimanov",
          "kan",
        ],
      },
      {
        id: "sicilian-white",
        title: "vs Sicilian",
        hint: "White systems",
        entryIds: [
          "alapin",
          "smith-morra",
          "grand-prix",
          "closed-sicilian",
          "rossolimo",
          "moscow-sicilian",
          "open-sicilian",
          "yugoslav",
          "english-attack",
        ],
      },
      {
        id: "french",
        title: "French",
        hint: "…e6",
        entryIds: [
          "french",
          "french-winawer",
          "french-classical",
          "french-tarrasch",
          "french-advance",
          "french-exchange",
          "french-kia",
        ],
      },
      {
        id: "caro",
        title: "Caro-Kann",
        hint: "…c6",
        entryIds: [
          "caro-kann",
          "caro-classical",
          "caro-advance",
          "caro-fantasy",
          "caro-panov",
          "caro-two-knights",
          "caro-bronstein",
        ],
      },
      {
        id: "other-semi",
        title: "Other semi-open",
        hint: "Pirc · Scandi · Lion",
        entryIds: [
          "pirc",
          "modern",
          "alekhine",
          "scandinavian",
          "nimzowitsch-def",
          "owens",
          "black-lion",
        ],
      },
    ],
  },
  {
    id: "closed",
    title: "Closed Games",
    moves: "1.d4 d5",
    blurb: "Tension, then a break.",
    branches: [
      {
        id: "qg",
        title: "Queen's Gambit",
        hint: "c4",
        entryIds: [
          "qgd",
          "qgd-exchange",
          "qga",
          "tarrasch-def",
          "chigorin",
          "catalan",
        ],
      },
      {
        id: "slav",
        title: "Slav",
        hint: "…c6",
        entryIds: ["slav", "semi-slav", "slav-exchange", "semi-slav-meran"],
      },
      {
        id: "d4-systems",
        title: "d4 systems",
        hint: "London · Colle",
        entryIds: [
          "london",
          "jobava-london",
          "colle",
          "torre",
          "trompowsky",
          "veresov",
          "blackmar-diemer",
          "london-kid",
        ],
      },
    ],
  },
  {
    id: "indian",
    title: "Indian Defences",
    moves: "1.d4 Nf6",
    blurb: "Hypermodern answers.",
    branches: [
      {
        id: "kid",
        title: "King's Indian",
        hint: "…g6",
        entryIds: ["kings-indian", "kid-samisch", "kid-mdp"],
      },
      {
        id: "nimzo",
        title: "Nimzo family",
        hint: "…e6",
        entryIds: ["nimzo", "queens-indian", "bogo", "nimzo-rubinstein"],
      },
      {
        id: "grunfeld",
        title: "Grünfeld",
        hint: "…d5",
        entryIds: ["grunfeld", "grunfeld-ex"],
      },
      {
        id: "benoni",
        title: "Benoni & gambits",
        hint: "…c5",
        entryIds: [
          "modern-benoni",
          "czech-benoni",
          "benko",
          "budapest",
          "old-indian",
        ],
      },
      {
        id: "dutch",
        title: "Dutch",
        hint: "…f5",
        entryIds: ["dutch-leningrad", "dutch-stonewall", "dutch-classical"],
      },
    ],
  },
  {
    id: "flank",
    title: "Flank & Irregular",
    moves: "1.c4 · 1.Nf3 · odd",
    blurb: "From the wing, or a surprise.",
    branches: [
      {
        id: "english",
        title: "English",
        hint: "c4",
        entryIds: ["english", "english-sym", "english-botvinnik"],
      },
      {
        id: "other-flank",
        title: "Réti & flanks",
        hint: "Nf3 · f4 · b3",
        entryIds: ["reti", "kia", "birds", "larsen", "polish", "reti-kid"],
      },
      {
        id: "irregular",
        title: "Irregular",
        hint: "Rare first moves",
        entryIds: ["grob", "hippo", "st-george", "borg"],
      },
    ],
  },
];

const byId = new Map(ATLAS.map((entry) => [entry.id, entry]));

export function entryById(id: string): AtlasEntry | undefined {
  return byId.get(id);
}

export function treeLeafCount(family: AtlasTreeFamily) {
  return family.branches.reduce((n, b) => n + b.entryIds.length, 0);
}

export function entryMatchesQuery(entry: AtlasEntry, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    entry.name,
    entry.eco,
    entry.family,
    entry.kind,
    entry.moves,
    ...entry.routes.map((r) => `${r.name} ${r.note}`),
    entry.attacking,
    entry.positional,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export function sideDimmed(entry: AtlasEntry, side: AtlasSide | "all") {
  if (side === "all") return false;
  return !entry.sides.includes(side);
}

export function validateAtlasTree(entries: AtlasEntry[] = ATLAS) {
  const seen = new Set<string>();
  for (const family of ATLAS_TREE) {
    for (const branch of family.branches) {
      if (!branch.entryIds.length) {
        throw new Error(`[tree:${branch.id}] empty branch`);
      }
      for (const id of branch.entryIds) {
        if (seen.has(id)) throw new Error(`[tree] duplicate ${id}`);
        seen.add(id);
        if (!byId.has(id)) throw new Error(`[tree] unknown id ${id}`);
      }
    }
  }
  for (const entry of entries) {
    if (!seen.has(entry.id)) {
      throw new Error(`[tree] catalog ${entry.id} is not on the world tree`);
    }
  }
}
