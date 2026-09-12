import { chunkAt, firstSentence, positionalIdea } from "@/lib/openings/helpers";
import { historyAt } from "@/lib/openings/history";
import { professorAt, quizForPly, speakableProfessor } from "@/lib/openings/professor";
import type { HistoryMilestone, Opening, WhyLesson } from "@/lib/openings/types";
import { authoredAt } from "./authored-facts";
import { getDuo } from "./duos";
import { flavorBeats } from "./flavor";
import type {
  DialogueMode,
  DialogueScene,
  DuoId,
  LessonFacts,
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
  if (dual) return firstSentence(facts.concept);
  return facts.concept;
}

export function sceneFromFacts(
  facts: LessonFacts,
  duoId: DuoId,
  mode: DialogueMode,
  soloText?: string,
): DialogueScene {
  const duo = getDuo(duoId);
  if (mode === "solo") {
    const text =
      soloText?.trim() ||
      `${facts.concept} ${facts.why} ${facts.plan}`.replace(/\s+/g, " ").trim();
    return {
      beats: [
        {
          speaker: duo.left.id,
          text,
          kind: facts.kind === "fail" ? "fail" : "teach",
        },
      ],
      headline: firstSentence(text),
      detail: facts.plan,
      speaker: duo.left.id,
      kind: facts.kind,
    };
  }

  const beats = flavorBeats(facts, duo);
  return {
    beats,
    headline: headlineFrom(facts, true),
    detail: beats[1]?.text ?? facts.plan,
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
    kind?: CoachKind;
    fen?: string;
    soloText?: string;
  },
): DialogueScene {
  const facts = collectFacts({
    opening,
    ply: afterPly,
    kind: opts.kind ?? "ok",
    fen: opts.fen,
  });
  return sceneFromFacts(facts, opts.duo, opts.mode, opts.soloText);
}

export function dialogueForStart(
  opening: Opening,
  opts: { duo: DuoId; mode: DialogueMode; soloText?: string },
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
  opts: { duo: DuoId; mode: DialogueMode },
): DialogueScene {
  const facts = collectFacts({
    opening,
    ply: lesson.startPly,
    kind: "why",
    whyLesson: lesson,
  });
  facts.concept = narrate;
  facts.why = lesson.intro;
  return sceneFromFacts(facts, opts.duo, opts.mode, narrate);
}

export function dialogueForHistory(
  opening: Opening,
  milestone: HistoryMilestone,
  opts: { duo: DuoId; mode: DialogueMode },
): DialogueScene {
  const ply = typeof milestone.plyOrFen === "number" ? milestone.plyOrFen : 0;
  const facts = collectFacts({
    opening,
    ply,
    kind: "history",
    milestone,
  });
  const solo = `${milestone.summary} ${milestone.whyItMattersHere}`;
  return sceneFromFacts(facts, opts.duo, opts.mode, solo);
}

export function dialogueForQuizReaction(
  opening: Opening,
  reaction: string,
  correct: boolean,
  opts: { duo: DuoId; mode: DialogueMode },
): DialogueScene {
  const duo = getDuo(opts.duo);
  const speaker = correct ? duo.left.id : duo.right.id;
  return {
    beats: [
      {
        speaker,
        text: reaction,
        kind: correct ? "agree" : "challenge",
      },
    ],
    headline: firstSentence(reaction),
    speaker,
    kind: "quiz",
  };
}

export { speakableProfessor };
