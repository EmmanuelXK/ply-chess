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
      punch: "Kick the bishop. Castle, then take d4.",
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
      hook: "Castle, then take d4. Simple.",
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
      ply: 1,
      hook: "…d6 is the house. Hold e5.",
      punch: "Good. Now knights, then the yawn.",
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
};

export function hookAt(facts: LessonFacts): ShortHook | undefined {
  const rows = SHORT_HOOKS[facts.openingId];
  if (!rows?.length) return undefined;
  const exact = rows.find((r) => r.ply === facts.ply);
  if (exact) return exact;
  if (facts.ply < 0) return rows[0];
  return [...rows]
    .filter((r) => r.ply <= facts.ply && r.ply >= 0)
    .sort((a, b) => b.ply - a.ply)[0];
}
