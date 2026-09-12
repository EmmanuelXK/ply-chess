import type { LessonFacts } from "./types";

/** Shared short kernels — duo flavor wraps these. Never dump long lectures. */
export const AUTHORED_FACTS: Record<string, Partial<LessonFacts>[]> = {
  "black-lion": [
    {
      ply: -1,
      idea: "Philidor house. Coil, then bite. Not a Pirc.",
      whyShort: "They want f7. Hide the king first.",
      planShort: "…d6, …Nf6, …Nbd7, then …e5.",
      concept: "Philidor house. Coil, then bite. Not a Pirc.",
      why: "They want f7. Hide the king first.",
      plan: "…d6, …Nf6, …Nbd7, then …e5.",
      quizPrompt: "Lion's job — coil or raid?",
      quizChoices: [
        { id: "a", text: "Fianchetto and storm now", correct: false },
        { id: "b", text: "Coil the center, then bite", correct: true },
        { id: "c", text: "Grab c-pawn and raid b2", correct: false },
      ],
    },
    {
      ply: 1,
      idea: "…d6 holds e5. Philidor house, not …g6.",
      whyShort: "e5 comes in one breath from here.",
      planShort: "…Nf6 and …Nbd7. Leave g6.",
      concept: "…d6 holds e5. Philidor house, not …g6.",
      why: "e5 comes in one breath from here.",
      plan: "…Nf6 and …Nbd7. Leave g6.",
    },
    {
      ply: 5,
      idea: "…Nbd7 is the tell. Behind the e-pawn.",
      whyShort: "It supports …e5 and keeps c6 free.",
      planShort: "Now …e5. That's the break.",
      concept: "…Nbd7 is the tell. Behind the e-pawn.",
      why: "It supports …e5 and keeps c6 free.",
      plan: "Now …e5. That's the break.",
      quizPrompt: "Why …Nbd7, not …Nc6?",
      quizChoices: [
        { id: "a", text: "Keeps c6 free, backs …e5", correct: true },
        { id: "b", text: "So you castle queenside", correct: false },
        { id: "c", text: "To take e4 right now", correct: false },
      ],
    },
    {
      ply: 7,
      idea: "…e5 owns d4 and f4. Stake, not a trade.",
      whyShort: "Without it you're a passive Philidor.",
      planShort: "…Be7 covers f7. Then …c6.",
      concept: "…e5 owns d4 and f4. Stake, not a trade.",
      why: "Without it you're a passive Philidor.",
      plan: "…Be7 covers f7. Then …c6.",
      romantic: true,
    },
    {
      ply: 11,
      idea: "…c6 is the spine. Blunts d5, frees c7.",
      whyShort: "Stops Nb5 and Nd5 cheap shots.",
      planShort: "Castle. Queen to c7 next.",
      concept: "…c6 is the spine. Blunts d5, frees c7.",
      why: "Stops Nb5 and Nd5 cheap shots.",
      plan: "Castle. Queen to c7 next.",
    },
    {
      ply: 13,
      idea: "Castle now. f7 is covered. Leave the center.",
      whyShort: "Delay invites Bxf7+ or Ng5.",
      planShort: "…Qc7, then …h6, then …Re8.",
      concept: "Castle now. f7 is covered. Leave the center.",
      why: "Delay invites Bxf7+ or Ng5.",
      plan: "…Qc7, then …h6, then …Re8.",
    },
    {
      ply: 15,
      idea: "…Qc7 is a coil square, not a raid.",
      whyShort: "Clears e8 and watches e5.",
      planShort: "…h6, …Re8, then …Nf8-g6.",
      concept: "…Qc7 is a coil square, not a raid.",
      why: "Clears e8 and watches e5.",
      plan: "…h6, …Re8, then …Nf8-g6.",
      quizPrompt: "From …Qc7 — coil or raid?",
      quizChoices: [
        { id: "a", text: "Grab b2, force their rook", correct: false },
        { id: "b", text: "Clear e8, build …e4", correct: true },
        { id: "c", text: "Castle long and storm", correct: false },
      ],
    },
  ],
  london: [
    {
      ply: -1,
      idea: "Triangle house. Same setup every game.",
      whyShort: "They want …c5 and your London bishop.",
      planShort: "d4, Bf4, e3, c3. No Nc3.",
      concept: "Triangle house. Same setup every game.",
      why: "They want …c5 and your London bishop.",
      plan: "d4, Bf4, e3, c3. No Nc3.",
      quizPrompt: "London's job — what first?",
      quizChoices: [
        { id: "a", text: "Sac c4, open the file", correct: false },
        { id: "b", text: "Triangle, keep bishop, squeeze", correct: true },
        { id: "c", text: "Nc3 and hunt c7 now", correct: false },
      ],
    },
    {
      ply: 0,
      idea: "d4 is a rock. Dark squares, not a ram.",
      whyShort: "The triangle starts on this pawn.",
      planShort: "Bf4 next. Don't play Nc3.",
      concept: "d4 is a rock. Dark squares, not a ram.",
      why: "The triangle starts on this pawn.",
      plan: "Bf4 next. Don't play Nc3.",
    },
    {
      ply: 2,
      idea: "Bf4 owns h2–b8. That's the London soul.",
      whyShort: "Lose this bishop, you have a dull QP.",
      planShort: "e3, Nf3, c3. Guard d4 vs …c5.",
      concept: "Bf4 owns h2–b8. That's the London soul.",
      why: "Lose this bishop, you have a dull QP.",
      plan: "e3, Nf3, c3. Guard d4 vs …c5.",
      romantic: true,
    },
    {
      ply: 8,
      idea: "c3 overprotects d4. Knights can hop.",
      whyShort: "This refuses Jobava. No …Nb4 cheap.",
      planShort: "Develop knights. Bg3 if …Bd6.",
      concept: "c3 overprotects d4. Knights can hop.",
      why: "This refuses Jobava. No …Nb4 cheap.",
      plan: "Develop knights. Bg3 if …Bd6.",
    },
    {
      ply: 12,
      idea: "Bg3. They wanted the bishop. You kept it.",
      whyShort: "…Bxg3 hxg3 opens your rook file.",
      planShort: "Ne5 next. Sit. Then f4.",
      concept: "Bg3. They wanted the bishop. You kept it.",
      why: "…Bxg3 hxg3 opens your rook file.",
      plan: "Ne5 next. Sit. Then f4.",
    },
    {
      ply: 16,
      idea: "Ne5 sits. f7, d7, c6, g6. Don't hop.",
      whyShort: "Outpost frees f4 and eyes h7.",
      planShort: "f4 clamp. Queen lift. Castle.",
      concept: "Ne5 sits. f7, d7, c6, g6. Don't hop.",
      why: "Outpost frees f4 and eyes h7.",
      plan: "f4 clamp. Queen lift. Castle.",
      quizPrompt: "Ne5 — what's the knight's job?",
      quizChoices: [
        { id: "a", text: "Hop off when kicked", correct: false },
        { id: "b", text: "Sit. Eye f7. Free f4.", correct: true },
        { id: "c", text: "Trade their light bishop", correct: false },
      ],
      romantic: true,
    },
  ],
};

function withoutPly(
  row: Partial<LessonFacts> | undefined,
): Partial<LessonFacts> | undefined {
  if (!row) return undefined;
  const { ply: _ply, ...rest } = row;
  return rest;
}

export function authoredAt(
  openingId: string,
  ply: number,
): Partial<LessonFacts> | undefined {
  const rows = AUTHORED_FACTS[openingId];
  if (!rows?.length) return undefined;
  const exact = rows.find((r) => r.ply === ply);
  if (exact) return withoutPly(exact);
  const nearest = [...rows]
    .filter((r) => typeof r.ply === "number" && r.ply <= ply && r.ply >= 0)
    .sort((a, b) => (b.ply ?? 0) - (a.ply ?? 0))[0];
  return withoutPly(nearest);
}
