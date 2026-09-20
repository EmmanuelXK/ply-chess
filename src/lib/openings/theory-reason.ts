import { SHORT_HOOKS, spokenHook } from "@/lib/dialogue/hooks";
import {
  leadsWithSan,
  stripLeadingSanLabel,
  wordCount,
} from "@/lib/dialogue/short";
import { chunkAt, firstSentence, looksLikeMoveList } from "./helpers";
import { housePicture } from "./memory";
import type { Opening, ProfessorScript } from "./types";

export interface TheoryPoint {
  /** Strip-sized picture: they/we, concept, or chunk job. Never a SAN lead. */
  idea: string;
  /** Why it matters: plan, conflict, or chunk job. */
  reason: string;
  /** Idea + reason for Why / Explain / Ask Coach. */
  intro: string;
}

function nearestScript(
  opening: Opening,
  afterPly: number,
): ProfessorScript | undefined {
  const exact = opening.professor.find((row) => row.afterPly === afterPly);
  if (exact) return exact;
  return [...opening.professor]
    .filter((row) => row.afterPly <= afterPly)
    .sort((a, b) => b.afterPly - a.afterPly)[0];
}

function nearestHook(opening: Opening, afterPly: number) {
  const rows = SHORT_HOOKS[opening.id];
  if (!rows?.length) return undefined;
  const exact = rows.find((row) => row.ply === afterPly);
  if (exact) return exact;
  return [...rows]
    .filter((row) => row.ply <= afterPly)
    .sort((a, b) => b.ply - a.ply)[0];
}

function cleanIdea(text: string | undefined): string {
  const cleaned = stripLeadingSanLabel(text);
  if (!cleaned || looksLikeMoveList(cleaned) || leadsWithSan(cleaned)) return "";
  return firstSentence(cleaned);
}

function limitReason(text: string, max = 28): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact) return "";
  const parts = compact.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const two = `${parts[0]} ${parts[1]}`.replace(/\s+/g, " ").trim();
    if (wordCount(two) <= max) return two;
  }
  const sentence = firstSentence(compact);
  if (wordCount(sentence) <= max) return sentence;
  return sentence.split(" ").filter(Boolean).slice(0, max).join(" ");
}

function distinctFrom(idea: string, candidate: string | undefined): string {
  const cleaned = cleanIdea(candidate);
  if (!cleaned) return "";
  const reason = limitReason(cleaned);
  if (!reason) return "";
  const ideaKey = idea.replace(/[.—–,]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
  const reasonKey = reason.replace(/[.—–,]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
  if (!reasonKey || reasonKey === ideaKey) return "";
  if (ideaKey.includes(reasonKey) && reasonKey.split(" ").length >= 6) return "";
  return reason;
}

/**
 * Concept-first theory for the current ply: the idea (what) and the reason (why).
 * Strip stays short; Why / Explain / Ask Coach use `intro` so the reason is obvious.
 */
export function theoryAt(opening: Opening, afterPly: number): TheoryPoint {
  const chunk = chunkAt(opening, Math.max(0, afterPly));
  const script = nearestScript(opening, afterPly);
  const hook = nearestHook(opening, afterPly);
  const picture = housePicture(chunk);

  const idea =
    (hook ? spokenHook(hook) : "") ||
    cleanIdea(script?.concept) ||
    cleanIdea(chunk?.job) ||
    picture ||
    cleanIdea(opening.story.cast) ||
    "One house. One job.";

  const reason =
    distinctFrom(idea, script?.why) ||
    distinctFrom(idea, chunk?.job) ||
    distinctFrom(idea, opening.story.conflict) ||
    distinctFrom(idea, script?.plan) ||
    distinctFrom(idea, opening.story.plan) ||
    limitReason(
      cleanIdea(opening.story.conflict) ||
        cleanIdea(opening.story.plan) ||
        "That's the job in this system.",
    );

  const intro = `${idea.replace(/[.!?]+$/, "")}. ${reason}`.replace(/\s+/g, " ").trim();
  return { idea, reason, intro };
}

/** Peel a SAN lead so Why copy can keep the idea. Empty / dump → fallback. */
export function preferConceptIntro(intro: string, fallback: string): string {
  const cleaned = stripLeadingSanLabel(intro);
  if (!cleaned || looksLikeMoveList(cleaned) || leadsWithSan(cleaned)) {
    return fallback || "That's the idea. Here's why it matters.";
  }
  return cleaned;
}

/** Generated Why/Explain copy: idea first, reason second, SAN never leads. */
export function conceptFirstIntro(
  idea: string,
  reason: string,
  fallback: string,
): string {
  const a = cleanIdea(idea) || cleanIdea(fallback);
  const b = distinctFrom(a, reason) || cleanIdea(reason) || cleanIdea(fallback);
  if (a && b) return `${a.replace(/[.!?]+$/, "")}. ${limitReason(b)}`;
  return a || b || "That's the idea. Here's why it matters.";
}

/**
 * Branch narration for generated Why lessons.
 * The ply SAN lives on the move list / glyphs; the sentence is the job.
 */
export function conceptFirstNarrate(
  idea: string,
  userMove: boolean,
): string {
  const picture = cleanIdea(idea);
  if (picture) return firstSentence(picture);
  return userMove
    ? "That's your job in this house."
    : "They develop. Watch the job they leave.";
}

export function theoryHasReason(point: TheoryPoint): boolean {
  if (wordCount(point.reason) < 4) return false;
  if (looksLikeMoveList(point.reason) || leadsWithSan(point.reason)) return false;
  return true;
}
