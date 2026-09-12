import { firstSentence } from "@/lib/openings/helpers";
import type { DuoPack, LessonFacts, DialogueAsk, DialogueBeat } from "./types";

function clip(text: string, max = 160): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  const sentence = firstSentence(compact);
  return sentence.length <= max ? sentence : `${sentence.slice(0, max - 1)}…`;
}

function askFromFacts(
  facts: LessonFacts,
  asker: DialogueBeat["speaker"],
  grader: DialogueBeat["speaker"],
): DialogueAsk | undefined {
  if (!facts.quizPrompt || !facts.quizChoices?.length) return undefined;
  return {
    prompt: facts.quizPrompt,
    choices: facts.quizChoices,
    onCorrect: {
      speaker: grader,
      text: `Yes. ${clip(facts.plan)} That's the job — not a random tactic.`,
    },
    onWrong: {
      speaker: asker,
      text: `Not that. The job is ${clip(facts.why)} Stay with the square.`,
    },
  };
}

type FlavorFn = (facts: LessonFacts, duo: DuoPack) => DialogueBeat[];

/** Wise patient philosophy vs sharp ambitious punch. */
const vossDraven: FlavorFn = (facts, duo) => {
  const A = duo.left.id;
  const K = duo.right.id;
  const ask = askFromFacts(facts, K, A);

  if (facts.kind === "fail") {
    return [
      {
        speaker: K,
        text: `Soft. That's not the job. ${clip(facts.concept)}`,
        kind: "fail",
      },
      {
        speaker: A,
        text: `Breathe. ${clip(facts.why)} One square, then the next.`,
        kind: "teach",
      },
    ];
  }
  if (facts.kind === "hint") {
    return [
      {
        speaker: A,
        text: `Play ${facts.san ?? "the book move"}. ${clip(facts.concept)}`,
        kind: "hint",
      },
      {
        speaker: K,
        text: `Don't wait. Punch. ${clip(facts.plan)}`,
        kind: "challenge",
      },
    ];
  }
  if (facts.kind === "history" && facts.historySummary) {
    return [
      {
        speaker: A,
        text: `Paper on the board. ${facts.historyYear ?? ""} — ${facts.historyTitle ?? "a real game"}. ${clip(facts.historySummary, 220)}`,
        kind: "history",
      },
      {
        speaker: K,
        text: facts.famousGame
          ? `${facts.famousGame}. Here's why it bites here: ${clip(facts.historyHere ?? facts.why, 180)}`
          : `Here's why it bites here: ${clip(facts.historyHere ?? facts.why, 180)}`,
        kind: facts.romantic ? "romantic" : "challenge",
      },
    ];
  }

  const beats: DialogueBeat[] = [
    {
      speaker: A,
      text: `${clip(facts.concept)} Why this ages well: ${clip(facts.why)}`,
      kind: "teach",
    },
    {
      speaker: K,
      text: facts.romantic
        ? `Beautiful. Don't apologize. ${clip(facts.plan)}`
        : `Fine. Now punch: ${clip(facts.plan)}`,
      kind: facts.romantic ? "romantic" : "challenge",
    },
  ];
  if (ask) {
    beats.push({
      speaker: K,
      text: `${ask.prompt} Student — answer. Don't monologue it back.`,
      kind: "quiz",
      ask,
    });
  }
  return beats;
};

/** Ice-cold calculator vs obsessive narrative fire. */
const valeKnox: FlavorFn = (facts, duo) => {
  const S = duo.left.id;
  const R = duo.right.id;
  const ask = askFromFacts(facts, R, S);

  if (facts.kind === "fail") {
    return [
      {
        speaker: S,
        text: `Inaccuracy. The square was ${clip(facts.concept, 90)}`,
        kind: "fail",
      },
      {
        speaker: R,
        text: `You broke the story. ${clip(facts.why)} Rewrite it. Now.`,
        kind: "challenge",
      },
    ];
  }
  if (facts.kind === "hint") {
    return [
      {
        speaker: S,
        text: `${facts.san ?? "Book"}. ${clip(facts.concept, 100)}`,
        kind: "hint",
      },
      {
        speaker: R,
        text: `Feel the tension. ${clip(facts.plan)}`,
        kind: "challenge",
      },
    ];
  }
  if (facts.kind === "history" && facts.historySummary) {
    return [
      {
        speaker: S,
        text: `${facts.historyYear ?? ""}. ${facts.historyTitle ?? "Sourced"}. ${clip(facts.historySummary, 200)}`,
        kind: "history",
      },
      {
        speaker: R,
        text: `That's the story under this ply. ${clip(facts.historyHere ?? facts.why, 180)}`,
        kind: facts.romantic ? "romantic" : "challenge",
      },
    ];
  }

  const beats: DialogueBeat[] = [
    {
      speaker: S,
      text: `${clip(facts.concept, 110)} Correct. Hold it.`,
      kind: "teach",
    },
    {
      speaker: R,
      text: facts.romantic
        ? `This is the chapter. ${clip(facts.plan)} Don't look away.`
        : `The story of this position: ${clip(facts.why)} Then ${clip(facts.plan, 90)}`,
      kind: facts.romantic ? "romantic" : "challenge",
    },
  ];
  if (ask) {
    beats.push({
      speaker: R,
      text: `${ask.prompt} Tell me the pattern. Not the move name.`,
      kind: "quiz",
      ask: {
        ...ask,
        onCorrect: {
          speaker: S,
          text: `Correct. ${clip(facts.plan, 100)}`,
        },
        onWrong: {
          speaker: R,
          text: `You missed the thread. ${clip(facts.why)}`,
        },
      },
    });
  }
  return beats;
};

/** Quiet planner vs relentless investigator. */
const croweMarquez: FlavorFn = (facts, duo) => {
  const C = duo.left.id;
  const L = duo.right.id;
  const ask = askFromFacts(facts, L, C);

  if (facts.kind === "fail") {
    return [
      {
        speaker: L,
        text: `I saw that. Soft. Walk it back. ${clip(facts.concept)}`,
        kind: "fail",
      },
      {
        speaker: C,
        text: `Contingency: ${clip(facts.why)} Then resume the line.`,
        kind: "teach",
      },
    ];
  }
  if (facts.kind === "hint") {
    return [
      {
        speaker: C,
        text: `Primary: ${facts.san ?? "the book move"}. Backup if they deviate: stay on ${clip(facts.plan, 80)}`,
        kind: "hint",
      },
      {
        speaker: L,
        text: `Don't stall. Play it. ${clip(facts.concept, 90)}`,
        kind: "challenge",
      },
    ];
  }
  if (facts.kind === "history" && facts.historySummary) {
    return [
      {
        speaker: C,
        text: `The file: ${facts.historyYear ?? ""} — ${facts.historyTitle ?? "sourced"}. ${clip(facts.historySummary, 220)}`,
        kind: "history",
      },
      {
        speaker: L,
        text: `So why does it matter on this ply? ${clip(facts.historyHere ?? facts.why, 180)}`,
        kind: "challenge",
      },
    ];
  }

  const beats: DialogueBeat[] = [
    {
      speaker: C,
      text: `The plan has two layers. First: ${clip(facts.concept)} If they decline: ${clip(facts.plan, 80)}`,
      kind: "teach",
    },
    {
      speaker: L,
      text: `I'm watching the soft move. ${clip(facts.why)} Don't give me one.`,
      kind: "challenge",
    },
  ];
  if (ask) {
    beats.push({
      speaker: L,
      text: `${ask.prompt} Answer. I'll know if you're guessing.`,
      kind: "quiz",
      ask: {
        ...ask,
        onCorrect: {
          speaker: C,
          text: `That matches the plan. ${clip(facts.plan)}`,
        },
        onWrong: {
          speaker: L,
          text: `Caught. ${clip(facts.why)} Again.`,
        },
      },
    });
  }
  return beats;
};

const FLAVOR: Record<DuoPack["id"], FlavorFn> = {
  "voss-draven": vossDraven,
  "vale-knox": valeKnox,
  "crowe-marquez": croweMarquez,
};

export function flavorBeats(facts: LessonFacts, duo: DuoPack): DialogueBeat[] {
  const beats = FLAVOR[duo.id](facts, duo).filter((b) => b.text.trim());
  return beats.length ? beats : vossDraven(facts, duo);
}
