import type { LessonFacts } from "./types";

/** Shared pedagogical facts — duo flavor is applied later. Never triple this. */
export const AUTHORED_FACTS: Record<string, Partial<LessonFacts>[]> = {
  "black-lion": [
    {
      ply: -1,
      concept:
        "You are a lion that looks like a house cat. Philidor teeth, not a Pirc fianchetto.",
      why: "White wants a cheap Italian attack on f7. Hide the king, coil …e5, then yawn.",
      plan: "…d6, …Nf6, …Nbd7, …e5. Don't rush …g6. The long bishop is not this system's soul.",
      quizPrompt: "What's the Lion's first job — the plan, not the move list?",
      quizChoices: [
        {
          id: "a",
          text: "Fianchetto and storm the kingside now",
          correct: false,
        },
        {
          id: "b",
          text: "Coil a Philidor center, hide the king, then bite",
          correct: true,
        },
        { id: "c", text: "Grab the c-pawn and raid b2", correct: false },
      ],
    },
    {
      ply: 1,
      concept:
        "…d6 is the Lion house. The pawn holds e5 and keeps the dark bishop's door closed until you're ready.",
      why: "You want a Philidor center, not a fianchetto. …d6 lets …e5 come in one breath.",
      plan: "Next is …Nf6 and …Nbd7. Don't rush …g6.",
    },
    {
      ply: 5,
      concept:
        "…Nbd7 is the tell. Not …Nc6, not …g6. The Lion develops behind the e-pawn.",
      why: "The knight supports …e5 and keeps c6 free for the spine pawn.",
      plan: "Now …e5. That's the break.",
      quizPrompt: "Why …Nbd7 instead of …Nc6?",
      quizChoices: [
        { id: "a", text: "So …c6 stays free and …e5 is supported", correct: true },
        { id: "b", text: "So you can castle queenside", correct: false },
        { id: "c", text: "So the knight can take on e4 now", correct: false },
      ],
    },
    {
      ply: 7,
      concept:
        "…e5 — the knight and pawns should own d4 and f4. Without it you're a passive Philidor.",
      why: "With …e5 you have a stake, a later …e4 wedge, and you blunt Bc4's stare at f7.",
      plan: "Cover f7 with …Be7, then …c6, then castle.",
      romantic: true,
    },
    {
      ply: 11,
      concept: "…c6 is the Lion's spine. It blunts d5 and gives the queen a path to c7.",
      why: "It stops Nb5 and Nd5 cheap shots, and prepares the queenside yawn …b5 if they sit.",
      plan: "Castle. Then coil: …Qc7, …h6, …Re8. Queen first.",
    },
    {
      ply: 13,
      concept: "Castle. The king should leave the center now that f7 is covered.",
      why: "In the Bc4 shell, every delay is an invitation to Bxf7+ or Ng5.",
      plan: "Queen to c7. Then …h6 so Bg5 never pins you. Then rook to e8.",
    },
    {
      ply: 15,
      concept:
        "…Qc7 is a coil square, not a raid. It eyes e5 and the c-file, and it unblocks the rook.",
      why: "If the queen stays on d8, the rook can't reach e8. c7 is the battery square for later …e4.",
      plan: "…h6 next — air, and no Bg5. Then …Re8. Then the hop …Nf8-g6.",
      quizPrompt: "What's the plan from …Qc7 — coil or raid?",
      quizChoices: [
        { id: "a", text: "Grab b2 and force their rook", correct: false },
        {
          id: "b",
          text: "Coil: clear e8, watch e5, build …e4",
          correct: true,
        },
        { id: "c", text: "Castle queenside and storm", correct: false },
      ],
    },
  ],
  london: [
    {
      ply: -1,
      concept:
        "You are a wall with a poison bishop on f4. Triangle first. Same house every game.",
      why: "Black wants …c5 and to take your London bishop. Keep it. Squeeze before they start a fight.",
      plan: "d4, Bf4, e3, c3. Don't play Nc3 — that's Jobava, a different hunt.",
      quizPrompt: "What's the London's first job?",
      quizChoices: [
        { id: "a", text: "Sacrifice c4 and open the file", correct: false },
        {
          id: "b",
          text: "Build the triangle, keep the bishop, squeeze",
          correct: true,
        },
        { id: "c", text: "Play Nc3 and hunt c7 immediately", correct: false },
      ],
    },
    {
      ply: 0,
      concept: "d4 — you own the dark squares. This pawn should be a rock, not a battering ram.",
      why: "The London is a system. d4 plus Bf4 plus e3 is the triangle.",
      plan: "Bf4 next. Don't play Nc3 here.",
    },
    {
      ply: 2,
      concept:
        "Bf4 — this bishop should breathe on the h2–b8 diagonal. It's the soul of the London.",
      why: "If you lose this bishop cheaply, you have a boring Queen's Pawn Game.",
      plan: "e3, Nf3, c3. Triangle. Meet …c5 by guarding d4.",
      romantic: true,
    },
    {
      ply: 8,
      concept: "c3 — d4 is a rock. This pawn overprotects the center so the knights can hop.",
      why: "c3 is how you refuse Jobava. It blunts …Nb4 and …Bb4.",
      plan: "Both knights, then Bg3 if they hit Bd6. Keep the bishop.",
    },
    {
      ply: 12,
      concept: "Bg3 — they wanted the London bishop. You said no. It still bites.",
      why: "Retreating to g3 keeps the diagonal and dares them to wreck their kingside with …Bxg3 hxg3.",
      plan: "Ne5. Sit on their throat. Then f4 clamps.",
    },
    {
      ply: 16,
      concept: "Ne5 — the knight should sit here. Control f7, d7, c6, g6. Don't hop off.",
      why: "Ne5 is the London's attacking outpost. It frees f4, eyes h7, and makes …c5 less comfortable.",
      plan: "f4 next — space. Queen lifts. Castle. Don't donate the outpost.",
      quizPrompt: "Ne5 is in. What should that knight actually do?",
      quizChoices: [
        { id: "a", text: "Hop off as soon as they kick it", correct: false },
        {
          id: "b",
          text: "Sit. Eye f7/d7/c6/g6. Free f4.",
          correct: true,
        },
        { id: "c", text: "Trade for their light-squared bishop", correct: false },
      ],
      romantic: true,
    },
  ],
};

export function authoredAt(
  openingId: string,
  ply: number,
): Partial<LessonFacts> | undefined {
  const rows = AUTHORED_FACTS[openingId];
  if (!rows?.length) return undefined;
  const exact = rows.find((r) => r.ply === ply);
  if (exact) return exact;
  return [...rows]
    .filter((r) => typeof r.ply === "number" && r.ply <= ply && r.ply >= 0)
    .sort((a, b) => (b.ply ?? 0) - (a.ply ?? 0))[0];
}
