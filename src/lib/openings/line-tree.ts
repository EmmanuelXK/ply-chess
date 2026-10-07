import type { Opening } from "./types";

export interface LineLeaf {
  ply: number;
  title: string;
}

export interface LineBranch {
  /** `null` is the spine (main line). */
  id: string | null;
  title: string;
  hint: string;
  leaves: LineLeaf[];
}

/** Repertoire branches for the drill menu — mainline first, then opponent lines. */
export function repertoireLineTree(opening: Opening): LineBranch[] {
  return opening.lines.map((line, index) => ({
    id: index === 0 ? null : line.id,
    title: index === 0 ? opening.shortName : line.label,
    hint: line.eco.name,
    leaves: [
      { ply: line.forkPly ?? 0, title: index === 0 ? "Main line" : "Branch" },
      { ply: line.moves.length, title: "Book ends" },
    ],
  }));
}
