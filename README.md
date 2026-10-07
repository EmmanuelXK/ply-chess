# Opening Edge

iPhone-first PWA dashboard (`100dvh`, no page scroll). **24 weapons** on one **Your Weapons** home in **four racks** (White Gambits, White Systems, Black Gambits, Black Systems). Square widget tiles; full details live in Learn. Each weapon is a short book line plus opponent branches. Under the board, the note is the written coach comment for that move. The board opens with no sign-in. Analyze runs Stockfish 17.1 on the device.

Production: [https://blitzbar.app](https://blitzbar.app) (Vercel project `ply-chess`, GitHub `EmmanuelXK/ply-chess`).

## Repertoire

Home is four racks on one page (not color pages). Rack membership lives in `src/lib/openings/racks.ts`; playable systems live in `src/lib/openings/specs.ts`. Tiles are square marks with the name in regular sans underneath; System / Semi stays a quiet caption. Phone vs iPad Air uses the auto size arranger.

**White · Gambits:** Scotch Gambit, Evans, Vienna Gambit, King's Gambit, Smith-Morra, Grand Prix (semi-sharp).

**White · Systems:** London, Jobava, Italian attacking, French KIA, Caro-Kann Fantasy, **Alapin**, **English**, **Queen's Gambit**.

**Black · vs 1.e4:** Black Lion, Pirc, Sicilian Dragon, Scandinavian, Alekhine, **Caro-Kann**.

**Black · vs 1.d4:** King's Indian, Modern Benoni, Benko, Dutch Leningrad, Budapest, **Slav**.

Home is Learn: one move at a time, then Analyze. Kind, vs-line, time, and traps live in Learn.

## Move note

Learn keeps a fixed strip under the board so the board does not jump. It shows the current move in SAN and, when the book has a coach note for that exact SAN, the note. Quiet plies stay SAN-only. There is no generated move description. At a fork, chips show the opponent's alternatives. When the line ends, the strip says book ends.

Branches live in those chips and in the drill menu.

### Engines
Learn shows the stored Stockfish 17.1 depth-22 book eval immediately. Live search is Stockfish only: about 2.5 seconds or depth 20, and the depth reached sits beside the bar. A bar with no score yet is a loading state.

| Engine | Role | What ships |
| --- | --- | --- |
| **Stockfish 17.1 lite** | Multithreaded WASM when the page is cross-origin isolated | `public/engines/stockfish-17.1-lite.js` plus `public/engines/stockfish.wasm` (~6.8 MB). The loader requests `stockfish.wasm`. GPL-3.0. |

Notices and the GPL text live in `public/engines/NOTICE.md`. Lc0 and Fairy-Stockfish are not included.

### Back / Forward
Large **Back** and **Forward** under the board (thumb zone). Instant ply-by-ply through the spine — hurry the repertoire. Same control set inside Analyze. Chessground animations ~90ms (no teleports).

### Analyze
**Analyze** on the dock, or **long-press the board**, from Learn. The sheet keeps the board, a vertical eval bar, the top lines, depth, node count, and Stop / Go. Back and Forward still walk the line.

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
npm run validate   # 24 weapons, legal lines, ECO names, stored evals, coach notes
npm run build
```

On an iPhone: open the URL in Safari, Share → Add to Home Screen. Settings repeats those steps. Android and Chrome can use Install app. The service worker is network-first for pages and does not intercept `/engines/`, so Stockfish keeps cross-origin isolation.

## Add a system

1. Add the weapon and its lines to `src/lib/openings/data/weapons-v2.json` (moves, evals, ECO, notes).
2. Add a matching ECO row to `src/lib/openings/data/eco-subset.json` when the line needs a new name.
3. Add a spec in `src/lib/openings/specs.ts` for the tile copy. Spec `id` must match the book.
4. Add that id to the right rack sequence in `src/lib/openings/racks.ts`.
5. Add a square mark id in `src/lib/openings/mark-ids.ts` and a glyph in `weapon-mark.tsx`.

Inspired by Lotus / Chessreps *ideas* — no copied code, assets, or branding.

## Sync note

This repo is GitHub `EmmanuelXK/ply-chess` (what production `ply-chess` / blitzbar.app should track). If an Origin `grokmee/opening-edge` tree still exists, merge this branch there or point Vercel at this GitHub remote so the 26-system professor pack is what deploys.
