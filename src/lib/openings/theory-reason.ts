import { SHORT_HOOKS, spokenHook } from "@/lib/dialogue/hooks";
import {
  leadsWithSan,
  stripLeadingSanLabel,
  wordCount,
} from "@/lib/dialogue/short";
import { chunkAt, firstSentence, isUserPly, looksLikeMoveList } from "./helpers";
import { isKeyPly } from "./key-ply";
import { housePicture } from "./memory";
import type { Opening, ProfessorScript } from "./types";

/** Short drill triad on key / highlighted plies. */
export interface DrillTriad {
  /** What our move does. */
  do: string;
  /** What it prevents. */
  prevent: string;
  /** Opponent's best reply — idea, not a SAN lead. */
  reply: string;
}

export interface TheoryPoint {
  /** Strip-sized picture: they/we, concept, or chunk job. Never a SAN lead. */
  idea: string;
  /** Why it matters: plan, conflict, or chunk job. */
  reason: string;
  /** Idea + reason for Why / Explain / Ask Coach. */
  intro: string;
  /** What we're doing here. */
  plan: string;
  /** Why their move (or hunt) makes sense. */
  theyMoved: string;
  /** Cost of the near-miss / second-best. */
  secondBest: string;
  /** Key ply / drill highlight only. */
  triad?: DrillTriad;
}

const COST_LEAD =
  /^(if you |without |don't |do not |never |miss |skip |play the (?:wrong|other|second-best|near-miss))/i;
const COST_MID =
  /\b(if you |without |cheaply|donate|lose this|near-miss|second-best|boring|that's jobava|different hunt)\b/i;

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

function nextHook(opening: Opening, afterPly: number) {
  const rows = SHORT_HOOKS[opening.id];
  if (!rows?.length) return undefined;
  return [...rows]
    .filter((row) => row.ply > afterPly)
    .sort((a, b) => a.ply - b.ply)[0];
}

function cleanIdea(text: string | undefined): string {
  const cleaned = stripLeadingSanLabel(text);
  if (!cleaned || looksLikeMoveList(cleaned) || leadsWithSan(cleaned)) return "";
  return firstSentence(cleaned);
}

function cleanReason(text: string | undefined): string {
  const cleaned = stripLeadingSanLabel(text);
  if (!cleaned || looksLikeMoveList(cleaned) || leadsWithSan(cleaned)) return "";
  return limitReason(cleaned);
}

/** Plan / they / cost: allow a square in a sentence; still reject SAN leads and bare dumps. */
function cleanCoachLine(text: string | undefined, max = 22): string {
  const cleaned = stripLeadingSanLabel(text);
  if (!cleaned || leadsWithSan(cleaned)) return "";
  const hasVoice =
    /\b(they|their|them|we|you|plan|want|keep|stop|if you|without|don't|miss|house|job|bishop|knight|king|pawn|clamp|coil|squeeze)\b/i.test(
      cleaned,
    );
  if (looksLikeMoveList(cleaned) && !hasVoice) return "";
  return limitReason(cleaned, max);
}

function limitReason(text: string, max = 28): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact) return "";
  const parts = compact.split(/(?<=[.!?])\s+/).filter(Boolean);
  let out = parts[0] ?? compact;
  for (let i = 1; i < parts.length; i++) {
    const next = `${out} ${parts[i]}`.replace(/\s+/g, " ").trim();
    if (wordCount(next) > max) break;
    out = next;
    if (wordCount(out) >= 8) break;
  }
  if (wordCount(out) <= max) return out;
  return out.split(" ").filter(Boolean).slice(0, max).join(" ");
}

function keyOf(text: string): string {
  return text.replace(/[.—–,]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

function distinctFrom(idea: string, candidate: string | undefined): string {
  const reason = cleanReason(candidate);
  if (!reason) return "";
  const ideaKey = keyOf(idea);
  const reasonKey = keyOf(reason);
  if (!reasonKey || reasonKey === ideaKey) return "";
  if (ideaKey.includes(reasonKey) && reasonKey.split(" ").length >= 6) return "";
  return reason;
}

function distinctCoach(against: string, candidate: string | undefined, max = 22): string {
  const line = cleanCoachLine(candidate, max);
  if (!line) return "";
  const a = keyOf(against);
  const b = keyOf(line);
  if (!b || b === a) return "";
  if (a.includes(b) && b.split(" ").length >= 8) return "";
  return line;
}

function sentencesOf(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
}

function peeledStub(text: string): boolean {
  return /^(is|are|was|were|then|and|or)\b/i.test(text);
}

function usableCoach(text: string | undefined, min: number, max = 22): string {
  const line = cleanCoachLine(text, max);
  if (!line || wordCount(line) < min || peeledStub(line)) return "";
  return line;
}

function extractCost(sources: Array<string | undefined>): string {
  for (const text of sources) {
    for (const sentence of sentencesOf(text)) {
      const cleaned = stripLeadingSanLabel(sentence);
      if (!cleaned || leadsWithSan(cleaned) || peeledStub(cleaned)) continue;
      if (wordCount(cleaned) < 6) continue;
      if (COST_LEAD.test(cleaned) || COST_MID.test(cleaned)) {
        return limitReason(cleaned, 22);
      }
    }
  }
  return "";
}

function theyLine(opening: Opening, afterPly: number): string {
  const hook = nearestHook(opening, afterPly);
  return (
    usableCoach(hook?.they, 3, 16) ||
    usableCoach(opening.story.conflict, 4, 18) ||
    "They have a hunt. Name it before you memorize."
  );
}

function planLine(
  opening: Opening,
  afterPly: number,
  idea: string,
  reason: string,
): string {
  const script = nearestScript(opening, afterPly);
  const chunk = chunkAt(opening, Math.max(0, afterPly));
  const against = `${idea} ${reason}`;
  const candidates = [
    distinctCoach(against, script?.plan, 22),
    distinctCoach(against, opening.story.plan, 22),
    distinctCoach(against, chunk?.job, 18),
    distinctCoach(against, opening.pillars.attackingPlan, 22),
    cleanCoachLine(opening.story.plan, 22),
  ];
  for (const row of candidates) {
    if (row && wordCount(row) >= 5 && !peeledStub(row)) return row;
  }
  return "Hold the house. Play the job. Don't go shopping.";
}

function secondBestLine(
  opening: Opening,
  afterPly: number,
  idea: string,
  reason: string,
  plan: string,
): string {
  const script = nearestScript(opening, afterPly);
  const chunk = chunkAt(opening, Math.max(0, afterPly));
  const trapBite = opening.traps[0]?.blurb;
  const extracted = extractCost([
    script?.why,
    script?.plan,
    script?.concept,
    chunk?.job,
    opening.pillars.tacticsBank,
    trapBite,
  ]);
  const against = `${idea} ${reason} ${plan}`;
  const fromExtract = distinctCoach(against, extracted, 22);
  if (fromExtract && wordCount(fromExtract) >= 6) return fromExtract;
  const conflict = cleanCoachLine(opening.story.conflict, 16);
  if (
    conflict &&
    !looksLikeMoveList(opening.story.conflict) &&
    !keyOf(against).includes(keyOf(conflict))
  ) {
    return `Miss this and they get their hunt — ${conflict.replace(/[.!?]+$/, "")}.`;
  }
  const house = chunk?.name && !looksLikeMoveList(chunk.name) ? chunk.name : "the job";
  return `Play the near-miss and ${house} dies. They steal the air.`;
}

function preventLine(they: string): string {
  const peeled = they
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.!?]+$/, "")
    .replace(/^(they(?:'ll|'d)?|they will)\s+/i, "")
    .replace(/^(they |black |white )?(want to|wants to|want|wanted to|wanted)\s+/i, "")
    .trim();
  if (peeled && peeled.length >= 4 && !leadsWithSan(peeled)) {
    const rest = peeled.charAt(0).toLowerCase() + peeled.slice(1);
    const line = /^(hunt|grab|take|chip|stake|hide|shuffle|hop|develop|copy|pocket|kill|raid)\b/i.test(
      peeled,
    )
      ? `Don't let them ${rest}.`
      : `Stop that: ${rest}.`;
    if (!leadsWithSan(line) && wordCount(line) <= 14) return line;
  }
  return "Don't let that idea land.";
}

function replyLine(opening: Opening, afterPly: number, they: string): string {
  const nextPly = afterPly + 1;
  if (nextPly >= 0 && nextPly < opening.moves.length && !isUserPly(opening.side, nextPly)) {
    const exact = SHORT_HOOKS[opening.id]?.find((row) => row.ply === nextPly);
    const bite = usableCoach(exact?.they, 3, 12);
    if (bite && keyOf(bite) !== keyOf(they)) return bite;
  }
  const later = nextHook(opening, afterPly);
  const laterThey = usableCoach(later?.they, 3, 12);
  if (
    later &&
    later.ply - afterPly <= 2 &&
    laterThey &&
    keyOf(laterThey) !== keyOf(they)
  ) {
    return laterThey;
  }
  return "They keep the hunt. Watch the square they leave.";
}

function buildTriad(
  opening: Opening,
  afterPly: number,
  idea: string,
  theyMoved: string,
): DrillTriad | undefined {
  if (afterPly < 0) return undefined;
  if (!isKeyPly(opening, afterPly)) return undefined;
  const hook = nearestHook(opening, afterPly);
  const doLine =
    cleanCoachLine(hook?.we, 10) ||
    cleanIdea(idea) ||
    "Play the job. Hold the house.";
  const prevent = preventLine(theyMoved);
  const reply = replyLine(opening, afterPly, theyMoved);
  return {
    do: doLine.replace(/[.!?]+$/, "") + ".",
    prevent: prevent.replace(/[.!?]+$/, "") + ".",
    reply: reply.replace(/[.!?]+$/, "") + ".",
  };
}

/**
 * Concept-first theory for the current ply: the idea (what) and the reason (why),
 * deepened with plan / their idea / second-best — and a drill triad on key plies.
 * Strip stays short; Why / Explain / Ask Coach use `intro` plus the question set.
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

  let reason =
    distinctFrom(idea, script?.why) ||
    distinctFrom(idea, chunk?.job) ||
    distinctFrom(idea, opening.story.conflict) ||
    distinctFrom(idea, script?.plan) ||
    distinctFrom(idea, opening.story.plan) ||
    cleanReason(opening.story.conflict) ||
    cleanReason(opening.story.plan) ||
    "That's the job in this system.";

  if (wordCount(reason) < 6) {
    const extra =
      distinctFrom(`${idea} ${reason}`, opening.story.conflict) ||
      distinctFrom(`${idea} ${reason}`, opening.story.plan) ||
      distinctFrom(`${idea} ${reason}`, chunk?.job);
    if (extra) reason = `${reason.replace(/[.!?]+$/, "")}. ${extra}`;
  }

  const plan = planLine(opening, afterPly, idea, reason);
  const theyMoved = theyLine(opening, afterPly);
  const secondBest = secondBestLine(opening, afterPly, idea, reason, plan);
  const triad = buildTriad(opening, afterPly, idea, theyMoved);

  const intro = `${idea.replace(/[.!?]+$/, "")}. ${reason}`.replace(/\s+/g, " ").trim();
  return { idea, reason, intro, plan, theyMoved, secondBest, triad };
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
  if (wordCount(point.reason) < 5) return false;
  if (leadsWithSan(point.reason)) return false;
  return true;
}

export function theoryHasQuestions(point: TheoryPoint): boolean {
  if (wordCount(point.plan) < 5) return false;
  if (wordCount(point.theyMoved) < 3) return false;
  if (wordCount(point.secondBest) < 6) return false;
  if (leadsWithSan(point.plan) || leadsWithSan(point.theyMoved) || leadsWithSan(point.secondBest)) {
    return false;
  }
  return true;
}
