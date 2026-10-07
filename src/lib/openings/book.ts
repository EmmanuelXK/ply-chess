import raw from "./data/weapons-v2.json";
import type { BookLine, BookNote, GambitMark, Opening } from "./types";

interface BookFile {
  weapons: Array<{
    id: string;
    name: string;
    category: string;
    side: "white" | "black";
    lines: BookLine[];
  }>;
}

export interface BookWeapon {
  id: string;
  name: string;
  category: "white-gambits" | "white-systems" | "black-gambits" | "black-systems";
  side: "white" | "black";
  lines: BookLine[];
}

const file = raw as BookFile;

export const weapons: BookWeapon[] = file.weapons.map((weapon) => ({
  id: weapon.id,
  name: weapon.name,
  category: weapon.category as BookWeapon["category"],
  side: weapon.side,
  lines: weapon.lines,
}));

const byId = new Map(weapons.map((weapon) => [weapon.id, weapon]));

export function weaponById(id: string): BookWeapon | undefined {
  return byId.get(id);
}

export function isGambitSacrifice(mark: GambitMark): boolean {
  if (mark.gambit === true || mark.sacrifice === true || mark.gambitSacrifice === true) {
    return true;
  }
  const text = `${mark.reason ?? ""} ${mark.label ?? ""} ${mark.kind ?? ""}`;
  return /gambit sacrifice/i.test(text);
}

/** Notes for a line. Shared plies are stored on the mainline only. */
export function notesForLine(line: BookLine, main: BookLine): BookNote[] {
  const own = line.notes.filter(
    (note) => note.ply >= 0 && note.ply < line.moves.length && note.san === line.moves[note.ply],
  );
  if (line.id === main.id) return own;
  const fork = line.forkPly ?? 0;
  const shared = main.notes.filter(
    (note) =>
      note.ply < fork &&
      note.ply < line.moves.length &&
      note.san === line.moves[note.ply] &&
      !own.some((row) => row.ply === note.ply),
  );
  return [...shared, ...own].sort((a, b) => a.ply - b.ply);
}

export function moveChip(ply: number, san: string): string {
  const n = Math.floor(ply / 2) + 1;
  return ply % 2 === 0 ? `${n}.${san}` : `${n}...${san}`;
}

export interface BranchChoice {
  lineId: string;
  san: string;
  chip: string;
  selected: boolean;
}

/** Opponent (or repertoire) alternatives at the position after `ply` moves. */
export function branchChoices(opening: Opening, ply: number): BranchChoice[] {
  const current =
    opening.lines.find(
      (line) =>
        line.moves.length === opening.moves.length &&
        line.moves.every((san, index) => san === opening.moves[index]),
    ) ?? opening.lines[0];
  if (!current || ply < 0) return [];
  const prefix = current.moves.slice(0, ply);
  const matches = opening.lines.filter(
    (line) => line.moves.length > ply && prefix.every((san, index) => line.moves[index] === san),
  );
  const seen = new Set<string>();
  const choices: BranchChoice[] = [];
  for (const line of matches) {
    const san = line.moves[ply];
    if (!san || seen.has(san)) continue;
    seen.add(san);
    const selected = current.moves[ply] === san;
    const owner = selected
      ? (matches.find((item) => item.id === current.id && item.moves[ply] === san) ?? line)
      : line;
    choices.push({
      lineId: owner.id,
      san,
      chip: moveChip(ply, san),
      selected,
    });
  }
  return choices.length > 1 ? choices : [];
}

export function activeLine(opening: Opening): BookLine | undefined {
  return (
    opening.lines.find(
      (line) =>
        line.moves.length === opening.moves.length &&
        line.moves.every((san, index) => san === opening.moves[index]),
    ) ?? opening.lines[0]
  );
}

export function sharedPrefixLength(left: readonly string[], right: readonly string[]): number {
  let index = 0;
  while (index < left.length && index < right.length && left[index] === right[index]) index += 1;
  return index;
}
