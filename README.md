# Opening Trainer

iPhone-first Progressive Web App for drilling a tight 2500-track repertoire. v1 is three lines only. Each line is authored as **chunks**, **pins**, and **story beats** — not a naked PGN.

## Repertoire

| Line | You play | Depth |
| --- | --- | --- |
| **London System** | White | 30 moves vs …d5 / …e6 / …c5 / …Bd6 |
| **Pirc Defense** | Black vs 1.e4 | 30 moves, Classical (Be2 / 0-0) |
| **Black Lion** | Black | 30 moves vs the Bc4 / 0-0 / a4 shell |

Moves 1–16 are core book. After that each file is a **model middlegame** so you still have ~30 moves of survival, then Plan mode (steady / creative / aggressive). Sidelines are documented on each opening as `depthNote` and are later adds.

## Run

```bash
npm install
npm run dev
```

App: [http://127.0.0.1:43173](http://127.0.0.1:43173)

```bash
npm run validate   # every book move is legal from the start position
npm test           # FSRS grade map, enroll-due-tomorrow, local journal
npm run build
```

On an iPhone: open the URL, Share → Add to Home Screen. The shell is standalone, with safe-area padding and a full-board drill view.

## Drill

- **Learn** — guided first pass. The book move is shown (amber). Play it, or tap **Next**. Finishing enrolls the line. Due **tomorrow** on this device. Not graded as a perfect recall.
- **Train** — play your book moves from memory. Wrong: the correct move flashes, then the line continues. Grade is % of *your* plies correct on the first try (a hint counts as a miss for that ply).
- **Coach strip** — few words. Names the chunk. Pins event boundaries. Soft-fails with the chunk’s job, not a lecture.
- **Board** — Lichess Chessground. Touch-drag + tap-to-move. Thin black last-move arrow.
- **Plan mode** — after the book, free play. Coach shifts to a plan voice.

## Memory OS (private journal)

No login. Progress, FSRS state, and collected pins live in this browser (`localStorage` key `opening-edge.journal.v1`). Refresh-safe on the same device. Cloud sync is out of scope.

**Card unit:** one opening line (London, Pirc, or Black Lion) — not per-ply.

Home shows a **due count**. Failed / fragile lines sort first in the due queue. Empty due right after Learn is expected: spacing is the point.

| First-attempt correct | FSRS grade |
| --- | --- |
| 100% | Good (Easy if the line was already reviewed once and you used no hints) |
| ≥ 70% and &lt; 100% | Hard |
| &lt; 70% | Again |

Scheduler is [`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs) at **0.9** requested retention, max interval 180 days, short-term (minute) steps off so a failed line returns **tomorrow**, not in ten minutes.

## Add opening #4

1. Copy `src/lib/openings/london.ts` (or any of the three).
2. Keep this shape (`src/lib/openings/types.ts`):

```ts
export const caro: Opening = {
  id: "caro-kann",          // route: /drill/caro-kann
  name: "Caro-Kann",
  shortName: "Caro",
  side: "black",            // user color
  versus: "1.e4",
  blurb: "One line. The job.",
  story: { cast: "", conflict: "", plan: "" },
  moves: ["e4", "c6" /* SAN, from the start position */],
  chunks: [{ fromPly: 0, toPly: 5, name: "c6 wall", job: "…c6 then …d5" }],
  pins: [{ afterPly: 3, label: "at the d5 break…" }],
  storyBeats: [{ afterPly: 3, beat: "You take the center on your terms." }],
  coach: [{ afterPly: -1, text: "c6. Don't flinch." }],
  plans: {
    steady: "…",
    creative: "…",
    aggressive: "…",
  },
  depthNote: "What this line is not.",
};
```

3. Export it from `src/lib/openings/index.ts` and push it into the `openings` array. Home + `/drill/[id]` pick it up. No new page.
4. Rules the validator enforces on `npm run validate` / `npm run build`:

- Every SAN is legal from the start.
- Every ply sits in a named chunk (1–6 words).
- Pins, beats, and coach lines point at in-range plies.

Author chunks as 3–5 plies with one job. Put pins where the goal flips (castle, break, trade, plan change). Story beats only at those seams.

## Stack

Next.js App Router, TypeScript, Tailwind, shadcn/ui, `chess.js`, [`@lichess-org/chessground`](https://github.com/lichess-org/chessground) (Lichess board — better mobile drag than `react-chessboard`), [`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs) for the local Memory OS schedule.
