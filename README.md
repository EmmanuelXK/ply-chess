# Opening Edge

iPhone-first PWA dashboard (`100dvh`, no page scroll). **26 attacking systems** on one **Your Weapons** home in **four racks** (White Gambits, White Systems, Black vs 1.e4, Black vs 1.d4). Square widget tiles; full details live in Learn. Each line is a **spine to move 21**, **traps**, and **six pillars** — then Plan mode. The board is silent. Tap **Ask Coach** or **Why** / **Explain** to read the idea and the reason. The strip stays concept-first; Why may name the move on the board. No floating chat head. Login is **Google only**.

Production: [https://blitzbar.app](https://blitzbar.app) (Vercel project `ply-chess`, GitHub `EmmanuelXK/ply-chess`).

## Repertoire

Home is four racks on one page (not color pages). Rack membership lives in `src/lib/openings/racks.ts`; playable systems live in `src/lib/openings/specs.ts`. Tiles are square marks with the name in regular sans underneath; System / Semi stays a quiet caption. Phone vs iPad Air uses the auto size arranger.

**White · Gambits:** Scotch Gambit, Evans, Vienna Gambit, King's Gambit, Smith-Morra, Grand Prix (semi-sharp).

**White · Systems:** London, Jobava, Italian attacking, French KIA, Caro-Kann Fantasy, **Alapin**, **English**, **Queen's Gambit**.

**Black · vs 1.e4:** Black Lion, Pirc, Sicilian Dragon, Scandinavian, Alekhine, **Caro-Kann**.

**Black · vs 1.d4:** King's Indian, Modern Benoni, Benko, Dutch Leningrad, Budapest, **Slav**.

Home modes: **Learn · Reps · Practice · Drill · Time Trial · Progress**. Kind, vs-line, time, and traps live in Learn.

## Single coach

The strip shows the key point (they/we pictures, 6–15 words, no SAN dumps) plus the **reason** (chunk job, conflict, or plan). Routine developing moves stay quiet until you tap **Ask Coach**. **Why** and dock **Explain** open the move board (SAN allowed). History opens from the strip mark when a milestone is on the ply. There is no floating or draggable head.

Spine, houses, and trap branches live in the drill **sandwich menu** (a tree), not as noisy labels above the board.

Coach Brain v2 is flagged (`COACH_BRAIN_V2`, off by default). Settings has **no coach picker, no duos, no Dual/Solo switch**.

Lion and London have authored facts; other systems generate from the professor pack + History Gig Pack.

### Voice
The app is **silent**. There is no Speak-on-ply, mute toggle, speaker chip, or Settings voice/music panel. Ask Coach, Why, and Explain are **text**. TTS helpers remain in the repo as dead code and do not play.

Focus / ambient music is not in this cut.

### Why splash
Tap **Why** on the coach strip or **Explain** on the dock — available on every ply, including quiet developing moves. A splash opens with a mini board. **Idea** and **Reason** sit above the board in plain language (plan, conflict, chunk job). The relevant **branch** auto-plays. Colored arrows + Chess.com-style glyphs (`!!` `!` `!?` `?` `??`) land on those Why plies. **Back / Forward** and play/pause work inside the splash. The ply list may name SAN; the sentences do not dump move lists.

Lion and London have authored Why lessons (Nd4-style “the knight should control these squares”). Other systems get generated lessons from the spine + coach. Copy is concept-first: idea, then reason.

### Quizzes
Reps → **Quiz**, or the Quiz chip. Short **positional** questions tied to the current chunk (not trivia). Lion + London are fully authored; others fall back to chunk-job questions.

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
Large **Back** and **Forward** under the board (thumb zone). Instant ply-by-ply through the spine — hurry the repertoire. Same control set inside Why and Analyze. Chessground animations ~90ms (no teleports).

### Analyze
**Analyze** on the dock, or **long-press the board**. Fast splash: board, play/pause, Back/Forward, close. Vertical **eval bar** (Lichess/Chess.com style) beside the board — Stockfish primary. The human-plan strip shows Stockfish / Lc0-style / Maia-style votes.

### History Gig Pack
When the current ply has a real chess-history milestone, a small **paper mark** appears on the coach strip and the board corner. Tap it: fast splash, year, people, why it matters *here*, Wikipedia (and Chess.com when cited). Never blocks training.

Data: `src/lib/openings/history.ts`. Typed `HistoryMilestone` (`plyOrFen`, `era`, `glyph`, `sources`, optional `famousGame`). Validation requires **≥1 sourced milestone per system** and **https** URLs. No folklore — if Wikipedia does not support a game/year, it is not in the pack. Romantic gambits (King’s Gambit, Evans) carry extra marks (Immortal, Evergreen, Kasparov revival). The Black Lion cites Dutch club pages (Jansen–den Ouden, 14 Jan 1967) plus Chess.com book notes, because it has no Wikipedia article.

**Add a milestone**

1. Confirm the fact on Wikipedia (preferred) or another primary page.
2. Append an object in `HISTORY_PACK` with `openingId`, `plyOrFen` (ply count after the key move, or a FEN), `title`, `year`, `era`, `summary` (2–4 sentences), `whyItMattersHere`, `sources: [{ label, url }]`, `glyph`.
3. Optional `famousGame` and `trapId` (trap-only marks).
4. `npm run validate` — fake URLs and empty sources fail the build.

## Run

```bash
npm install
npm run dev
```

App: [http://127.0.0.1:43173](http://127.0.0.1:43173)

```bash
npm run validate   # 26 spines legal, fingerprints, quizzes, professor, sourced history, legal Why branches
npm run build
```

On an iPhone: open the URL, Share → Add to Home Screen.

## Add a system

1. Add a spine in `src/lib/openings/spines.ts` (40–44 plies).
2. Add a spec in `src/lib/openings/specs.ts` (`bookChunks`, traps, pillars, coach). Spec `id` is the playable-system source of truth.
3. Add that id to the right rack sequence in `src/lib/openings/racks.ts`. Home tiles come from racks, not from a second category list.
4. Add a fingerprint in `src/lib/openings/fingerprints.ts`.
5. Optional authored Why/quizzes in `src/lib/openings/authored.ts`.
6. Add at least one sourced `HISTORY_PACK` row in `src/lib/openings/history.ts`.
7. Add a square mark id in `src/lib/openings/mark-ids.ts`. `makeOpening` compiles chunks + professor + history. Home and `/drill/[id]` pick it up.

Inspired by Lotus / Chessreps *ideas* — no copied code, assets, or branding.

## Sync note

This repo is GitHub `EmmanuelXK/ply-chess` (what production `ply-chess` / blitzbar.app should track). If an Origin `grokmee/opening-edge` tree still exists, merge this branch there or point Vercel at this GitHub remote so the 26-system professor pack is what deploys.
