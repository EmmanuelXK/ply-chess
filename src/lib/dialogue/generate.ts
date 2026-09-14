import { chunkAt, firstSentence, looksLikeMoveList, positionalIdea } from "@/lib/openings/helpers";
import { housePicture } from "@/lib/openings/memory";
import { historyAt } from "@/lib/openings/history";
import { professorAt, quizForPly, speakableProfessor } from "@/lib/openings/professor";
import type { HistoryMilestone, Opening, WhyLesson } from "@/lib/openings/types";
import {
  coachAfterPly,
  coachAtStart,
  shouldSpeakCoach,
  type CoachKind,
} from "@/lib/openings/coach";
import { COACH_SPEAKER } from "@/lib/tts/types";
import { authoredAt } from "./authored-facts";
import { purposeBeats } from "./purpose";
import { limitWords, nugget } from "./short";
import type {
  DialogueMode,
  DialogueScene,
  DuoId,
  LessonFacts,
  MissMemory,
} from "./types";

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
  misses?: MissMemory[];
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
  const picture = housePicture(chunk);
  const conceptRaw = script?.concept ?? picture;
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
    concept: looksLikeMoveList(conceptRaw)
      ? picture
      : positionalIdea(conceptRaw, picture),
    why:
      script?.why && !looksLikeMoveList(script.why)
        ? firstSentence(script.why)
        : positionalIdea(chunk?.job ?? opening.story.conflict, picture),
    plan: script?.plan ?? opening.story.plan,
    historyTitle: mark?.title,
    historyYear: mark?.year,
    historyEra: mark?.era,
    historySummary: mark?.summary,
    historyHere: mark?.whyItMattersHere,
    famousGame: famousLine(mark),
    quizPrompt: authored?.quizPrompt ?? (after >= 0 ? quiz?.prompt : undefined),
    quizChoices:
      authored?.quizChoices ??
      (after >= 0
        ? quiz?.choices.map((c) => ({
            id: c.id,
            text: c.text,
            correct: c.correct,
          }))
        : undefined),
    kind,
    fen: input.fen,
    ply: after,
    romantic,
    misses: input.misses,
  };

  return mergeFacts(base, authored);
}

function headlineFrom(facts: LessonFacts): string {
  return limitWords(nugget(facts.concept || facts.chunkName, 10) || facts.shortName);
}

export function silentScene(kind: CoachKind = "ok"): DialogueScene {
  return {
    beats: [],
    headline: "",
    speaker: COACH_SPEAKER,
    kind,
  };
}

export function sceneFromFacts(
  facts: LessonFacts,
  _duoId: DuoId,
  _mode: DialogueMode,
  soloText?: string,
): DialogueScene {
  const beats = purposeBeats(facts, soloText).map((beat) => ({
    ...beat,
    speaker: COACH_SPEAKER,
  }));
  return {
    beats,
    headline: headlineFrom(facts),
    speaker: COACH_SPEAKER,
    kind: facts.kind,
    purpose: beats[0]?.purpose,
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
    misses?: MissMemory[];
  },
): DialogueScene {
  const kind = opts.kind ?? "ok";
  if (!shouldSpeakCoach(kind, opening, afterPly)) {
    return silentScene(kind);
  }
  const soloText =
    opts.soloText ??
    (kind === "start"
      ? coachAtStart(opening).text
      : kind === "ok"
        ? coachAfterPly(opening, afterPly).text
        : undefined);
  const facts = collectFacts({
    opening,
    ply: afterPly,
    kind,
    fen: opts.fen,
    misses: opts.misses,
  });
  return sceneFromFacts(facts, opts.duo, opts.mode, soloText);
}

export function dialogueForStart(
  opening: Opening,
  opts: { duo: DuoId; mode: DialogueMode; soloText?: string; misses?: MissMemory[] },
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
  facts.concept = limitWords(narrate, 15) || facts.concept;
  facts.why = limitWords(lesson.intro, 15);
  return sceneFromFacts(facts, opts.duo, opts.mode, limitWords(narrate, 15));
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
  const solo = nugget(milestone.whyItMattersHere || milestone.summary, 12);
  return sceneFromFacts(facts, opts.duo, opts.mode, solo);
}

export function dialogueForQuizReaction(
  opening: Opening,
  reaction: string,
  correct: boolean,
  opts: { duo: DuoId; mode: DialogueMode },
): DialogueScene {
  void opening;
  void opts;
  const purpose = correct ? "hold-the-square" : "stop-opponent-plan";
  return {
    beats: [
      {
        speaker: COACH_SPEAKER,
        text: limitWords(
          correct
            ? "Yes. That's the job — hold the square."
            : nugget(reaction, 10) || "Not that. Stop their plan.",
        ),
        kind: correct ? "agree" : "challenge",
        purpose,
      },
    ],
    headline: correct ? "Yes." : "Not that.",
    speaker: COACH_SPEAKER,
    kind: "quiz",
    purpose,
  };
}

export { speakableProfessor };
