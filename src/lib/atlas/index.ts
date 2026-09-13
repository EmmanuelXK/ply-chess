import { ATLAS } from "./catalog";
import type { AtlasEntry, AtlasFamily, AtlasSide } from "./types";

export type {
  AtlasEntry,
  AtlasFamily,
  AtlasKind,
  AtlasRoute,
  AtlasSide,
} from "./types";
export { ATLAS_FAMILY_META } from "./types";
export { ATLAS } from "./catalog";

export const ATLAS_FAMILIES: AtlasFamily[] = [
  "open",
  "semi-open",
  "closed",
  "indian",
  "flank",
  "irregular",
];

export function atlasById(id: string): AtlasEntry | undefined {
  return ATLAS.find((entry) => entry.id === id);
}

export function filterAtlas({
  query = "",
  side,
  family,
}: {
  query?: string;
  side?: AtlasSide | "all";
  family?: AtlasFamily | "all";
}): AtlasEntry[] {
  const q = query.trim().toLowerCase();
  return ATLAS.filter((entry) => {
    if (side && side !== "all" && !entry.sides.includes(side)) return false;
    if (family && family !== "all" && entry.family !== family) return false;
    if (!q) return true;
    const hay = [
      entry.name,
      entry.eco,
      entry.family,
      entry.kind,
      entry.moves,
      ...entry.routes.map((r) => r.name),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function groupAtlas(entries: AtlasEntry[]) {
  const groups: { family: AtlasFamily; entries: AtlasEntry[] }[] = [];
  for (const family of ATLAS_FAMILIES) {
    const rows = entries.filter((e) => e.family === family);
    if (rows.length) groups.push({ family, entries: rows });
  }
  return groups;
}
