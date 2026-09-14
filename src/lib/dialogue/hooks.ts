import type { LessonFacts } from "./types";

export interface ShortHook {
  ply: number;
  hook: string;
  punch: string;
}

/** Hand-cut 8–15 word pairs for the showcase lines. Generators cover the rest. */
export const SHORT_HOOKS: Record<string, ShortHook[]> = {
  "evans-gambit": [
    {
      ply: -1,
      hook: "Italian, then b4. Don't let the bishop breathe.",
      punch: "Kick the bishop. Castle, then take d4 now.",
    },
    {
      ply: 3,
      hook: "b4 buys the tempo. That's the Evans.",
      punch: "Don't count pawns. Hunt f7 while they grab.",
    },
    {
      ply: 7,
      hook: "c3 and d4. Open the center now.",
      punch: "Ba3 next. Don't let that bishop sit.",
    },
    {
      ply: 11,
      hook: "Castle, then take d4. Keep it simple.",
      punch: "Recapture and park on Bb6. Keep going.",
    },
  ],
  "black-lion": [
    {
      ply: -1,
      hook: "You're a lion in a house-cat coat.",
      punch: "Coil …e5. Don't rush the fianchetto.",
    },
    {
      ply: 0,
      hook: "e4 asks for a cheap Italian. Coil first.",
      punch: "Don't meet it with …g6. Hide, then …e5.",
    },
    {
      ply: 1,
      hook: "…d6 is the house. Hold e5.",
      punch: "Now knights, then the yawn.",
    },
    {
      ply: 5,
      hook: "…Nbd7 is the tell. Not …Nc6.",
      punch: "c6 stays free. Play …e5 next.",
    },
    {
      ply: 7,
      hook: "…e5. Own d4 and f4.",
      punch: "Yes! That's the Lion waking up.",
    },
  ],
  london: [
    {
      ply: -1,
      hook: "Triangle first. Keep the poison bishop.",
      punch: "d4, Bf4, e3, c3. Don't go Jobava.",
    },
    {
      ply: 0,
      hook: "d4 is a rock, not a ram.",
      punch: "Bf4 next. That's the London soul.",
    },
    {
      ply: 2,
      hook: "Bf4 should breathe on that diagonal.",
      punch: "Don't lose this bishop cheap.",
    },
    {
      ply: 16,
      hook: "Ne5 sits. Eye f7 and d7.",
      punch: "Don't hop off. Clamp with f4.",
    },
  ],
  alapin: [
    {
      ply: 0,
      hook: "e4 opens the door. c3 is the house.",
      punch: "Don't Morra. Recapture with a pawn.",
    },
    {
      ply: 2,
      hook: "c3 is the Alapin house. d4 comes next.",
      punch: "No Open Sicilian street fight today.",
    },
    {
      ply: 6,
      hook: "d4. Recapture with a pawn. Full center.",
      punch: "The queen on d5 is a target.",
    },
    {
      ply: 18,
      hook: "Nb5 hunts the queen. She doesn't sit.",
      punch: "Then park a knight on c5.",
    },
  ],
  english: [
    {
      ply: 0,
      hook: "c4 is the hero. Don't rush d4.",
      punch: "Own d5 from the flank.",
    },
    {
      ply: 8,
      hook: "e4 clamps. You own the hole on d5.",
      punch: "Don't give that hole back.",
    },
    {
      ply: 10,
      hook: "Knight to e2 so the f-pawn can breathe.",
      punch: "Nf3 would kill your own break.",
    },
    {
      ply: 16,
      hook: "Nd5 sits. They have to live with it.",
      punch: "Hold the clamp. Expand b4 later.",
    },
  ],
  "caro-kann": [
    {
      ply: 1,
      hook: "…c6 is the wall. Not a French jail.",
      punch: "Bishop comes out before …e6.",
    },
    {
      ply: 5,
      hook: "Bishop outside the chain. That's the Caro.",
      punch: "Now …e6 is legal. Then chip …c5.",
    },
    {
      ply: 9,
      hook: "…c5 chips the head of e5.",
      punch: "Don't let that pawn sit forever.",
    },
    {
      ply: 19,
      hook: "…Nf5 sits on the hole they left.",
      punch: "Then park a knight on c4.",
    },
  ],
  "queens-gambit": [
    {
      ply: 2,
      hook: "c4 is the offer. You want the center.",
      punch: "Don't cling to the wing pawn.",
    },
    {
      ply: 6,
      hook: "Take on d5. Now the minority is legal.",
      punch: "Rook will go behind the b-pawn.",
    },
    {
      ply: 20,
      hook: "Rook behind the b-pawn. That's the tell.",
      punch: "b4 is coming. Wreck c6.",
    },
    {
      ply: 24,
      hook: "b4 anyway. Their wall is the target.",
      punch: "b5 next. Leave them a patient on c6.",
    },
  ],
  slav: [
    {
      ply: 3,
      hook: "…c6 is the Slav wall. Not Semi.",
      punch: "Don't jail the bishop with …e6 yet.",
    },
    {
      ply: 7,
      hook: "Take on c4. Then get the bishop out.",
      punch: "The pawn can wait. The bishop cannot.",
    },
    {
      ply: 9,
      hook: "Bishop outside the chain. That's the Slav.",
      punch: "Now …e6 is allowed. Then pin.",
    },
    {
      ply: 13,
      hook: "…Bb4 pins. e4 costs them a story.",
      punch: "Castle, then hop Nd5 if they shove.",
    },
  ],
};

export function hookAt(facts: LessonFacts): ShortHook | undefined {
  const rows = SHORT_HOOKS[facts.openingId];
  if (!rows?.length) return undefined;
  const exact = rows.find((r) => r.ply === facts.ply);
  if (exact) return exact;
  return [...rows]
    .filter((r) => r.ply <= facts.ply)
    .sort((a, b) => b.ply - a.ply)[0];
}
