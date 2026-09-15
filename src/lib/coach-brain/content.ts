import { SHORT_HOOKS, spokenHook } from "@/lib/dialogue/hooks";
import { quizForPly } from "@/lib/openings/professor";
import { housePicture } from "@/lib/openings/memory";
import { chunkAt, looksLikeMoveList } from "@/lib/openings/helpers";
import { professorAt } from "@/lib/openings/professor";
import type { Opening } from "@/lib/openings/types";
import type { DialogueAsk, LessonFacts } from "@/lib/dialogue/types";
import { COACH_SPEAKER } from "@/lib/tts/types";
import { leadsWithSan, limitWords } from "@/lib/dialogue/short";
import { planStripText } from "@/lib/openings/coach";
import type {
  CandidateMove,
  CompressDecision,
  ContentSource,
  HumanLayer,
  SelectedContent,
  TeachMethod,
  TeachingIntent,
} from "./types";

function hookAtPly(opening: Opening, afterPly: number) {
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

function authoredLine(
  opening: Opening,
  afterPly: number,
  facts: LessonFacts,
  soloText?: string,
): { text: string; source: ContentSource } {
  const exact = hookAtPly(opening, afterPly);
  if (exact) return { text: spokenHook(exact), source: "hook" };

  const pin = opening.pins.find((row) => row.afterPly === afterPly);
  if (pin) {
    const hook = nearestHook(opening, afterPly);
    return {
      text: hook ? spokenHook(hook) : (soloText || `${pin.label}. That's the landmark.`),
      source: "pin",
    };
  }

  if (soloText?.trim()) {
    const hook = nearestHook(opening, afterPly);
    const usable =
      !leadsWithSan(soloText) && !looksLikeMoveList(soloText);
    if (usable) {
      return { text: soloText, source: hook ? "hook" : "story" };
    }
  }

  const hook = nearestHook(opening, afterPly);
  if (hook) return { text: spokenHook(hook), source: "hook" };

  const beat = opening.storyBeats.find((row) => row.afterPly === afterPly);
  if (beat?.beat) return { text: beat.beat, source: "story" };

  const script = professorAt(opening, afterPly);
  if (script?.concept) return { text: script.concept, source: "professor" };

  if (facts.historyHere) return { text: facts.historyHere, source: "history" };

  const chunk = chunkAt(opening, Math.max(0, afterPly));
  return { text: housePicture(chunk), source: "story" };
}

function problemAsk(human: HumanLayer, facts: LessonFacts): DialogueAsk {
  const authored = facts.quizPrompt && facts.quizChoices?.length;
  if (authored && facts.quizPrompt && facts.quizChoices) {
    return {
      prompt: facts.quizPrompt,
      choices: facts.quizChoices,
      onCorrect: { speaker: COACH_SPEAKER, text: "Yes. That's the problem." },
      onWrong: { speaker: COACH_SPEAKER, text: "Not that. Stay with their idea." },
    };
  }
  return {
    prompt: "What's the problem here — their idea?",
    choices: [
      { id: "a", text: limitWords(human.why || facts.why, 10), correct: true },
      { id: "b", text: "Grab a pawn and hope", correct: false },
      { id: "c", text: "Trade everything now", correct: false },
    ],
    onCorrect: { speaker: COACH_SPEAKER, text: "Yes. That's their idea." },
    onWrong: { speaker: COACH_SPEAKER, text: "Not that. Watch their plan." },
  };
}

function candidateAsk(
  compressed: CandidateMove[],
  human: HumanLayer,
  facts: LessonFacts,
): DialogueAsk {
  const book = compressed.find((row) => row.book) ?? compressed[0];
  const other =
    compressed.find((row) => !row.book && row.classification !== "Critical") ??
    compressed.find((row) => row !== book);
  const correct = limitWords(human.what || book?.reason || facts.concept, 10);
  const wrong = limitWords(other?.reason || "Grab material and drift", 10);
  return {
    prompt: "Two candidates. Which idea holds?",
    choices: [
      { id: "a", text: correct, correct: true },
      { id: "b", text: wrong === correct ? "Loot and run" : wrong, correct: false },
    ],
    onCorrect: { speaker: COACH_SPEAKER, text: "Yes. That's the idea to keep." },
    onWrong: { speaker: COACH_SPEAKER, text: "Not that. Hold the house job." },
  };
}

function contrastLine(opening: Opening, afterPly: number, facts: LessonFacts): string {
  const hook = hookAtPly(opening, afterPly) ?? nearestHook(opening, afterPly);
  if (hook) {
    return spokenHook(hook);
  }
  return limitWords(`Not their plan. ${facts.concept || facts.why}`);
}

/**
 * Map a TeachingIntent onto authored SHORT_HOOKS / pins / professor / story / Why.
 * Never invents chess truth or best-move claims.
 */
export function selectContent(input: {
  opening: Opening;
  afterPly: number;
  facts: LessonFacts;
  intent: TeachingIntent;
  method: TeachMethod;
  compress: CompressDecision;
  soloText?: string;
}): SelectedContent {
  const { opening, afterPly, facts, intent, method, compress, soloText } = input;

  if (intent === "SILENCE") {
    return { intent, text: "", source: "silence", method };
  }

  if (intent === "PREDICT") {
    const ask = problemAsk(compress.human, facts);
    const quiz = quizForPly(opening, Math.max(0, afterPly));
    return {
      intent,
      text: limitWords(quiz?.prompt ?? ask.prompt),
      ask,
      nextAsk: candidateAsk(compress.compressed, compress.human, facts),
      source: facts.quizPrompt ? "quiz" : "hook",
      method,
    };
  }

  if (intent === "RECALL") {
    const ask = candidateAsk(compress.compressed, compress.human, facts);
    return {
      intent,
      text: limitWords(ask.prompt),
      ask,
      source: "quiz",
      method,
    };
  }

  if (intent === "CONTRAST") {
    return {
      intent,
      text: contrastLine(opening, afterPly, facts),
      detail: limitWords(compress.human.whatChanges),
      source: "hook",
      method,
    };
  }

  if (intent === "CORRECT") {
    const authored = authoredLine(opening, afterPly, facts, soloText);
    if (method === "question") {
      const ask = problemAsk(compress.human, facts);
      const line = authored.text;
      return {
        intent,
        text: limitWords(
          line && !leadsWithSan(line) ? line : ask.prompt,
        ),
        ask,
        nextAsk: candidateAsk(compress.compressed, compress.human, facts),
        source: "quiz",
        method,
      };
    }
    if (method === "contrast") {
      return {
        intent,
        text: contrastLine(opening, afterPly, facts),
        source: "hook",
        method,
      };
    }
    return {
      intent,
      text: limitWords(soloText || authored.text),
      source: authored.source,
      method,
    };
  }

  if (facts.kind === "plan") {
    const line =
      soloText && !leadsWithSan(soloText) && !looksLikeMoveList(soloText)
        ? soloText
        : planStripText(opening, "aggressive");
    return { intent, text: limitWords(line), source: "hook", method };
  }

  const authored = authoredLine(opening, afterPly, facts, soloText);
  return {
    intent,
    text: limitWords(authored.text || soloText || facts.concept),
    source: authored.source,
    method,
  };
}
