# Opening Edge

iPhone-first PWA. **21 attacking systems** (11 White · 5 vs 1.e4 · 5 vs 1.d4). Each line is a **spine to move 21**, **traps**, and **six pillars** — then Plan mode. This pack adds a **professor Why** flow, positional quizzes, hybrid practice, fingertip Back/Forward, and Analyze with an eval bar.

Production: [https://blitzbar.app](https://blitzbar.app) (Vercel project `ply-chess`, GitHub `EmmanuelXK/ply-chess`).

## Repertoire

White: Scotch Gambit, Evans, Italian attacking, Vienna Gambit, King's Gambit, Grand Prix, Smith-Morra, French KIA, Caro-Kann Fantasy, London, Jobava London.

Black vs 1.e4: Black Lion, Pirc, Sicilian Dragon, Scandinavian, Alekhine.

Black vs 1.d4: King's Indian, Modern Benoni, Benko, Dutch Leningrad, Budapest.

Home filters: All 21 / White / vs 1.e4 / vs 1.d4. Reps chips: **Spine · Traps · Quiz · Think**.

## Professor pack

### Voice
Toggle **Voice** on the drill dock. The professor is a deep, unhurried English male when the device has one (Daniel / UK male / similar), with human pacing — clauses, tiny rate jitter, slower on SAN. Not a metronome, not a shout.

Every book move teaches:

1. **Concept** of the move/square  
2. **Why** it matters in this opening  
3. **Next** attacking / positional plan  

Soft-fail is rewritten. Lion coil is no longer `No. …Qc7 …h6 …Re8`. It's professor copy: one square, one job, then the sequence.

### Why splash
Tap **Why** on the coach strip (or dock). A fast splash opens with a mini board. The relevant **branch** auto-plays while the professor narrates. Colored arrows + Chess.com-style glyphs (`!!` `!` `!?` `?` `??`) land on key plies. **Back / Forward** and play/pause work inside the splash.

Lion and London have authored Why lessons (Nd4-style “the knight should control these squares”). Other systems get generated lessons from the spine + coach.

### Quizzes
Reps → **Quiz**, or the Quiz chip. Short **positional** questions tied to the current chunk (not trivia). The professor reacts out loud to right and wrong answers. Lion + London are fully authored; others fall back to chunk-job questions.

### Hybrid practice (Think)
From the current ply: play vs a **hybrid** of

| Engine | Role | What ships |
| --- | --- | --- |
| **Stockfish 16** (WASM, single-thread) | Tactical truth + eval bar | `public/engines/stockfish-nnue-16-single.{js,wasm}` (~600KB). GPLv3. |
| **Lc0-style** | Neural plans (activity, king pressure, storms) | In-browser heuristic. Full Lc0 WASM + net is too heavy for iPhone; drop a tiny net later. |
| **Maia-style** | Human-like development / mistakes | Policy prior (no early queen raids, don't hang). ONNX Maia is a later drop-in. |

When they disagree, the panel explains the **human-practical** choice. Mate or a hanging tactic → Stockfish wins the argument.

No env vars. Engines load lazily the first time you open Analyze or Think.

### Back / Forward
Large **Back** and **Forward** under the board (thumb zone). Instant ply-by-ply through the spine — hurry the repertoire. Same control set inside Why and Analyze. Chessground animations ~150ms (no teleports).

### Analyze
**Analyze** on the dock, or **long-press the board**. Fast splash: board, play/pause, Back/Forward, close. Vertical **eval bar** (Lichess/Chess.com style) beside the board — Stockfish primary. The human-plan strip shows Stockfish / Lc0-style / Maia-style votes.

## Run

```bash
npm install
npm run dev
```

App: [http://127.0.0.1:43173](http://127.0.0.1:43173)

```bash
npm run validate   # 21 spines legal, fingerprints, quizzes, professor scripts
npm run build
```

On an iPhone: open the URL, Share → Add to Home Screen.

## Add a system

1. Add a spine in `src/lib/openings/spines.ts` (40–44 plies).
2. Add a spec in `src/lib/openings/specs.ts` (`bookChunks`, traps, pillars, coach).
3. Add a fingerprint in `src/lib/openings/fingerprints.ts`.
4. Optional authored Why/quizzes in `src/lib/openings/authored.ts`.
5. `makeOpening` compiles chunks + professor. Home and `/drill/[id]` pick it up.

Inspired by Lotus / Chessreps *ideas* — no copied code, assets, or branding.

## Sync note

This repo is GitHub `EmmanuelXK/ply-chess` (what production `ply-chess` / blitzbar.app should track). If an Origin `grokmee/opening-edge` tree still exists, merge this branch there or point Vercel at this GitHub remote so the 21-system professor pack is what deploys.
