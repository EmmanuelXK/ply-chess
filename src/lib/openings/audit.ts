import { Chess } from "chess.js";
import ecoRaw from "./data/eco-subset.json";
import { isGambitSacrifice } from "./book";
import type { BookLine, Side } from "./types";

export const DROP_CP = 80;

const ecoSubset = ecoRaw as Record<string, { eco: string; name: string }>;

export function epdOf(fen: string): string {
  return fen.split(" ").slice(0, 4).join(" ");
}

function whiteScore(cp: number | null, mate: number | null): number {
  if (mate != null && mate !== 0) {
    const sign = mate > 0 ? 1 : -1;
    return sign * (100_000 - Math.min(Math.abs(mate), 99_999));
  }
  return cp ?? 0;
}

/** Positive means the user's side got worse, in centipawns. */
export function userDrop(
  before: { cp: number | null; mate: number | null },
  after: { cp: number | null; mate: number | null },
  side: Side,
): number {
  const left = whiteScore(before.cp, before.mate);
  const right = whiteScore(after.cp, after.mate);
  return side === "white" ? left - right : right - left;
}

export function deepestEco(moves: readonly string[]): { eco: string; name: string; ply: number } | null {
  const chess = new Chess();
  let found: { eco: string; name: string; ply: number } | null = null;
  for (let ply = 0; ply < moves.length; ply++) {
    const played = chess.move(moves[ply]);
    if (!played) return found;
    const hit = ecoSubset[epdOf(chess.fen())];
    if (hit) found = { eco: hit.eco, name: hit.name, ply };
  }
  return found;
}

/** Problems for one repertoire line. Empty means the line matches the book contract. */
export function auditLine(id: string, side: Side, line: BookLine): string[] {
  const problems: string[] = [];
  const label = `${id}/${line.id}`;
  const chess = new Chess();
  for (let ply = 0; ply < line.moves.length; ply++) {
    const san = line.moves[ply];
    try {
      const played = chess.move(san);
      if (!played) throw new Error("null");
      const expected = ply % 2 === 0 ? "w" : "b";
      if (played.color !== expected) {
        problems.push(`${label}: ${san} at ply ${ply} is the wrong side`);
      }
    } catch {
      problems.push(`${label}: illegal ${san} at ply ${ply}`);
      return problems;
    }
  }

  if (!line.eco?.eco || !line.eco.name?.trim()) {
    problems.push(`${label}: missing ECO name`);
  } else {
    const deepest = deepestEco(line.moves);
    if (!deepest) {
      problems.push(`${label}: no named ECO position in eco-subset`);
    } else if (deepest.eco !== line.eco.eco || deepest.name !== line.eco.name) {
      problems.push(
        `${label}: ECO ${line.eco.eco} ${line.eco.name} does not match deepest ${deepest.eco} ${deepest.name}`,
      );
    } else if (line.ecoPly !== deepest.ply) {
      problems.push(`${label}: ecoPly ${line.ecoPly} is not the deepest named ply ${deepest.ply}`);
    }
  }

  if (line.evals.length !== line.moves.length + 1) {
    problems.push(
      `${label}: ${line.evals.length} evals for ${line.moves.length} moves (expected ${line.moves.length + 1})`,
    );
  } else {
    line.evals.forEach((row, ply) => {
      if (!row || row.depth < 1) problems.push(`${label}: eval at ply ${ply} has no depth`);
      if (row.cp == null && (row.mate == null || row.mate === 0)) {
        problems.push(`${label}: eval at ply ${ply} has no score`);
      }
    });
  }

  for (const note of line.notes) {
    if (note.ply < 0 || note.ply >= line.moves.length) {
      problems.push(`${label}: note ply ${note.ply} is outside the line`);
      continue;
    }
    if (note.san !== line.moves[note.ply]) {
      problems.push(
        `${label}: note at ply ${note.ply} says ${note.san} but the move is ${line.moves[note.ply]}`,
      );
    }
    if (!note.text.trim()) problems.push(`${label}: empty note at ply ${note.ply}`);
  }

  if (line.evals.length === line.moves.length + 1) {
    for (let ply = 0; ply < line.moves.length; ply++) {
      const userMove = side === "white" ? ply % 2 === 0 : ply % 2 === 1;
      if (!userMove) continue;
      const drop = userDrop(line.evals[ply], line.evals[ply + 1], side);
      if (drop < DROP_CP) continue;
      const marked = line.flaggedDrops.some(
        (mark) =>
          mark.ply === ply &&
          (mark.san == null || mark.san === line.moves[ply]) &&
          isGambitSacrifice(mark),
      );
      if (!marked) {
        problems.push(
          `${label}: user move ${line.moves[ply]} at ply ${ply} drops ${(drop / 100).toFixed(2)} pawns`,
        );
      }
    }
  }

  return problems;
}
