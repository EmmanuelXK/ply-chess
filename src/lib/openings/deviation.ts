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

/** Ask Coach on a miss opens the Lotus-style explain view. Other taps still speak. */
export function shouldOpenCoachExplain(kind: CoachKind): boolean {
  return kind === "fail";
}

export interface DeviationExplain {
  ply: number;
  playedSan?: string;
  bookSan?: string;
  houseName?: string;
  /** Concept-first: what their move fails to solve. */
  problem: string;
  /** Concept-first book idea — SAN lives in candidates / line. */
  bookIdea: string;
  contrast?: string;
  candidates: CandidateMove[];
  bookLine: string[];
  startPly: number;
}

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
  const chunk = chunkAt(opening, ply);
  const script = professorAt(opening, ply);
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
export function explainDeviation(input: {
  opening: Opening;
  ply: number;
  playedSan?: string;
  fen?: string;
}): DeviationExplain {
  const { opening, ply, playedSan, fen } = input;
  const chunk = chunkAt(opening, ply);
  const script = professorAt(opening, ply);
  const facts = collectFacts({
    opening,
    ply,
    kind: "fail",
    fen,
    san: playedSan,
  });
  const compress = compressBeforeCalculate({
    opening,
    afterPly: ply,
    facts,
    fen,
  });
  const hook = hookAt(opening, ply);
  const job = ideaOf(opening, ply);
  const problem = picture(
    hook?.they
      ? `That misses the job. ${hook.they}`
      : `That doesn't do the house job. ${job}`,
    "That doesn't do the house job.",
  );
  const bookIdea = picture(
    hook?.we || script?.concept || compress.human.what || job,
    "Stay with the idea. One move.",
  );
  const contrastRaw = hook
    ? undefined
    : picture(compress.human.why, "");
  const contrast =
    contrastRaw && !sameCopy(contrastRaw, bookIdea) && !sameCopy(contrastRaw, problem)
      ? contrastRaw
      : undefined;

  const raw = compressCandidates(
    compress.compressed.length
      ? compress.compressed
      : candidateMoves({ opening, afterPly: ply, facts, fen }),
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
    ply,
    playedSan,
    bookSan: opening.moves[ply],
    houseName: chunk?.name,
    problem,
    bookIdea,
    contrast,
    candidates: filtered.length ? filtered : raw.filter((row) => row.book).slice(0, 1),
    bookLine: opening.moves,
    startPly: Math.max(0, Math.min(ply, opening.moves.length)),
  };
}
