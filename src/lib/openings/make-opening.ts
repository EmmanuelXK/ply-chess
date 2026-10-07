import { Chess } from "chess.js";
import { notesForLine, weaponById } from "./book";
import type {
  BookChunk,
  Chunk,
  Opening,
  OpeningSpec,
  Trap,
} from "./types";
import { applyConceptCopy } from "./concept-copy";
import { enrichOpening } from "./professor";

const RESULTS = new Set(["1-0", "0-1", "1/2-1/2", "*"]);

export function parseSanLine(san: string, label = "line"): string[] {
  const tokens = san
    .replace(/\{[^}]*\}/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\$\d+/g, " ")
    .replace(/\d+\.(\.\.)?/g, " ")
    .replace(/[!?]+/g, "")
    .trim()
    .split(/\s+/)
    .filter((t) => t && !RESULTS.has(t));

  const chess = new Chess();
  const moves: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    try {
      const played = chess.move(tokens[i]);
      if (!played) throw new Error("null move");
      moves.push(played.san);
    } catch {
      const n = Math.floor(i / 2) + 1;
      const mark = i % 2 === 0 ? `${n}.` : `${n}...`;
      throw new Error(
        `[${label}] illegal ${tokens[i]} at ply ${i} (${mark} ${tokens[i]})\n${chess.ascii()}\nlegal: ${chess.moves().join(" ")}`,
      );
    }
  }
  return moves;
}

function toChunks(totalPlies: number, tagged: BookChunk[]): Chunk[] {
  let ply = 0;
  const chunks = tagged.map(([plies, name, job]) => {
    if (plies < 1) throw new Error(`chunk "${name}" has empty range`);
    const chunk: Chunk = {
      fromPly: ply,
      toPly: ply + plies - 1,
      name,
      job,
    };
    ply += plies;
    return chunk;
  });
  const last = chunks.at(-1);
  if (!last || last.toPly !== totalPlies - 1) {
    throw new Error(
      `chunk coverage ends at ply ${last?.toPly ?? -1}, expected ${totalPlies - 1}`,
    );
  }
  return chunks;
}

function bookChunk(moves: string[]): Chunk {
  const last = Math.max(0, moves.length - 1);
  return {
    fromPly: 0,
    toPly: last,
    name: "Book line",
    job: "Follow this book line to the end.",
  };
}

export function makeOpening(spec: OpeningSpec): Opening {
  const weapon = weaponById(spec.id);
  if (!weapon) throw new Error(`missing book for ${spec.id}`);
  const main = weapon.lines[0];
  if (!main?.moves.length) throw new Error(`missing mainline for ${spec.id}`);
  const notes = notesForLine(main, main);
  const lastPly = main.moves.length - 1;

  const opening: Opening = {
    id: spec.id,
    name: spec.name,
    shortName: spec.shortName,
    side: weapon.side,
    family: spec.family,
    versus: spec.versus,
    blurb: spec.blurb,
    story: spec.story,
    moves: main.moves,
    evals: main.evals,
    notes,
    lines: weapon.lines,
    modelFromPly: lastPly,
    chunks: toChunks(main.moves.length, [[main.moves.length, "Book line", "Follow this book line to the end."]]),
    pins: [],
    storyBeats: [],
    coach: notes.map((note) => ({ afterPly: note.ply, text: note.text })),
    traps: [],
    pillars: spec.pillars,
    plans: spec.plans,
    professor: [],
    quizzes: [],
    history: [],
  };

  const compiled = enrichOpening(applyConceptCopy(opening));
  return { ...compiled, history: [], pins: [], storyBeats: [], traps: [] };
}

/** The same weapon, following one stored line. Shared notes come from the mainline. */
export function openingOnLine(opening: Opening, lineId: string | null): Opening {
  const main = opening.lines[0];
  if (!main) return opening;
  const line = !lineId || lineId === main.id ? main : (opening.lines.find((item) => item.id === lineId) ?? main);
  const same =
    opening.moves.length === line.moves.length &&
    opening.moves.every((san, index) => san === line.moves[index]);
  if (same) return opening;
  const notes = notesForLine(line, main);
  const last = line.moves.length - 1;
  return {
    ...opening,
    moves: line.moves,
    evals: line.evals,
    notes,
    coach: notes.map((note) => ({ afterPly: note.ply, text: note.text })),
    chunks: [bookChunk(line.moves)],
    pins: [],
    storyBeats: [],
    traps: [],
    history: [],
    professor: [],
    quizzes: [],
    depthNote: undefined,
    modelFromPly: last,
  };
}

export function openingFromTrap(
  opening: Opening,
  trap: Trap,
): Opening {
  const last = trap.moves.length - 1;
  const shot = Math.min(Math.max(0, trap.shotPly), last);
  const chunks: Chunk[] = [
    { fromPly: 0, toPly: shot, name: trap.name, job: trap.blurb },
  ];
  if (shot < last) {
    chunks.push({
      fromPly: shot + 1,
      toPly: last,
      name: "Cash the shot",
      job: "Convert. Don't get cute.",
    });
  }

  return enrichOpening(applyConceptCopy({
    ...opening,
    id: `${opening.id}--${trap.id}`,
    name: `${opening.shortName} · ${trap.name}`,
    shortName: trap.name,
    blurb: trap.blurb,
    moves: trap.moves,
    evals: [],
    notes: [],
    modelFromPly: shot,
    chunks,
    pins: [],
    storyBeats: [],
    coach: [],
    traps: [],
    depthNote: undefined,
    professor: [],
    quizzes: [],
    history: [],
  }));
}
