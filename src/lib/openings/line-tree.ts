import { openingFromTrap } from "./make-opening";
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

/** Repertoire branches for the drill sandwich menu — spine plus trap pack. */
export function repertoireLineTree(opening: Opening): LineBranch[] {
  return [
    {
      id: null,
      title: opening.shortName,
      hint: "Main line to move 21",
      leaves: opening.chunks.map((chunk) => ({
        ply: chunk.fromPly,
        title: chunk.name,
      })),
    },
    ...opening.traps.map((trap) => {
      const line = openingFromTrap(opening, trap);
      return {
        id: trap.id,
        title: trap.name,
        hint: trap.blurb,
        leaves: line.chunks.map((chunk) => ({
          ply: chunk.fromPly,
          title: chunk.name,
        })),
      };
    }),
  ];
}
