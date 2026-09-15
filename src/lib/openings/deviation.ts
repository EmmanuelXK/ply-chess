import { collectFacts } from "@/lib/dialogue/generate";
import { SHORT_HOOKS } from "@/lib/dialogue/hooks";
import {
  leadsWithCoordinateDump,
  leadsWithSan,
  stripMoveDumpLead,
} from "@/lib/dialogue/short";
import {
  candidateMoves,
  compressBeforeCalculate,
  compressCandidates,
} from "@/lib/coach-brain/compress";
import type { CandidateMove } from "@/lib/coach-brain/types";
import { chunkAt, firstSentence, positionalIdea } from "./helpers";
import { professorAt } from "./professor";
import type { Opening } from "./types";
import type { CoachKind } from "./coach";

/** Any Ask Coach tap opens the explain view. The board stays quiet until then. */
export function shouldOpenCoachExplain(_kind?: CoachKind): boolean {
  return true;
}

export interface CoachExplainState {
  kind: CoachKind;
  ply: number;
  playedSan?: string;
  bookSan?: string;
  houseName?: string;
  headline: string;
  /** Concept-first: the problem / their idea. */
  problem: string;
  /** Concept-first book idea — SAN lives in candidates / line. */
  bookIdea: string;
  contrast?: string;
  candidates: CandidateMove[];
  bookLine: string[];
  startPly: number;
}

/** @deprecated use CoachExplainState */
export type DeviationExplain = CoachExplainState;

function picture(text: string, fallback: string): string {
  const peeled = stripMoveDumpLead(text) || fallback;
  if (leadsWithSan(peeled) || leadsWithCoordinateDump(peeled)) return fallback;
  return peeled;
}

function hookAt(opening: Opening, ply: number) {
  const rows = SHORT_HOOKS[opening.id] ?? [];
  const exact = rows.find((row) => row.ply === ply);
  if (exact) return exact;
  return [...rows]
    .filter((row) => row.ply <= ply)
    .sort((a, b) => b.ply - a.ply)[0];
}

function ideaOf(opening: Opening, ply: number): string {
  const chunk = chunkAt(opening, Math.max(0, ply));
  const script = professorAt(opening, Math.max(0, ply));
  return positionalIdea(
    firstSentence(script?.concept ?? "") ||
      chunk?.job ||
      firstSentence(script?.why ?? "") ||
      "",
    chunk?.name ?? "one square, one job",
  );
}

function sameCopy(a: string, b: string): boolean {
  return a.replace(/\s+/g, " ").trim() === b.replace(/\s+/g, " ").trim();
}

/**
 * Authored house + Coach Brain candidates. Never LLM chess "truth".
 * Strip stays quiet/concept-first; this payload is the Ask Coach sheet.
 */
export function explainCoach(input: {
  opening: Opening;
  ply: number;
  kind?: CoachKind;
  playedSan?: string;
  fen?: string;
}): CoachExplainState {
  const { opening, playedSan, fen } = input;
  const kind = input.kind ?? "ok";
  const miss = kind === "fail";
  const ply = Math.max(0, input.ply);
  const ideaPly = miss ? ply : Math.max(0, ply > 0 ? ply - 1 : 0);
  const chunk = chunkAt(opening, ideaPly);
  const script = professorAt(opening, ideaPly);
  const facts = collectFacts({
    opening,
    ply: ideaPly,
    kind,
    fen,
    san: playedSan,
  });
  const compress = compressBeforeCalculate({
    opening,
    afterPly: ideaPly,
    facts,
    fen,
  });
  const hook = hookAt(opening, ideaPly);
  const job = ideaOf(opening, ideaPly);
  const problem = picture(
    miss
      ? hook?.they
        ? `That misses the job. ${hook.they}`
        : `That doesn't do the house job. ${job}`
      : hook?.they || script?.why || job,
    miss ? "That doesn't do the house job." : "Watch their idea.",
  );
  const bookIdea = picture(
    hook?.we || script?.concept || compress.human.what || job,
    "Stay with the idea. One move.",
  );
  const contrastRaw = miss
    ? undefined
    : picture(compress.human.why || hook?.they || "", "");
  const contrast =
    contrastRaw &&
    !sameCopy(contrastRaw, bookIdea) &&
    !sameCopy(contrastRaw, problem)
      ? contrastRaw
      : undefined;

  const raw = compressCandidates(
    compress.compressed.length
      ? compress.compressed
      : candidateMoves({ opening, afterPly: ideaPly, facts, fen }),
  );
  const filtered = raw
    .filter((row) => row.book || row.san !== playedSan)
    .filter(
      (row) =>
        row.book ||
        row.classification === "Critical" ||
        row.classification === "Strong" ||
        row.classification === "Interesting",
    )
    .map((row) =>
      row.book ? { ...row, reason: picture(row.reason, bookIdea) } : row,
    );

  return {
    kind,
    ply,
    playedSan,
    bookSan: opening.moves[miss ? ply : ideaPly],
    houseName: chunk?.name,
    headline: miss ? "Off the book" : (chunk?.name ?? "This position"),
    problem,
    bookIdea,
    contrast,
    candidates: filtered.length ? filtered : raw.filter((row) => row.book).slice(0, 1),
    bookLine: opening.moves,
    startPly: Math.max(0, Math.min(ply, opening.moves.length)),
  };
}

export function explainDeviation(input: {
  opening: Opening;
  ply: number;
  playedSan?: string;
  fen?: string;
}): CoachExplainState {
  return explainCoach({ ...input, kind: "fail" });
}
