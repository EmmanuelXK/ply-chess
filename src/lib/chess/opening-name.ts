import { Chess } from "chess.js";
import ecoRaw from "@/lib/openings/data/eco-subset.json";
import { epdOf } from "@/lib/openings/audit";

const ecoSubset = ecoRaw as Record<string, { eco: string; name: string }>;

/** Deepest named position in the shipped ECO subset, along this move list. */
export function openingName(
  startFen: string,
  moves: readonly string[],
): { eco: string; name: string; ply: number } | null {
  let chess: Chess;
  try {
    chess = new Chess(startFen);
  } catch {
    return null;
  }
  let found: { eco: string; name: string; ply: number } | null = null;
  for (let ply = 0; ply < moves.length; ply++) {
    try {
      const played = chess.move(moves[ply]);
      if (!played) break;
    } catch {
      break;
    }
    const hit = ecoSubset[epdOf(chess.fen())];
    if (hit) found = { eco: hit.eco, name: hit.name, ply };
  }
  return found;
}
