# Opening Edge

iPhone-first PWA dashboard (`100dvh`, no page scroll). **26 attacking systems** on one **Your Weapons** home in **four racks** (White Gambits, White Systems, Black vs 1.e4, Black vs 1.d4). Square widget tiles; full details live in Learn. Each line is a **spine to move 21**, **traps**, and **six pillars** — then Plan mode. Under the board, a fixed note shows the move in SAN and, when the book already has one, a single short comment. Login is **Google only**.

Production: [https://blitzbar.app](https://blitzbar.app) (Vercel project `ply-chess`, GitHub `EmmanuelXK/ply-chess`).

## Repertoire

Home is four racks on one page (not color pages). Rack membership lives in `src/lib/openings/racks.ts`; playable systems live in `src/lib/openings/specs.ts`. Tiles are square marks with the name in regular sans underneath; System / Semi stays a quiet caption. Phone vs iPad Air uses the auto size arranger.

**White · Gambits:** Scotch Gambit, Evans, Vienna Gambit, King's Gambit, Smith-Morra, Grand Prix (semi-sharp).

**White · Systems:** London, Jobava, Italian attacking, French KIA, Caro-Kann Fantasy, **Alapin**, **English**, **Queen's Gambit**.

**Black · vs 1.e4:** Black Lion, Pirc, Sicilian Dragon, Scandinavian, Alekhine, **Caro-Kann**.

**Black · vs 1.d4:** King's Indian, Modern Benoni, Benko, Dutch Leningrad, Budapest, **Slav**.

Home modes: **Learn · Reps · Practice · Drill · Time Trial · Progress**. Kind, vs-line, time, and traps live in Learn.

## Move note

Learn keeps a fixed strip under the board so the board does not jump. It shows the current move in SAN. If that ply already has a stored book comment, the strip adds the first sentence and nothing else. Quiet plies stay SAN-only. There is no Ask Coach, Why, or Explain control, and no generated prose.

Spine, houses, and trap branches live in the drill **sandwich menu** (a tree), not as noisy labels above the board.

Gem, True, and Clean marks still land on signature theory moves. History opens from the note when a milestone is on the ply.

### Quizzes
Reps → **Quiz**, or the Quiz chip. Short **positional** questions tied to the current chunk (not trivia). Lion + London are fully authored; others fall back to chunk-job questions.

### Engines
Analyze (dock or long-press) runs one browser engine at a time. The last choice is stored on the device.

| Engine | Role | What ships |
| --- | --- | --- |
| **Stockfish lite** (default) | Single-thread search, eval bar, three lines | `public/engines/stockfish-19-lite-single.{js,wasm}` (~1.8 MB). GPL-3.0. |
| **Fairy-Stockfish** | Smaller NNUE build, one thread | `public/engines/fairy/` (~1.6 MB). GPL-3.0. Needs cross-origin isolation. |
| **Lc0** | Neural net + Monte Carlo, opt-in | `public/engines/lc0/` engine plus a 22 MB network fetched only after Lc0 is chosen. GPL-3.0. |

Notices and the GPL text live in `public/engines/NOTICE.md`.

### Back / Forward
Large **Back** and **Forward** under the board (thumb zone). Instant ply-by-ply through the spine — hurry the repertoire. Same control set inside Analyze. Chessground animations ~90ms (no teleports).

### Analyze
**Analyze** on the dock, or **long-press the board**, from Learn, Quiz, or Review. The sheet keeps the board, a vertical eval bar, the top lines, depth, node count, and Stop / Go. Back and Forward still walk the line.

### History Gig Pack
When the current ply has a real chess-history milestone, a small **paper mark** appears on the move note. Tap it: fast splash, year, people, why it matters *here*, Wikipedia (and Chess.com when cited). Never blocks training.

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
npm run validate   # 26 spines legal, fingerprints, quizzes, sourced history
npm run build
```

On an iPhone: open the URL, Share → Add to Home Screen.

## Add a system

1. Add a spine in `src/lib/openings/spines.ts` (40–44 plies).
2. Add a spec in `src/lib/openings/specs.ts` (`bookChunks`, traps, pillars, coach). Spec `id` is the playable-system source of truth.
3. Add that id to the right rack sequence in `src/lib/openings/racks.ts`. Home tiles come from racks, not from a second category list.
4. Add a fingerprint in `src/lib/openings/fingerprints.ts`.
5. Optional authored quizzes in `src/lib/openings/authored.ts`.
6. Add at least one sourced `HISTORY_PACK` row in `src/lib/openings/history.ts`.
7. Add a square mark id in `src/lib/openings/mark-ids.ts`. `makeOpening` compiles chunks + professor + history. Home and `/drill/[id]` pick it up.

Inspired by Lotus / Chessreps *ideas* — no copied code, assets, or branding.

## Sync note

This repo is GitHub `EmmanuelXK/ply-chess` (what production `ply-chess` / blitzbar.app should track). If an Origin `grokmee/opening-edge` tree still exists, merge this branch there or point Vercel at this GitHub remote so the 26-system professor pack is what deploys.
