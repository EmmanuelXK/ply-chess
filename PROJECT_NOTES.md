# EDGES project notes

Handoff for the next developer or AI agent. The owner's chat history will be deleted. Read this file before changing anything. The locked rules below stay in force until the owner says otherwise.

## 1. What EDGES is

"A chess notebook by K." A personal, phone-first, no-login opening trainer PWA.

Live at [blitzbar.app](https://blitzbar.app). Vercel team `blitzbar`, project `ply-chess`. GitHub `EmmanuelXK/ply-chess`.

The owner's goal is a rating climb from 1250 to 2000.

## 2. Locked rules

Do not change any of these without the owner's explicit OK.

- No login or accounts. Progress lives in localStorage.
- No Quiz, Review, or streaks.
- Darker modern shell.
- Symbol-only icons.
- Keep the weapon icons and the fedora PWA icon.
- No Chess.com or Chessable branding.
- Stockfish 17 is the only engine.
- The AI coach is Claude Sonnet 5.5, capped at 10 questions a day. No premium tier.
- Use credits sparingly.
- Only build when the owner says "build".
- Merge only after the owner approves.
- Four Home groups: White Gambits, White Systems, Black Gambits, Black Systems.
- Lines must be sound and checked against Lichess.

## 3. Architecture

What the app does today:

- **Learn.** One book move at a time, with the written note, Back, Forward, and Restart.
- **Practice.** Same line and ply as Learn. Opponent replies are weighted from the Lichess explorer, with a "played by X%" hint. A wrong move shows the miss card. At the end of the book, a plan card draws arrows for the middlegame idea.
- **Analyze.** Full-screen board. Stockfish 17.1 searches on the device (three lines). Variations, eval bar, and eval graph.
- **Move badges.** One symbol on the moved piece, graded from the stored eval.
- **Coach bubble.** Drag, open, and close. Ten questions a day. Out of credit shows a plain message and does not spend a question.
- **PWA.** Manifest, fedora icon, service worker. A new deploy reloads an open tab. Offline shows a short "EDGES is offline" page. The repertoire itself is not available offline.

Key places:

- `src/app/page.tsx` Home. `src/app/drill/[id]` Learn and Practice. `src/app/analyze` Analyze. `src/app/settings` profile. `src/app/api/coach` and `src/app/api/explorer` server routes. `src/app/manifest.ts` and `public/sw.js` for the PWA.
- `src/components/home` tiles. `src/components/drill` the board session. `src/components/analyze` the analysis screen and eval graph. `src/components/coach` the bubble. `src/components/board` the shared shell, eval bar, and chessboard.
- `src/lib/openings` book, racks, specs, and plans (`data/weapons-v2.json`, `data/line-plans.json`). `src/lib/explorer` Lichess weights. `src/lib/coach` prompt, quota, and errors. `src/lib/engines` Stockfish. `src/lib/chess` move badges. `src/lib/reps/schedule.ts` Learn progress in localStorage. `src/lib/owner.ts` the profile in localStorage.

Scripts in `package.json`: `dev` (port 43173), `build`, `start`, `lint`, `typecheck`, `test`, `validate`. `prebuild` runs `validate`. Tests live next to the code: `src/lib/openings`, `chess`, `reps`, `engines`, `pwa`, `coach`, and `explorer`.

## 4. Env vars

Names only. Never commit real values.

- `ANTHROPIC_API_KEY` — coach. The server also accepts `AI_GATEWAY_API_KEY` and uses that first when it is set.
- `LICHESS_TOKEN` — Practice weights. Without it, Practice picks evenly among stored branches.

`NEXT_PUBLIC_SUPABASE_*` is unused. The app does not read it. Remove those vars from Vercel if they are still set.

## 5. History

- **#43** Personal Learn and Analyze, with no login and no due review.
- **#44** Repertoire accuracy, Learn evals, and the fedora icon.
- **#45** Fedora icon fills the iOS tile.
- **#46** Book lines, coach notes, and stored Stockfish evals made correct.
- **#47** Full-screen Analyze board with variations.
- **#48** Learn shares the Analyze board layout.
- **#49** Practice, move-quality badges, and a capped coach bubble.
- **#50** Lichess-weighted Practice replies, middlegame plan cards, and coach polish.
- **#51** Supabase removed. Progress and profile stay on the device.
- **#52** V1 release QA: phone layout, coach, practice, and updates. **V1 = #52.**

## 6. Known gaps and backlog

- Anthropic credit still needs adding before the coach works.
- 47 stored scores are 0.00. The bar shows them as equal because that is the stored number. The book was not regenerated.
- Mistake drill.
- Mastery dots.
- PGN import.
- The remaining ~58 matchups.
- Offline mode. The PWA only shows an offline page. It does not train without a network.
