import type { DuoPack, LessonFacts, DialogueAsk, DialogueBeat } from "./types";
import { hookAt } from "./hooks";
import { limitWords, nugget, withSan, wordCount } from "./short";

function hashSeed(facts: LessonFacts): number {
  const key = `${facts.openingId}:${facts.ply}:${facts.kind}:${facts.san ?? ""}`;
  let n = 0;
  for (let i = 0; i < key.length; i++) n = (n * 33 + key.charCodeAt(i)) >>> 0;
  return n;
}

function shouldArgue(facts: LessonFacts): boolean {
  return hashSeed(facts) % 5 === 0;
}

function lastMiss(facts: LessonFacts) {
  const misses = facts.misses;
  if (!misses?.length) return undefined;
  return misses[misses.length - 1];
}

function pair(facts: LessonFacts): { hook: string; punch: string } {
  const authored = hookAt(facts);
  if (authored && facts.kind !== "fail" && facts.kind !== "hint") {
    return { hook: authored.hook, punch: authored.punch };
  }
  const idea = nugget(facts.concept || facts.chunkName || facts.shortName, 7);
  const plan = nugget(facts.plan || facts.why, 7);
  const hook = withSan(facts.san, idea || plan);
  const punch = plan && plan !== idea ? plan : `Don't sit. ${idea || "Take the square."}`;
  return { hook, punch: limitWords(punch) };
}

function pride(facts: LessonFacts, line: string): string {
  if (facts.kind !== "ok" && facts.kind !== "start" && facts.kind !== "pin") {
    return line;
  }
  const seed = hashSeed(facts);
  if (seed % 4 !== 1) return line;
  const cheers = ["Yes!", "That's it.", "Nice.", "Love that."];
  const cheer = cheers[seed % cheers.length];
  if (line.startsWith(cheer)) return line;
  return limitWords(`${cheer} ${line}`);
}

function recallLine(facts: LessonFacts, speakerTone: "warm" | "sharp"): string | undefined {
  const miss = lastMiss(facts);
  if (!miss || facts.kind === "history") return undefined;
  if (facts.kind !== "ok" && facts.kind !== "fail" && facts.kind !== "hint") {
    return undefined;
  }
  const idea = nugget(miss.idea || facts.why, 5);
  if (speakerTone === "warm") {
    return limitWords(`Remember ${miss.san}? Same job — ${idea || "the center"}.`);
  }
  return limitWords(`You missed ${miss.san} earlier. Don't repeat it.`);
}

function askFromFacts(
  facts: LessonFacts,
  asker: DialogueBeat["speaker"],
  grader: DialogueBeat["speaker"],
): DialogueAsk | undefined {
  if (!facts.quizPrompt || !facts.quizChoices?.length) return undefined;
  if (facts.kind === "fail" || facts.kind === "hint") return undefined;
  return {
    prompt: facts.quizPrompt,
    choices: facts.quizChoices,
    onCorrect: {
      speaker: grader,
      text: "Yes. That's the job — not a tactic.",
    },
    onWrong: {
      speaker: asker,
      text: "Not that. Stay with the square.",
    },
  };
}

function beat(
  speaker: DialogueBeat["speaker"],
  text: string,
  kind: DialogueBeat["kind"],
  ask?: DialogueAsk,
): DialogueBeat {
  return { speaker, text: limitWords(text), kind, ask };
}

type FlavorFn = (facts: LessonFacts, duo: DuoPack) => DialogueBeat[];

/** Warm patient mentor vs punchy romantic tease. */
const vossDraven: FlavorFn = (facts, duo) => {
  const A = duo.left.id;
  const K = duo.right.id;
  const { hook, punch } = pair(facts);
  const ask = askFromFacts(facts, K, A);
  const missWarm = recallLine(facts, "warm");
  const missSharp = recallLine(facts, "sharp");

  if (facts.kind === "fail") {
    return [
      beat(K, missSharp ?? `Easy — that wasn't it. ${nugget(facts.concept, 6)}`, "fail"),
      beat(A, `Breathe. Play ${facts.san ?? "the book move"}. You've got this.`, "teach"),
    ];
  }
  if (facts.kind === "hint") {
    return [
      beat(A, `Play ${facts.san ?? "the book move"}. ${nugget(facts.concept, 6)}`, "hint"),
      beat(K, `Don't wait. ${nugget(facts.plan, 7)}`, "challenge"),
    ];
  }
  if (facts.kind === "history") {
    return [
      beat(A, `${facts.historyYear ?? "Here"}. ${nugget(facts.historyTitle, 6)}.`, "history"),
      beat(K, nugget(facts.historyHere || facts.why, 12) || "That's why it bites here.", "romantic"),
    ];
  }

  const argue = shouldArgue(facts);
  const beats: DialogueBeat[] = argue
    ? [
        beat(A, pride(facts, hook), "teach"),
        beat(K, `Nah. Don't sit — ${nugget(facts.plan || punch, 7)}`, "challenge"),
        beat(A, `Fine. One plan: ${nugget(facts.plan || hook, 6)}`, "agree"),
      ]
    : [
        beat(A, pride(facts, hook), "teach"),
        beat(K, punch, facts.romantic ? "romantic" : "challenge"),
      ];

  if (missWarm && !argue) {
    beats.unshift(beat(A, missWarm, "teach"));
    if (beats.length > 2) beats.pop();
  }
  if (ask) {
    beats.push(beat(K, "Quiz time. What's the job?", "quiz", ask));
  }
  return beats;
};

/** Ice-cold calculator vs narrative fire. */
const valeKnox: FlavorFn = (facts, duo) => {
  const S = duo.left.id;
  const R = duo.right.id;
  const { hook, punch } = pair(facts);
  const ask = askFromFacts(facts, R, S);
  const missWarm = recallLine(facts, "warm");

  if (facts.kind === "fail") {
    return [
      beat(S, `Inaccuracy. The square was ${nugget(facts.concept, 5)}.`, "fail"),
      beat(R, `You broke the story. ${nugget(facts.why, 7)}`, "challenge"),
    ];
  }
  if (facts.kind === "hint") {
    return [
      beat(S, `${facts.san ?? "Book"}. Hold it.`, "hint"),
      beat(R, `Feel the tension. ${nugget(facts.plan, 7)}`, "challenge"),
    ];
  }
  if (facts.kind === "history") {
    return [
      beat(S, `${facts.historyYear ?? "Sourced"}. ${nugget(facts.historyTitle, 6)}.`, "history"),
      beat(R, `That's the chapter. ${nugget(facts.historyHere, 8)}`, "romantic"),
    ];
  }

  const argue = shouldArgue(facts);
  const spare = limitWords(`${facts.san ?? "This"}. Hold that square.`);
  const fire = pride(facts, punch);
  const beats: DialogueBeat[] = argue
    ? [
        beat(S, spare, "teach"),
        beat(R, `No — the story is ${nugget(facts.why || hook, 6)}`, "challenge"),
        beat(S, `Agreed. ${nugget(facts.plan, 7)}`, "agree"),
      ]
    : [
        beat(S, spare, "teach"),
        beat(R, fire, facts.romantic ? "romantic" : "challenge"),
      ];

  if (missWarm && !argue) {
    beats[0] = beat(S, missWarm, "teach");
  }
  if (ask) {
    beats.push(
      beat(R, "Tell me the pattern. Not the name.", "quiz", {
        ...ask,
        onCorrect: { speaker: S, text: "Correct. Hold that plan." },
        onWrong: { speaker: R, text: "You missed the thread. Again." },
      }),
    );
  }
  return beats;
};

/** Quiet planner vs relentless investigator. */
const croweMarquez: FlavorFn = (facts, duo) => {
  const C = duo.left.id;
  const L = duo.right.id;
  const { hook, punch } = pair(facts);
  const ask = askFromFacts(facts, L, C);
  const missSharp = recallLine(facts, "sharp");

  if (facts.kind === "fail") {
    return [
      beat(L, missSharp ?? `I saw that. Soft. Walk it back.`, "fail"),
      beat(C, `Backup: play ${facts.san ?? "the book move"}. Then resume.`, "teach"),
    ];
  }
  if (facts.kind === "hint") {
    return [
      beat(C, `Primary: ${facts.san ?? "the book move"}. Stay on plan.`, "hint"),
      beat(L, `Don't stall. ${nugget(facts.concept, 7)}`, "challenge"),
    ];
  }
  if (facts.kind === "history") {
    return [
      beat(C, `The file: ${facts.historyYear ?? ""} — ${nugget(facts.historyTitle, 5)}.`, "history"),
      beat(L, `So why here? ${nugget(facts.historyHere || facts.why, 8)}`, "challenge"),
    ];
  }

  const argue = shouldArgue(facts);
  const beats: DialogueBeat[] = argue
    ? [
        beat(C, hook, "teach"),
        beat(L, `I'm not buying the sit. ${nugget(facts.plan, 6)}`, "challenge"),
        beat(C, `One plan. ${nugget(facts.plan || hook, 7)}`, "agree"),
      ]
    : [
        beat(C, hook, "teach"),
        beat(L, punch, "challenge"),
      ];

  if (missSharp && !argue) {
    beats.unshift(beat(L, missSharp, "fail"));
    if (beats.length > 2) beats.pop();
  }
  if (ask) {
    beats.push(
      beat(L, "Answer. I'll know if you're guessing.", "quiz", {
        ...ask,
        onCorrect: { speaker: C, text: "That matches the plan. Good." },
        onWrong: { speaker: L, text: "Caught. Think about the square." },
      }),
    );
  }
  return beats;
};

const FLAVOR: Record<DuoPack["id"], FlavorFn> = {
  "voss-draven": vossDraven,
  "vale-knox": valeKnox,
  "crowe-marquez": croweMarquez,
};

export function flavorBeats(facts: LessonFacts, duo: DuoPack): DialogueBeat[] {
  const raw = FLAVOR[duo.id](facts, duo).filter((b) => b.text.trim());
  const beats = raw.map((b) => ({ ...b, text: limitWords(b.text) }));
  const usable = beats.filter((b) => wordCount(b.text) > 0);
  return usable.length ? usable : vossDraven(facts, duo).map((b) => ({
    ...b,
    text: limitWords(b.text),
  }));
}
