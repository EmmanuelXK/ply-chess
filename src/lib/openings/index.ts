import { blackLion } from "./black-lion";
import { london } from "./london";
import { pirc } from "./pirc";
import type { Opening } from "./types";
import { validateAll } from "./validate";

export type { Opening, Side, PlanVoice, Chunk, Pin, StoryBeat } from "./types";

export const openings: Opening[] = [london, pirc, blackLion];

validateAll(openings);

const byId = new Map(openings.map((o) => [o.id, o]));

export function getOpening(id: string): Opening | undefined {
  return byId.get(id);
}

export function isUserPly(side: Opening["side"], ply: number): boolean {
  return side === "white" ? ply % 2 === 0 : ply % 2 === 1;
}

export function chunkAt(opening: Opening, ply: number) {
  return opening.chunks.find((c) => ply >= c.fromPly && ply <= c.toPly);
}

export function fullMoveCount(opening: Opening): number {
  return Math.ceil(opening.moves.length / 2);
}
