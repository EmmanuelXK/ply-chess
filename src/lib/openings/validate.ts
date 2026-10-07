import { auditLine } from "./audit";
import type { Opening } from "./types";

export function validateOpening(opening: Opening): void {
  if (!opening.lines.length) throw new Error(`[${opening.id}] missing repertoire lines`);
  const main = opening.lines[0];
  if (!main.main) throw new Error(`[${opening.id}] lines[0] must be the mainline`);
  if (main.moves.join(" ") !== opening.moves.join(" ")) {
    throw new Error(`[${opening.id}] mainline moves do not match the weapon line`);
  }
  const problems = opening.lines.flatMap((line) => auditLine(opening.id, opening.side, line));
  if (problems.length) throw new Error(problems.join("\n"));

  const covered = new Array<boolean>(opening.moves.length).fill(false);
  for (const chunk of opening.chunks) {
    const words = chunk.name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0 || words.length > 6) {
      throw new Error(`[${opening.id}] chunk "${chunk.name}" must be 1–6 words`);
    }
    if (
      chunk.fromPly < 0 ||
      chunk.toPly >= opening.moves.length ||
      chunk.fromPly > chunk.toPly
    ) {
      throw new Error(
        `[${opening.id}] bad chunk range ${chunk.fromPly}-${chunk.toPly}`,
      );
    }
    for (let p = chunk.fromPly; p <= chunk.toPly; p++) covered[p] = true;
  }

  const missing = covered
    .map((ok, i) => (ok ? -1 : i))
    .filter((i) => i >= 0);
  if (missing.length) {
    throw new Error(`[${opening.id}] plies without a chunk: ${missing.join(", ")}`);
  }

  for (const pin of opening.pins) {
    if (pin.afterPly < 0 || pin.afterPly >= opening.moves.length) {
      throw new Error(`[${opening.id}] pin afterPly out of range`);
    }
  }
  for (const beat of opening.storyBeats) {
    if (beat.afterPly < 0 || beat.afterPly >= opening.moves.length) {
      throw new Error(`[${opening.id}] story beat afterPly out of range`);
    }
  }
  for (const line of opening.coach) {
    if (line.afterPly < -1 || line.afterPly >= opening.moves.length) {
      throw new Error(`[${opening.id}] coach afterPly out of range`);
    }
  }
}

export function validateAll(openings: Opening[]): void {
  const ids = new Set<string>();
  for (const opening of openings) {
    if (ids.has(opening.id)) throw new Error(`duplicate opening id ${opening.id}`);
    ids.add(opening.id);
    validateOpening(opening);
  }
  if (openings.length !== 24) {
    throw new Error(`expected 24 weapons, got ${openings.length}`);
  }
  if (openings.some((opening) => opening.id === "kings-gambit" || opening.id === "italian-attack")) {
    throw new Error("kings-gambit and italian-attack are not weapons");
  }
}
