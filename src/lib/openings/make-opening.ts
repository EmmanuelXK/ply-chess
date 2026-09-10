import { Chess } from "chess.js";
import { spines } from "./spines";
import type {
  BookChunk,
  Chunk,
  CoachLine,
  Opening,
  OpeningSpec,
  Pin,
  StoryBeat,
  Trap,
  TrapSpec,
} from "./types";
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

function clampMeta<T extends { afterPly: number }>(
  rows: T[],
  lastPly: number,
  keepStart = false,
): T[] {
  return rows.map((row) =>
    keepStart && row.afterPly === -1
      ? row
      : { ...row, afterPly: Math.min(Math.max(0, row.afterPly), lastPly) },
  );
}

function takeChunks(book: BookChunk[], spineLen: number): BookChunk[] {
  let used = 0;
  const out: BookChunk[] = [];
  for (const [plies, name, job] of book) {
    const left = spineLen - used;
    if (left <= 0) break;
    const take = Math.min(plies, left);
    if (take > 0) out.push([take, name, job]);
    used += take;
  }
  return out;
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

function compileTrap(spec: TrapSpec, openingId: string): Trap {
  const moves = parseSanLine(spec.san, `${openingId}/${spec.id}`);
  const shotPly = Math.min(Math.max(0, spec.shotPly), moves.length - 1);
  return {
    id: spec.id,
    name: spec.name,
    blurb: spec.blurb,
    shotPly,
    coach: spec.coach,
    moves,
  };
}

export function makeOpening(spec: OpeningSpec): Opening {
  const moves = spines[spec.id];
  if (!moves?.length) throw new Error(`missing spine for ${spec.id}`);

  const book = takeChunks(spec.bookChunks, moves.length);
  const taggedPlies = book.reduce((sum, [n]) => sum + n, 0);
  const leftover = moves.length - taggedPlies;
  const tail: BookChunk[] = [];
  if (leftover > 0) {
    const first = Math.min(leftover, Math.max(8, Math.ceil(leftover / 2)));
    const rest = leftover - first;
    tail.push([first, "System complete", "Setup is done. Play the plan."]);
    if (rest > 0) {
      tail.push([rest, "Play the plan", "Don't donate pieces. Use the pillars."]);
    }
  }

  const lastPly = moves.length - 1;
  const modelFromPly = Math.min(Math.max(0, spec.modelFromPly), lastPly);

  const opening: Opening = {
    id: spec.id,
    name: spec.name,
    shortName: spec.shortName,
    side: spec.side,
    family: spec.family,
    versus: spec.versus,
    blurb: spec.blurb,
    story: spec.story,
    moves,
    modelFromPly,
    chunks: toChunks(moves.length, [...book, ...tail]),
    pins: clampMeta<Pin>(spec.pins, lastPly),
    storyBeats: clampMeta<StoryBeat>(spec.storyBeats, lastPly),
    coach: clampMeta<CoachLine>(spec.coach, lastPly, true),
    traps: spec.traps.map((trap) => compileTrap(trap, spec.id)),
    pillars: spec.pillars,
    plans: spec.plans,
    depthNote: spec.depthNote,
    professor: [],
    quizzes: [],
  };

  return enrichOpening(opening);
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

  return enrichOpening({
    ...opening,
    id: `${opening.id}--${trap.id}`,
    name: `${opening.shortName} · ${trap.name}`,
    shortName: trap.name,
    blurb: trap.blurb,
    moves: trap.moves,
    modelFromPly: shot,
    chunks,
    pins: [{ afterPly: shot, label: `at the ${trap.name}…` }],
    storyBeats: [{ afterPly: shot, beat: trap.coach }],
    coach: [
      { afterPly: -1, text: trap.blurb },
      { afterPly: shot, text: trap.coach },
    ],
    traps: [],
    depthNote: `Trap off ${opening.name}. Spine stays the main drill.`,
    professor: [],
    quizzes: [],
  });
}
