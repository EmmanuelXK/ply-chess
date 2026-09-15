import { Chess, type Move, type Square } from "chess.js";
import { SHORT_HOOKS, spokenHook } from "@/lib/dialogue/hooks";
import { stripMoveDumpLead } from "@/lib/dialogue/short";
import { materialCp } from "@/lib/engines/heuristic";
import { chunkAt } from "@/lib/openings/helpers";
import { isKeyPly } from "@/lib/openings/key-ply";
import { professorAt } from "@/lib/openings/professor";
import type { Opening } from "@/lib/openings/types";
import type { LessonFacts } from "@/lib/dialogue/types";
import {
  engineConsensus,
  singlePathAnalyzer,
  stubAnalyzer,
  teachingPv,
} from "./engine";
import type {
  CandidateMove,
  CompressDecision,
  HumanLayer,
  MoveClass,
  PositionUnderstanding,
  TeachingPly,
} from "./types";

const CENTER = new Set(["d4", "d5", "e4", "e5", "c4", "c5", "f4", "f5"]);
const FILES = "abcdefgh";

function pieceValue(type: string): number {
  switch (type) {
    case "p":
      return 100;
    case "n":
    case "b":
      return 320;
    case "r":
      return 500;
    case "q":
      return 900;
    default:
      return 0;
  }
}

function hookFor(opening: Opening, afterPly: number) {
  return SHORT_HOOKS[opening.id]?.find((row) => row.ply === afterPly);
}

function nearestHook(opening: Opening, afterPly: number) {
  const rows = SHORT_HOOKS[opening.id] ?? [];
  const exact = rows.find((row) => row.ply === afterPly);
  if (exact) return exact;
  return [...rows]
    .filter((row) => row.ply <= afterPly)
    .sort((a, b) => b.ply - a.ply)[0];
}

function kingSquare(chess: Chess, color: "w" | "b"): Square | undefined {
  for (const row of chess.board()) {
    for (const piece of row) {
      if (piece?.type === "k" && piece.color === color) return piece.square;
    }
  }
  return undefined;
}

function fileOpenness(chess: Chess): string[] {
  const notes: string[] = [];
  for (const file of FILES) {
    let pawns = 0;
    for (let rank = 1; rank <= 8; rank++) {
      const piece = chess.get(`${file}${rank}` as Square);
      if (piece?.type === "p") pawns += 1;
    }
    if (pawns === 0) notes.push(`${file}-file open`);
    else if (pawns === 1) notes.push(`${file}-file half-open`);
  }
  return notes.slice(0, 3);
}

function diagNotes(chess: Chess): string[] {
  const notes: string[] = [];
  for (const row of chess.board()) {
    for (const piece of row) {
      if (piece?.type === "b") {
        notes.push(`${piece.color === "w" ? "White" : "Black"} bishop on ${piece.square}`);
      }
    }
  }
  return notes.slice(0, 4);
}

function weakSquares(chess: Chess): string[] {
  const holes: string[] = [];
  for (const color of ["w", "b"] as const) {
    const dir = color === "w" ? 1 : -1;
    const pawnFiles = new Set<string>();
    for (const row of chess.board()) {
      for (const piece of row) {
        if (piece?.type === "p" && piece.color === color) {
          pawnFiles.add(piece.square[0]);
        }
      }
    }
    for (const file of FILES) {
      const idx = FILES.indexOf(file);
      const neighbors = [FILES[idx - 1], FILES[idx + 1]].filter(Boolean);
      const covered = neighbors.some((n) => pawnFiles.has(n));
      if (!covered && pawnFiles.size) {
        const rank = color === "w" ? 5 + dir : 4 + dir;
        holes.push(`${file}${rank}`);
      }
    }
  }
  return [...new Set(holes)].slice(0, 4);
}

function spaceScore(chess: Chess): number {
  let space = 0;
  for (const row of chess.board()) {
    for (const piece of row) {
      if (piece?.type !== "p") continue;
      const rank = Number(piece.square[1]);
      if (piece.color === "w" && rank >= 4) space += 1;
      if (piece.color === "b" && rank <= 5) space -= 1;
    }
  }
  return space;
}

function kingSafetyScore(chess: Chess, color: "w" | "b"): number {
  const king = kingSquare(chess, color);
  if (!king) return 0;
  const them = color === "w" ? "b" : "w";
  let score = 0;
  const [file, rank] = [king[0], Number(king[1])];
  for (const df of [-1, 0, 1]) {
    for (const dr of [-1, 0, 1]) {
      if (df === 0 && dr === 0) continue;
      const f = FILES[FILES.indexOf(file) + df];
      const r = rank + dr;
      if (!f || r < 1 || r > 8) continue;
      const piece = chess.get(`${f}${r}` as Square);
      if (piece?.type === "p" && piece.color === color) score += 8;
      if (piece?.color === them) score -= 14;
    }
  }
  if (chess.inCheck() && chess.turn() === color) score -= 20;
  return score;
}

function authoredPlans(opening: Opening, afterPly: number, facts: LessonFacts): string[] {
  const chunk = chunkAt(opening, Math.max(0, afterPly));
  const script = professorAt(opening, Math.max(0, afterPly));
  return [
    facts.plan,
    script?.plan,
    chunk?.job,
    opening.story.plan,
    opening.pillars.attackingPlan,
  ].filter((row): row is string => Boolean(row));
}

export function understandPosition(input: {
  opening: Opening;
  afterPly: number;
  facts: LessonFacts;
  fen?: string;
}): PositionUnderstanding {
  const { opening, afterPly, facts, fen } = input;
  const hook = nearestHook(opening, afterPly);
  const opponentIntent =
    hook?.they ?? facts.why ?? opening.story.conflict;
  const plans = authoredPlans(opening, afterPly, facts).slice(0, 4);
  const structure = [
    opening.pillars.pawnStructure,
    chunkAt(opening, Math.max(0, afterPly))?.name,
  ].filter((row): row is string => Boolean(row));

  if (!fen) {
    return {
      materialCp: 0,
      kingSafety: { us: 0, them: 0 },
      structure,
      activity: 0,
      space: 0,
      weakSquares: [],
      files: [],
      diags: [],
      threats: facts.kind === "fail" ? ["Missed the book job"] : [],
      plans,
      opponentIntent,
      volatile: false,
      forcing: false,
      sacrifice: /gambit|sac|gift a pawn|hang the bishop/i.test(
        `${opening.blurb} ${opening.story.cast} ${hook?.we ?? ""}`,
      ),
    };
  }

  let chess: Chess;
  try {
    chess = new Chess(fen);
  } catch {
    return understandPosition({ ...input, fen: undefined });
  }
  const us = chess.turn();
  const them = us === "w" ? "b" : "w";
  const activity = chess.moves().length;
  const material = materialCp(chess);
  const threats: string[] = [];
  if (chess.inCheck()) threats.push("Check");
  const moves = chess.moves({ verbose: true });
  if (moves.some((m) => m.captured && pieceValue(m.captured) >= 500)) {
    threats.push("Heavy piece hanging or en prise");
  }

  return {
    materialCp: material,
    kingSafety: {
      us: kingSafetyScore(chess, us),
      them: kingSafetyScore(chess, them),
    },
    structure,
    activity,
    space: spaceScore(chess),
    weakSquares: weakSquares(chess),
    files: fileOpenness(chess),
    diags: diagNotes(chess),
    threats,
    plans,
    opponentIntent,
    volatile: threats.length > 0 || Math.abs(material) >= 150,
    forcing: chess.inCheck() || moves.some((m) => Boolean(m.captured) || m.san.includes("+")),
    sacrifice:
      /gambit|sac|gift a pawn/i.test(`${opening.blurb} ${hook?.we ?? ""}`) ||
      (Math.abs(material) >= 100 && /gift|hang|ticket/i.test(hook?.we ?? "")),
  };
}

function bookSan(opening: Opening, afterPly: number, kind: LessonFacts["kind"]): string | undefined {
  if (kind === "fail" || kind === "hint") return opening.moves[afterPly];
  return opening.moves[afterPly + 1];
}

function uciOf(move: Move): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

function authoredReason(opening: Opening, afterPly: number, facts: LessonFacts, book: boolean): string {
  const hook = hookFor(opening, afterPly) ?? nearestHook(opening, afterPly);
  if (book && hook) return spokenHook(hook);
  if (book) return facts.concept || facts.chunkJob || "That's the job in this house.";
  if (hook) return hook.they;
  return facts.why || opening.story.conflict;
}

function classifyMove(
  move: Move,
  book: boolean,
  opening: Opening,
  afterPly: number,
): MoveClass {
  if (book) {
    if (opening.pins.some((pin) => pin.afterPly === afterPly)) return "Critical";
    if (isKeyPly(opening, afterPly)) return "Strong";
    return "Practical";
  }
  if (move.san.includes("#") || (move.captured && pieceValue(move.captured) >= 900)) {
    return "Critical";
  }
  if (move.captured || move.san.includes("+") || move.san === "O-O" || move.san === "O-O-O") {
    return "Interesting";
  }
  if (move.piece === "q" && afterPly < 10 && !move.captured) return "Inferior";
  if (CENTER.has(move.to) || move.piece === "n" || move.piece === "b") return "Practical";
  return "Inferior";
}

function changesPlan(classification: MoveClass, book: boolean): boolean {
  return book || classification === "Critical" || classification === "Strong";
}

function fromBackRank(move: Move): boolean {
  const home = move.color === "w" ? "1" : "8";
  return (move.piece === "n" || move.piece === "b") && move.from[1] === home;
}

/** Plan-relevant filter — not "every legal move equally". */
function isPlanRelevant(move: Move, bookSanMove?: string): boolean {
  if (bookSanMove && move.san === bookSanMove) return true;
  if (move.captured) return true;
  if (move.san.includes("+") || move.san.includes("#")) return true;
  if (move.san === "O-O" || move.san === "O-O-O") return true;
  if (CENTER.has(move.to)) return true;
  if (fromBackRank(move)) return true;
  return false;
}

function candidateFromMove(
  move: Move,
  opening: Opening,
  afterPly: number,
  facts: LessonFacts,
  book: boolean,
): CandidateMove {
  const classification = classifyMove(move, book, opening, afterPly);
  return {
    san: move.san,
    uci: uciOf(move),
    classification,
    reason: authoredReason(opening, afterPly, facts, book),
    book,
    changesPlan: changesPlan(classification, book),
  };
}

function trapAt(opening: Opening, afterPly: number): CandidateMove | undefined {
  const trap = opening.traps.find((row) => row.shotPly === afterPly || row.shotPly === afterPly + 1);
  const san = trap?.moves[0];
  if (!trap || !san) return undefined;
  return {
    san,
    classification: "Interesting",
    reason: trap.coach,
    book: false,
    changesPlan: true,
  };
}

export function candidateMoves(input: {
  opening: Opening;
  afterPly: number;
  facts: LessonFacts;
  fen?: string;
}): CandidateMove[] {
  const { opening, afterPly, facts, fen } = input;
  const book = bookSan(opening, afterPly, facts.kind);
  const picked: CandidateMove[] = [];

  if (fen) {
    try {
      const chess = new Chess(fen);
      const legal = chess.moves({ verbose: true });
      const relevant = legal.filter((move) => isPlanRelevant(move, book));
      const bookMove =
        relevant.find((move) => move.san === book) ?? legal.find((move) => move.san === book);
      if (bookMove) picked.push(candidateFromMove(bookMove, opening, afterPly, facts, true));
      for (const move of relevant) {
        if (picked.length >= 5) break;
        if (picked.some((row) => row.san === move.san)) continue;
        picked.push(candidateFromMove(move, opening, afterPly, facts, false));
      }
    } catch {
      /* fall through to authored book candidate */
    }
  }

  if (!picked.length && book) {
    picked.push({
      san: book,
      classification: isKeyPly(opening, afterPly) ? "Strong" : "Practical",
      reason: authoredReason(opening, afterPly, facts, true),
      book: true,
      changesPlan: true,
    });
  }

  const trap = trapAt(opening, afterPly);
  if (trap && picked.length < 5 && !picked.some((row) => row.san === trap.san)) {
    picked.push(trap);
  }

  return picked.slice(0, 5);
}

export function compressCandidates(candidates: CandidateMove[]): CandidateMove[] {
  const changing = candidates.filter((row) => row.changesPlan || row.book);
  const rest = candidates.filter((row) => !changing.includes(row) && row.classification !== "Inferior");
  const out = [...changing, ...rest].slice(0, 4);
  if (out.length < 2) {
    const inferior = candidates.find((row) => row.classification === "Inferior");
    if (inferior) out.push(inferior);
  }
  return out.slice(0, 5);
}

export function adaptiveDepth(input: {
  understanding: PositionUnderstanding;
  compressed: CandidateMove[];
  disagree: boolean;
}): { depth: number; escalate: boolean } {
  let depth = 4;
  let escalate = false;
  const critical = input.compressed.some((row) => row.classification === "Critical");
  if (input.understanding.forcing || input.understanding.volatile || critical) {
    depth = 6;
    escalate = true;
  }
  if (input.understanding.sacrifice || input.disagree || critical) {
    depth = 8;
    escalate = true;
  }
  if (
    !escalate &&
    !input.understanding.volatile &&
    !input.disagree &&
    input.compressed.every((row) => row.classification === "Practical" || row.classification === "Strong")
  ) {
    depth = 4;
  }
  return { depth: Math.min(8, Math.max(4, depth)), escalate };
}

export function teachingLookahead(
  opening: Opening,
  afterPly: number,
  depth: number,
): TeachingPly[] {
  const start = Math.max(0, afterPly + 1);
  const end = Math.min(opening.moves.length, start + depth);
  const out: TeachingPly[] = [];
  for (let ply = start; ply < end; ply++) {
    const san = opening.moves[ply];
    if (!san) continue;
    const script = professorAt(opening, ply);
    const hook = hookFor(opening, ply);
    const idea = hook
      ? spokenHook(hook)
      : script?.concept ?? chunkAt(opening, ply)?.job ?? opening.story.plan;
    if (!isKeyPly(opening, ply) && out.length >= 2) continue;
    out.push({ ply, san, idea });
  }
  return out.slice(0, 8);
}

export function humanLayer(input: {
  facts: LessonFacts;
  opening: Opening;
  afterPly: number;
  compressed: CandidateMove[];
}): HumanLayer {
  const hook = hookFor(input.opening, input.afterPly) ?? nearestHook(input.opening, input.afterPly);
  const chunk = chunkAt(input.opening, Math.max(0, input.afterPly));
  return {
    what: stripMoveDumpLead(hook?.we ?? input.facts.concept),
    why: stripMoveDumpLead(hook?.they ?? input.facts.why),
    criticalCandidates: input.compressed.filter(
      (row) => row.classification === "Critical" || row.classification === "Strong" || row.book,
    ),
    whatChanges: chunk?.job ?? input.facts.chunkJob ?? "The job of this house.",
    ideaToRemember: hook ? spokenHook(hook) : input.facts.concept,
  };
}

/** Compress before calculate — understanding first, then 2–5 real candidates. */
export function compressBeforeCalculate(input: {
  opening: Opening;
  afterPly: number;
  facts: LessonFacts;
  fen?: string;
}): CompressDecision {
  const understanding = understandPosition(input);
  const candidates = candidateMoves(input);
  const compressed = compressCandidates(candidates);
  const request = {
    fen: input.fen,
    candidates: compressed,
    depth: 4,
    lookaheadSans: input.opening.moves.slice(Math.max(0, input.afterPly + 1)),
  };
  const stub = stubAnalyzer.analyze(request);
  const heuristic = singlePathAnalyzer.analyze(request);
  const consensus = engineConsensus([stub, heuristic]);
  const { depth, escalate } = adaptiveDepth({
    understanding,
    compressed,
    disagree: !consensus.agree,
  });
  const lookahead = teachingLookahead(input.opening, input.afterPly, depth);
  const pv = teachingPv(
    lookahead.map((row) => row.san),
    depth,
  );
  stub.pv = pv;
  heuristic.pv = pv.slice(0, Math.min(pv.length, 8));

  return {
    understanding,
    candidates,
    compressed,
    depth,
    escalate,
    lookahead,
    human: humanLayer({
      facts: input.facts,
      opening: input.opening,
      afterPly: input.afterPly,
      compressed,
    }),
    consensus,
  };
}
