import { Chess } from "chess.js";
import type { Key } from "@lichess-org/chessground/types";
import { chunkAt, positionalIdea } from "./helpers";
import type {
  Opening,
  PositionalQuiz,
  ProfessorScript,
  WhyLesson,
  WhyPly,
} from "./types";
import { authoredProfessor, authoredQuizzes } from "./authored";

function moveSquares(san: string, beforeFen: string) {
  const g = new Chess(beforeFen);
  try {
    const move = g.move(san);
    if (!move) return null;
    return {
      from: move.from as Key,
      to: move.to as Key,
      fen: g.fen(),
    };
  } catch {
    return null;
  }
}

function autoBranch(opening: Opening, startPly: number, count = 6): WhyPly[] {
  const chess = new Chess();
  for (let i = 0; i < startPly; i++) {
    try {
      chess.move(opening.moves[i]);
    } catch {
      return [];
    }
  }
  const branch: WhyPly[] = [];
  const end = Math.min(opening.moves.length, startPly + count);
  for (let ply = startPly; ply < end; ply++) {
    const san = opening.moves[ply];
    const before = chess.fen();
    const played = moveSquares(san, before);
    if (!played) break;
    try {
      chess.move(san);
    } catch {
      break;
    }
    const script = opening.professor.find((p) => p.afterPly === ply);
    const userMove =
      opening.side === "white" ? ply % 2 === 0 : ply % 2 === 1;
    branch.push({
      san,
      narrate:
        script?.concept ??
        `${san}. ${userMove ? "That's your move in this system." : "They play. Watch the squares it leaves."}`,
      glyph: userMove ? "!" : undefined,
      arrows: [
        { orig: played.from, dest: played.to, brush: userMove ? "green" : "blue" },
      ],
      circles: [played.to],
    });
  }
  return branch;
}

function generateScripts(opening: Opening): ProfessorScript[] {
  const scripts: ProfessorScript[] = [];
  const seen = new Set<number>();

  for (const line of opening.coach) {
    if (line.afterPly < 0) continue;
    seen.add(line.afterPly);
    const chunk = chunkAt(opening, line.afterPly);
    const san = opening.moves[line.afterPly] ?? "";
    scripts.push({
      afterPly: line.afterPly,
      concept: `${san} — ${line.text}`,
      why: `${chunk?.job ?? opening.story.conflict} In this opening that square-job is the whole point.`,
      plan: opening.pillars.attackingPlan,
      whyLesson: {
        title: chunk?.name ?? san,
        intro: `${san}. Here's why it belongs in ${opening.shortName}.`,
        startPly: Math.min(line.afterPly + 1, opening.moves.length),
        branch: [],
      },
    });
  }

  for (const chunk of opening.chunks) {
    const ply = Math.min(chunk.toPly, opening.moves.length - 1);
    if (seen.has(ply)) continue;
    const san = opening.moves[ply] ?? "";
    scripts.push({
      afterPly: ply,
      concept: `${san} — ${chunk.name}.`,
      why: chunk.job,
      plan: opening.pillars.breaksAndStorms,
    });
  }

  return scripts.sort((a, b) => a.afterPly - b.afterPly);
}

function fillLessons(opening: Opening, scripts: ProfessorScript[]): ProfessorScript[] {
  return scripts.map((script) => {
    if (script.whyLesson && script.whyLesson.branch.length > 0) return script;
    const start =
      script.whyLesson?.startPly ??
      Math.min(script.afterPly + 1, opening.moves.length);
    return {
      ...script,
      whyLesson: {
        title: script.whyLesson?.title ?? chunkAt(opening, start)?.name ?? "Why",
        intro: script.whyLesson?.intro ?? `${script.concept} ${script.why}`,
        startPly: start,
        branch: autoBranch(opening, start),
      },
    };
  });
}

function generateQuizzes(opening: Opening): PositionalQuiz[] {
  return opening.chunks.slice(0, 6).map((chunk, i) => {
    const correct = positionalIdea(
      chunk.job,
      `${chunk.name} — ${opening.story.plan}`,
    );
    const decoys = opening.chunks
      .filter((c) => c.name !== chunk.name)
      .slice(0, 2)
      .map((c) => positionalIdea(c.job, c.name));
    while (decoys.length < 2) {
      decoys.push(
        decoys.length === 0
          ? "Grab the nearest pawn and hope."
          : "Castle the other way and attack immediately.",
      );
    }
    const choices = [
      {
        id: "a",
        text: correct,
        correct: true,
        reaction: `Yes. ${chunk.name}: ${correct} That's the positional job — not a random tactic.`,
      },
      {
        id: "b",
        text: decoys[0],
        correct: false,
        reaction: `Not that. That's a different chunk. Here the job is ${correct}`,
      },
      {
        id: "c",
        text: decoys[1],
        correct: false,
        reaction: `No. Stay with ${chunk.name}. ${correct}`,
      },
    ];
    return {
      id: `${opening.id}-q${i}`,
      fromPly: chunk.fromPly,
      toPly: chunk.toPly,
      prompt: `In ${chunk.name}, what is the positional job — not the move list?`,
      choices,
    };
  });
}

export function enrichOpening(opening: Opening): Opening {
  const authored = authoredProfessor[opening.id];
  const quizzes = authoredQuizzes[opening.id];
  const base = authored?.length ? authored : generateScripts(opening);
  const professor = fillLessons(
    { ...opening, professor: base },
    base,
  );
  return {
    ...opening,
    professor,
    quizzes: quizzes?.length ? quizzes : generateQuizzes(opening),
  };
}

export function professorAt(
  opening: Opening,
  afterPly: number,
): ProfessorScript | undefined {
  const exact = opening.professor.find((p) => p.afterPly === afterPly);
  if (exact) return exact;
  return [...opening.professor]
    .filter((p) => p.afterPly <= afterPly)
    .sort((a, b) => b.afterPly - a.afterPly)[0];
}

export function whyLessonAt(
  opening: Opening,
  ply: number,
): WhyLesson | undefined {
  const upcoming = opening.professor.find((p) => p.afterPly === ply);
  if (upcoming?.whyLesson) return upcoming.whyLesson;
  return professorAt(opening, Math.max(0, ply - 1))?.whyLesson;
}

export function quizForPly(
  opening: Opening,
  ply: number,
): PositionalQuiz | undefined {
  return opening.quizzes.find((q) => ply >= q.fromPly && ply <= q.toPly);
}

export function speakableProfessor(script: ProfessorScript): string {
  const first = script.concept.replace(/\s+/g, " ").trim().split(" ").slice(0, 15);
  return first.join(" ");
}
