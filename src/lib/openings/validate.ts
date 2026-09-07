import { Chess } from "chess.js";
import type { Opening } from "./types";

function moveLabel(ply: number): string {
  const n = Math.floor(ply / 2) + 1;
  return ply % 2 === 0 ? `${n}.` : `${n}...`;
}

export function validateOpening(opening: Opening): void {
  const chess = new Chess();

  for (let i = 0; i < opening.moves.length; i++) {
    const san = opening.moves[i];
    try {
      const played = chess.move(san);
      if (!played) {
        throw new Error("null move");
      }
    } catch {
      throw new Error(
        `[${opening.id}] illegal ${san} at ply ${i} (${moveLabel(i)} ${san})\n${chess.pgn()}\n${chess.ascii()}`,
      );
    }
  }

  if (opening.moves.length < 20) {
    throw new Error(
      `[${opening.id}] only ${opening.moves.length} plies — need a playable middlegame handoff`,
    );
  }

  const covered = new Array<boolean>(opening.moves.length).fill(false);
  for (const chunk of opening.chunks) {
    const words = chunk.name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0 || words.length > 6) {
      throw new Error(
        `[${opening.id}] chunk "${chunk.name}" must be 1–6 words`,
      );
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
    throw new Error(
      `[${opening.id}] plies without a chunk: ${missing.join(", ")}`,
    );
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
  for (const opening of openings) validateOpening(opening);
}
