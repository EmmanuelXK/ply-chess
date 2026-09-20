export type AtlasFamily =
  | "open"
  | "semi-open"
  | "closed"
  | "indian"
  | "flank"
  | "irregular";

export type AtlasKind = "system" | "semi";
export type AtlasSide = "white" | "black";

export interface AtlasRoute {
  name: string;
  /** SAN continuation after the entry's starting moves. */
  san: string;
  note: string;
}

export interface AtlasEntry {
  id: string;
  name: string;
  eco: string;
  family: AtlasFamily;
  kind: AtlasKind;
  sides: AtlasSide[];
  /** Space-separated SAN from the start position. */
  moves: string;
  routes: AtlasRoute[];
  /** Club-level attacking idea (~1250). */
  attacking: string;
  /** Club-level positional idea (~1250). */
  positional: string;
  /** Existing drill id when this atlas case is in the repertoire. */
  trainId?: string;
}

export const ATLAS_FAMILY_META: Record<
  AtlasFamily,
  { title: string; blurb: string }
> = {
  open: { title: "Open games", blurb: "1.e4 e5. Files open. Pieces fly." },
  "semi-open": {
    title: "Semi-open",
    blurb: "1.e4, Black declines the mirror.",
  },
  closed: { title: "Closed games", blurb: "1.d4 d5. Tension, then a break." },
  indian: { title: "Indian defences", blurb: "1.d4 Nf6. Hypermodern answers." },
  flank: { title: "Flank openings", blurb: "c-pawn, knight, or a quiet wing." },
  irregular: { title: "Irregular", blurb: "Rare first moves. Know the idea." },
};
