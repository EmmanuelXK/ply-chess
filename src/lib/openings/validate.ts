import { Chess } from "chess.js";
import { fingerprints } from "./fingerprints";
import type { Opening } from "./types";

function moveLabel(ply: number): string {
  const n = Math.floor(ply / 2) + 1;
  return ply % 2 === 0 ? `${n}.` : `${n}...`;
}

export function assertLegalSans(id: string, moves: string[]): void {
  const chess = new Chess();
  for (let i = 0; i < moves.length; i++) {
    const san = moves[i];
    try {
      const played = chess.move(san);
      if (!played) throw new Error("null move");
    } catch {
      throw new Error(
        `[${id}] illegal ${san} at ply ${i} (${moveLabel(i)} ${san})\n${chess.pgn()}\n${chess.ascii()}`,
      );
    }
  }
}

export function validateOpening(opening: Opening): void {
  assertLegalSans(opening.id, opening.moves);

  if (opening.moves.length < 40 || opening.moves.length > 44) {
    throw new Error(
      `[${opening.id}] ${opening.moves.length} plies — Phase 1 spines are the opening system only: 21 full moves (40–44 plies), then Plan mode.`,
    );
  }

  const fp = fingerprints[opening.id];
  if (!fp?.length) {
    throw new Error(
      `[${opening.id}] add a fingerprints entry so the spine stays the named system`,
    );
  }
  for (let i = 0; i < fp.length; i++) {
    if (opening.moves[i] !== fp[i]) {
      throw new Error(
        `[${opening.id}] fingerprint miss at ply ${i}: expected ${fp.join(" ")}, got ${opening.moves.slice(0, fp.length).join(" ")}`,
      );
    }
  }

  const head = opening.moves.slice(0, 12);
  if (opening.id === "london") {
    if (head.includes("Nc3")) {
      throw new Error("[london] Nc3 in the first 12 plies — that's Jobava. Keep c3.");
    }
    if (!head.includes("c3")) {
      throw new Error("[london] missing c3 — the triangle needs it.");
    }
  }
  if (opening.id === "jobava-london" && !head.includes("Nc3")) {
    throw new Error("[jobava-london] missing Nc3 — that's the Jobava tell.");
  }

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
  for (const trap of opening.traps) {
    assertLegalSans(`${opening.id}/${trap.id}`, trap.moves);
  }
  if (opening.quizzes.length === 0) {
    throw new Error(`[${opening.id}] missing positional quizzes`);
  }
  if (opening.professor.length === 0) {
    throw new Error(`[${opening.id}] missing professor scripts`);
  }

  const historyIds = new Set<string>();
  if (opening.history.length === 0) {
    throw new Error(`[${opening.id}] missing history milestones`);
  }
  for (const row of opening.history) {
    if (historyIds.has(row.id)) {
      throw new Error(`[${opening.id}] duplicate history id ${row.id}`);
    }
    historyIds.add(row.id);
    if (row.openingId !== opening.id && !opening.id.startsWith(`${row.openingId}--`)) {
      throw new Error(`[${opening.id}] history ${row.id} has openingId ${row.openingId}`);
    }
    if (!row.sources.length) {
      throw new Error(`[${opening.id}] history ${row.id} needs a source URL`);
    }
    for (const src of row.sources) {
      if (!/^https:\/\//.test(src.url)) {
        throw new Error(`[${opening.id}] history ${row.id} source is not https: ${src.url}`);
      }
    }
    if (typeof row.plyOrFen === "number") {
      if (row.plyOrFen < 0 || row.plyOrFen > opening.moves.length) {
        throw new Error(
          `[${opening.id}] history ${row.id} ply ${row.plyOrFen} out of range`,
        );
      }
    } else {
      try {
        new Chess(row.plyOrFen);
      } catch {
        throw new Error(`[${opening.id}] history ${row.id} has a bad FEN`);
      }
    }
    if (row.summary.trim().length < 120) {
      throw new Error(`[${opening.id}] history ${row.id} summary is too short`);
    }
    if (row.whyItMattersHere.trim().length < 40) {
      throw new Error(`[${opening.id}] history ${row.id} whyItMattersHere is too short`);
    }
  }
  for (const script of opening.professor) {
    const lesson = script.whyLesson;
    if (!lesson?.branch?.length) continue;
    const g = new Chess();
    for (const san of opening.moves.slice(0, lesson.startPly)) {
      try {
        if (!g.move(san)) throw new Error("null");
      } catch {
        throw new Error(
          `[${opening.id}] Why "${lesson.title}" startPly ${lesson.startPly} is illegal`,
        );
      }
    }
    for (const ply of lesson.branch) {
      try {
        if (!g.move(ply.san)) throw new Error("null");
      } catch {
        throw new Error(`[${opening.id}] Why "${lesson.title}" illegal branch SAN ${ply.san}`);
      }
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
  if (openings.length !== 21) {
    throw new Error(`expected 21 systems, got ${openings.length}`);
  }
  const covered = new Set(openings.map((o) => o.id));
  const packIds = new Set(
    openings.flatMap((o) => o.history.map((h) => h.openingId)),
  );
  for (const id of covered) {
    if (!packIds.has(id)) {
      throw new Error(`[${id}] compiled without history`);
    }
  }
}
