import type { LessonMode } from "./types";
import type { DuoPack, LessonFacts, DialogueAsk, DialogueBeat } from "./types";
import { capWords, shouldArgue } from "./short";

function kernels(facts: LessonFacts) {
  return {
    idea: capWords(facts.idea ?? facts.concept),
    why: capWords(facts.whyShort ?? facts.why),
    plan: capWords(facts.planShort ?? facts.plan),
    san: facts.san,
  };
}

function askFromFacts(
  facts: LessonFacts,
  asker: DialogueBeat["speaker"],
  grader: DialogueBeat["speaker"],
  include: boolean,
): DialogueAsk | undefined {
  if (!include || !facts.quizPrompt || !facts.quizChoices?.length) {
    return undefined;
  }
  const k = kernels(facts);
  return {
    prompt: capWords(facts.quizPrompt, 12),
    choices: facts.quizChoices.map((c) => ({
      ...c,
      text: capWords(c.text, 10),
    })),
    onCorrect: {
      speaker: grader,
      text: capWords(`Nice. ${k.plan}`),
    },
    onWrong: {
      speaker: asker,
      text: capWords(`Not quite. ${k.why}`),
    },
  };
}

function includeQuiz(facts: LessonFacts, lesson: LessonMode): boolean {
  if (!facts.quizPrompt) return false;
  if (facts.kind === "start") return true;
  if (lesson === "podcast") return facts.ply > 0 && facts.ply % 16 === 15;
  return Boolean(facts.quizChoices?.length);
}

function prideLead(
  facts: LessonFacts,
  lesson: LessonMode,
  idea: string,
  yes: string,
): string {
  if (lesson === "teach" && facts.studentMove && facts.kind !== "start") {
    return `${yes} ${idea}`;
  }
  return idea;
}

type FlavorFn = (
  facts: LessonFacts,
  duo: DuoPack,
  lesson: LessonMode,
) => DialogueBeat[];

function trio(
  facts: LessonFacts,
  duo: DuoPack,
  lines: { lead: string; reply: string; land: string },
  replyKind: DialogueBeat["kind"],
  ask?: DialogueAsk,
): DialogueBeat[] {
  const beats: DialogueBeat[] = [
    { speaker: duo.left.id, text: capWords(lines.lead), kind: "teach" },
    { speaker: duo.right.id, text: capWords(lines.reply), kind: replyKind },
    {
      speaker: duo.left.id,
      text: capWords(lines.land),
      kind: "takeaway",
    },
  ];
  if (ask) {
    beats.push({
      speaker: duo.right.id,
      text: capWords(ask.prompt),
      kind: "quiz",
      ask,
    });
  }
  return beats;
}

function recallBeat(recall: string | undefined, fallback: string): string {
  if (!recall) return fallback;
  return `Yeah — same rush as ${recall}.`;
}

/** Prestige mentor vs dark punch. Warm trainers, not a lecture. */
const vossDraven: FlavorFn = (facts, duo, lesson) => {
  const k = kernels(facts);
  const A = duo.left.id;
  const K = duo.right.id;
  const ask = askFromFacts(facts, K, A, includeQuiz(facts, lesson));
  const argue = shouldArgue(facts.openingId, facts.ply, facts.kind);

  if (facts.kind === "fail") {
    return [
      {
        speaker: K,
        text: capWords(recallBeat(facts.recall, "Hold up. Wrong square.")),
        kind: "fail",
      },
      { speaker: A, text: capWords(`You're close. ${k.why}`), kind: "teach" },
      {
        speaker: A,
        text: capWords(`Play ${k.san ?? "the book"}. That's the fix.`),
        kind: "takeaway",
      },
    ];
  }
  if (facts.kind === "hint") {
    return [
      {
        speaker: A,
        text: capWords(`Try ${k.san ?? "the book"}. ${k.idea}`),
        kind: "hint",
      },
      { speaker: K, text: capWords(`Yeah. ${k.plan}`), kind: "challenge" },
    ];
  }
  if (facts.kind === "history") {
    return [
      {
        speaker: A,
        text: capWords(
          `${facts.historyYear ?? ""} ${facts.historyTitle ?? "Sourced paper"}.`,
        ),
        kind: "history",
      },
      {
        speaker: K,
        text: capWords(facts.historyHere ?? k.why),
        kind: "challenge",
      },
    ];
  }

  return trio(
    facts,
    duo,
    {
      lead: prideLead(facts, lesson, k.idea, "Nice."),
      reply: argue
        ? facts.romantic
          ? "Pretty. Still punch the break."
          : `Hold up. ${k.why}`
        : `Yeah. ${k.why}`,
      land: argue ? `Alright. ${k.plan}` : `That's it. ${k.plan}`,
    },
    argue ? "challenge" : "agree",
    ask,
  );
};

/** Ice calculator vs narrative fire. */
const valeKnox: FlavorFn = (facts, duo, lesson) => {
  const k = kernels(facts);
  const S = duo.left.id;
  const R = duo.right.id;
  const ask = askFromFacts(facts, R, S, includeQuiz(facts, lesson));
  const argue = shouldArgue(facts.openingId, facts.ply, facts.kind);

  if (facts.kind === "fail") {
    return [
      {
        speaker: S,
        text: capWords(recallBeat(facts.recall, "Not that file. Recalculate.")),
        kind: "fail",
      },
      { speaker: R, text: capWords(`We've got you. ${k.why}`), kind: "challenge" },
      { speaker: S, text: capWords(k.plan), kind: "takeaway" },
    ];
  }
  if (facts.kind === "hint") {
    return [
      {
        speaker: S,
        text: capWords(`Try ${k.san ?? "book"}. ${k.idea}`),
        kind: "hint",
      },
      { speaker: R, text: capWords(`Feel that? ${k.plan}`), kind: "challenge" },
    ];
  }
  if (facts.kind === "history") {
    return [
      {
        speaker: S,
        text: capWords(
          `${facts.historyYear ?? ""} ${facts.historyTitle ?? "The file"}.`,
        ),
        kind: "history",
      },
      {
        speaker: R,
        text: capWords(facts.historyHere ?? k.why),
        kind: "challenge",
      },
    ];
  }

  return trio(
    facts,
    duo,
    {
      lead: prideLead(facts, lesson, k.idea, "Correct."),
      reply: argue ? `That's bloodless. ${k.why}` : `Feel that? ${k.why}`,
      land: argue ? `Fine. ${k.plan}` : k.plan,
    },
    argue ? "challenge" : "agree",
    ask,
  );
};

/** Quiet planner vs investigator. */
const croweMarquez: FlavorFn = (facts, duo, lesson) => {
  const k = kernels(facts);
  const C = duo.left.id;
  const L = duo.right.id;
  const ask = askFromFacts(facts, L, C, includeQuiz(facts, lesson));
  const argue = shouldArgue(facts.openingId, facts.ply, facts.kind);

  if (facts.kind === "fail") {
    return [
      {
        speaker: L,
        text: capWords(recallBeat(facts.recall, "Easy. Look again.")),
        kind: "fail",
      },
      { speaker: C, text: capWords(`We've got you. ${k.why}`), kind: "teach" },
      { speaker: C, text: capWords(`Resume: ${k.plan}`), kind: "takeaway" },
    ];
  }
  if (facts.kind === "hint") {
    return [
      {
        speaker: C,
        text: capWords(`Try ${k.san ?? "the book"}. ${k.idea}`),
        kind: "hint",
      },
      { speaker: L, text: capWords(`Yeah. ${k.plan}`), kind: "challenge" },
    ];
  }
  if (facts.kind === "history") {
    return [
      {
        speaker: C,
        text: capWords(
          `${facts.historyYear ?? ""} ${facts.historyTitle ?? "The file"}.`,
        ),
        kind: "history",
      },
      {
        speaker: L,
        text: capWords(facts.historyHere ?? k.why),
        kind: "challenge",
      },
    ];
  }

  return trio(
    facts,
    duo,
    {
      lead: prideLead(facts, lesson, k.idea, "Good."),
      reply: argue ? "If you delay, I catch it." : `Yeah. ${k.why}`,
      land: argue ? `Agreed. ${k.plan}` : `Clean. ${k.plan}`,
    },
    argue ? "challenge" : "agree",
    ask,
  );
};

const FLAVOR: Record<DuoPack["id"], FlavorFn> = {
  "voss-draven": vossDraven,
  "vale-knox": valeKnox,
  "crowe-marquez": croweMarquez,
};

export function flavorBeats(
  facts: LessonFacts,
  duo: DuoPack,
  lesson: LessonMode = "teach",
): DialogueBeat[] {
  const beats = FLAVOR[duo.id](facts, duo, lesson).filter((b) => b.text.trim());
  return beats.length ? beats : vossDraven(facts, duo, lesson);
}
