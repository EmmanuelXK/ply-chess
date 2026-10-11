import type { Opening } from "./types";

export interface LineLeaf {
  ply: number;
  title: string;
}

export interface LineBranch {
  /** `null` is the spine (main line). */
  id: string | null;
  /** Nickname, the prominent name in the chooser. */
  title: string;
  nickname: string;
  /** Matchup label, shown beside the nickname. */
  matchup: string;
  /** Official ECO name, small secondary text. */
  hint: string;
  ecoName: string;
  leaves: LineLeaf[];
}

/** Repertoire branches for the drill menu — mainline first, then opponent lines. */
export function repertoireLineTree(opening: Opening): LineBranch[] {
  return opening.lines.map((line, index) => ({
    id: index === 0 ? null : line.id,
    title: line.nickname,
    nickname: line.nickname,
    matchup: line.matchup,
    hint: line.ecoName || `${line.eco.eco} ${line.eco.name}`,
    ecoName: line.ecoName || `${line.eco.eco} ${line.eco.name}`,
    leaves: [
      { ply: line.forkPly ?? 0, title: index === 0 ? "Main line" : "Branch" },
      { ply: line.moves.length, title: "Book ends" },
    ],
  }));
}
