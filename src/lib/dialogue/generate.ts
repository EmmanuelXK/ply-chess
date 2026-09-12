import { chunkAt, firstSentence, positionalIdea } from "@/lib/openings/helpers";
import { historyAt } from "@/lib/openings/history";
import { professorAt, quizForPly, speakableProfessor } from "@/lib/openings/professor";
import type { HistoryMilestone, Opening, WhyLesson } from "@/lib/openings/types";
import { authoredAt } from "./authored-facts";
import { getDuo } from "./duos";
import { flavorBeats } from "./flavor";
import { capWords } from "./short";
import type {
  DialogueMode,
  DialogueScene,
  DuoId,
  LessonFacts,
  LessonMode,
} from "./types";
import type { CoachKind } from "@/lib/openings/coach";

function famousLine(row?: HistoryMilestone): string | undefined {
  if (!row?.famousGame) return undefined;
  const g = row.famousGame;
  return `${g.white} – ${g.black}, ${g.year}`;
}

function mergeFacts(
  base: LessonFacts,
  extra?: Partial<LessonFacts>,
): LessonFacts {
  if (!extra) return base;
  return {
    ...base,
    ...Object.fromEntries(
      Object.entries(extra).filter(([, v]) => v !== undefined),
    ),
  };
}

export function collectFacts(input: {
  opening: Opening;
  ply: number;
  kind: CoachKind;
  fen?: string;
  san?: string;
  whyLesson?: WhyLesson;
  milestone?: HistoryMilestone;
}): LessonFacts {
  const { opening, ply, kind } = input;
  const after = Math.max(-1, ply);
  const chunk = chunkAt(opening, Math.max(0, after));
  const script = professorAt(opening, Math.max(0, after));
  const quiz = quizForPly(opening, Math.max(0, after));
  const marks = historyAt(opening, Math.max(0, after));
  const mark = input.milestone ?? marks[0];
  const authored = authoredAt(opening.id, after);
  const san = input.san ?? (after >= 0 ? opening.moves[after] : undefined);
  const romantic =
    mark?.era === "Romantic" ||
    /gambit|immortal|evergreen|sacrifice/i.test(
      `${script?.concept ?? ""} ${mark?.title ?? ""}`,
    );

  const base: LessonFacts = {
    openingId: opening.id,
    openingName: opening.name,
    shortName: opening.shortName,
    san,
    chunkName: chunk?.name,
    chunkJob: chunk?.job,
    concept:
      script?.concept ??
      positionalIdea(chunk?.job ?? opening.story.cast, opening.story.cast),
    why:
      script?.why ??
      positionalIdea(chunk?.job ?? opening.story.conflict, opening.story.plan),
    plan: script?.plan ?? opening.story.plan,
    idea: capWords(
      script?.concept ??
        positionalIdea(chunk?.job ?? opening.story.cast, opening.story.cast),
    ),
    whyShort: capWords(
      script?.why ??
        positionalIdea(chunk?.job ?? opening.story.conflict, opening.story.plan),
    ),
    planShort: capWords(script?.plan ?? opening.story.plan),
    historyTitle: mark?.title,
    historyYear: mark?.year,
    historyEra: mark?.era,
    historySummary: mark?.summary,
    historyHere: mark?.whyItMattersHere,
    famousGame: famousLine(mark),
    quizPrompt: quiz?.prompt,
    quizChoices: quiz?.choices.map((c) => ({
      id: c.id,
      text: c.text,
      correct: c.correct,
    })),
    kind,
    fen: input.fen,
    ply: after,
    romantic,
  };

  return mergeFacts(base, authored);
}

function headlineFrom(facts: LessonFacts, dual: boolean): string {
  if (dual) return capWords(facts.idea ?? facts.concept);
  return capWords(facts.concept);
}

export function sceneFromFacts(
  facts: LessonFacts,
  duoId: DuoId,
  mode: DialogueMode,
  soloText?: string,
  lesson: LessonMode = "teach",
): DialogueScene {
  const duo = getDuo(duoId);
  if (mode === "solo") {
    const text = capWords(soloText?.trim() || facts.idea || facts.concept);
    return {
      beats: [
        {
          speaker: duo.left.id,
          text,
          kind: facts.kind === "fail" ? "fail" : "teach",
        },
      ],
      headline: text,
      speaker: duo.left.id,
      kind: facts.kind,
    };
  }

  const beats = flavorBeats(facts, duo, lesson);
  return {
    beats,
    headline: headlineFrom(facts, true),
    detail: beats.find((b) => b.kind === "takeaway")?.text,
    speaker: beats[0]?.speaker ?? duo.left.id,
    kind: facts.kind,
  };
}

export function dialogueForPly(
  opening: Opening,
  afterPly: number,
  opts: {
    duo: DuoId;
    mode: DialogueMode;
    lesson?: LessonMode;
    kind?: CoachKind;
    fen?: string;
    soloText?: string;
    studentMove?: boolean;
    recall?: string;
  },
): DialogueScene {
  const facts = collectFacts({
    opening,
    ply: afterPly,
    kind: opts.kind ?? "ok",
    fen: opts.fen,
  });
  facts.studentMove = opts.studentMove;
  facts.recall = opts.recall;
  return sceneFromFacts(
    facts,
    opts.duo,
    opts.mode,
    opts.soloText,
    opts.lesson ?? "teach",
  );
}

export function dialogueForStart(
  opening: Opening,
  opts: { duo: DuoId; mode: DialogueMode; lesson?: LessonMode; soloText?: string },
): DialogueScene {
  return dialogueForPly(opening, -1, {
    ...opts,
    kind: "start",
  });
}

export function dialogueForWhy(
  opening: Opening,
  lesson: WhyLesson,
  narrate: string,
  opts: { duo: DuoId; mode: DialogueMode; lesson?: LessonMode },
): DialogueScene {
  const facts = collectFacts({
    opening,
    ply: lesson.startPly,
    kind: "why",
    whyLesson: lesson,
  });
  facts.concept = narrate;
  facts.idea = capWords(narrate);
  facts.why = lesson.intro;
  facts.whyShort = capWords(lesson.intro);
  return sceneFromFacts(
    facts,
    opts.duo,
    opts.mode,
    narrate,
    opts.lesson ?? "teach",
  );
}

export function dialogueForHistory(
  opening: Opening,
  milestone: HistoryMilestone,
  opts: { duo: DuoId; mode: DialogueMode; lesson?: LessonMode },
): DialogueScene {
  const ply = typeof milestone.plyOrFen === "number" ? milestone.plyOrFen : 0;
  const facts = collectFacts({
    opening,
    ply,
    kind: "history",
    milestone,
  });
  return sceneFromFacts(
    facts,
    opts.duo,
    opts.mode,
    capWords(milestone.whyItMattersHere),
    opts.lesson ?? "teach",
  );
}

export function dialogueForQuizReaction(
  opening: Opening,
  reaction: string,
  correct: boolean,
  opts: { duo: DuoId; mode: DialogueMode },
): DialogueScene {
  const duo = getDuo(opts.duo);
  const speaker = correct ? duo.left.id : duo.right.id;
  const text = capWords(reaction);
  return {
    beats: [
      {
        speaker,
        text,
        kind: correct ? "agree" : "challenge",
      },
    ],
    headline: text,
    speaker,
    kind: "quiz",
  };
}

export { speakableProfessor };
