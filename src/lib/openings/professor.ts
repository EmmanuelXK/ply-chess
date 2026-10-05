import { chunkAt, positionalIdea } from "./helpers";
import type { Opening, PositionalQuiz, ProfessorScript } from "./types";
import { authoredProfessor, authoredQuizzes } from "./authored";

/** Book rows so every system still has a script. No Why lesson and no rewritten prose. */
function generateScripts(opening: Opening): ProfessorScript[] {
  const scripts: ProfessorScript[] = [];
  const seen = new Set<number>();

  for (const line of opening.coach) {
    if (line.afterPly < 0) continue;
    seen.add(line.afterPly);
    const chunk = chunkAt(opening, line.afterPly);
    scripts.push({
      afterPly: line.afterPly,
      concept: line.text,
      why: chunk?.job ?? opening.story.conflict,
      plan: opening.pillars.attackingPlan,
    });
  }

  for (const chunk of opening.chunks) {
    const ply = Math.min(chunk.toPly, opening.moves.length - 1);
    if (seen.has(ply)) continue;
    scripts.push({
      afterPly: ply,
      concept: chunk.job || chunk.name,
      why: chunk.job || opening.story.conflict,
      plan: opening.pillars.breaksAndStorms,
    });
  }

  return scripts.sort((a, b) => a.afterPly - b.afterPly);
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

/** Attach authored lessons and quizzes. Does not invent Why copy. */
export function enrichOpening(opening: Opening): Opening {
  const authored = authoredProfessor[opening.id];
  const quizzes = authoredQuizzes[opening.id];
  return {
    ...opening,
    professor: authored?.length ? authored : generateScripts(opening),
    quizzes: quizzes?.length ? quizzes : generateQuizzes(opening),
  };
}

export function quizForPly(
  opening: Opening,
  ply: number,
): PositionalQuiz | undefined {
  return opening.quizzes.find((q) => ply >= q.fromPly && ply <= q.toPly);
}
