# Opening Edge

iPhone-first PWA dashboard (`100dvh`, no page scroll). **26 attacking systems** on one **Your Weapons** home in **four racks** (White Gambits, White Systems, Black vs 1.e4, Black vs 1.d4). Square widget tiles; full details live in Learn. Each line is a **spine to move 21**, **traps**, and **six pillars** — then Plan mode. Aldric speaks when you tap **Ask Coach** — not on every key move. The strip stays concept-first; Why may name the move. Ask Coach may show a small anchored coach mark on the board — not a draggable dual-coach chat head. Login is **Google only**.

Production: [https://blitzbar.app](https://blitzbar.app) (Vercel project `ply-chess`, GitHub `EmmanuelXK/ply-chess`).

## Repertoire

Home is four racks on one page (not color pages). Rack membership lives in `src/lib/openings/racks.ts`; playable systems live in `src/lib/openings/specs.ts`. Tiles are square marks with the name in regular sans underneath; System / Semi stays a quiet caption. Phone vs iPad Air uses the auto size arranger.

**White · Gambits:** Scotch Gambit, Evans, Vienna Gambit, King's Gambit, Smith-Morra, Grand Prix (semi-sharp).

**White · Systems:** London, Jobava, Italian attacking, French KIA, Caro-Kann Fantasy, **Alapin**, **English**, **Queen's Gambit**.

**Black · vs 1.e4:** Black Lion, Pirc, Sicilian Dragon, Scandinavian, Alekhine, **Caro-Kann**.

**Black · vs 1.d4:** King's Indian, Modern Benoni, Benko, Dutch Leningrad, Budapest, **Slav**.

Home modes: **Learn · Reps · Practice · Drill · Time Trial · Progress**. Kind, vs-line, time, and traps live in Learn.

## Single coach

The strip shows the key point (they/we pictures, 6–15 words, no SAN dumps). Routine developing moves stay silent. Tap **Ask Coach** to hear Aldric — the board is quiet until then. **Why** opens the move board (SAN allowed). History opens from the strip mark when a milestone is on the ply. Ask Coach places a small original EDGE gentleman mark on the board with a speak-wave while TTS is live; it idles or hides when the session ends. It is not a floating or draggable dual-coach head.

Each system plays a distinct lyric-free **focus bed** (Web Audio, no fat MP3s) so the memory palace has a sound. Music ducks under Ask Coach / TTS and mutes separately from Voice.

Spine, houses, and trap branches live in the drill **sandwich menu** (a tree), not as noisy labels above the board.

Coach Brain v2 is flagged (`COACH_BRAIN_V2`, off by default). Settings has **no coach picker, no duos, no Dual/Solo switch**.

Lion and London have authored facts; other systems generate from the professor pack + History Gig Pack.

### Voice
Voice is **on by default** for new players (and when the preference is unset), but it does **not** auto-speak moves. Toggle **Voice** on the drill dock to mute Ask Coach. Toggle **Music** to mute the system bed. Ask Coach, Restart, Back/Forward, and navigation cancel in-flight coach audio.

**Priority when speaking**

1. **ElevenLabs** — only if `ELEVENLABS_API_KEY` is set *and* Dual masters requested character voices.
2. **Google Cloud TTS** — when `GOOGLE_CLOUD_TTS` / `GOOGLE_CLOUD_TTS_API_KEY` / `GOOGLE_APPLICATION_CREDENTIALS` is configured. Defaults are **WaveNet** (typically **4M free characters/month**). Neural2 is typically **1M/month**. Confirm current quotas on [Google Cloud TTS pricing](https://cloud.google.com/text-to-speech/pricing). Billing must be enabled for the API; the monthly free allowance still applies.
3. **Edge TTS** — free neural path via `/api/tts` (Node.js, outbound WebSocket, in-memory MP3). **Needs network. It is not true offline.**
4. **Web Speech API** — true offline / local browser fallback.

The production build is green with **zero cloud keys**.

**Default free voices (Edge)**

| Speaker | Edge | Google WaveNet | ElevenLabs stock |
| --- | --- | --- | --- |
| Aldric ♂ | `en-GB-RyanNeural` | `en-GB-Wavenet-B` | George `JBFqnCBsd6RMkjVDRZzb` |
| Kael ♀ | `en-US-AvaNeural` | `en-US-Wavenet-F` | Charlotte `XB0fDUnXU5powFXDhCwa` |
| Soren ♂ | `en-GB-ThomasNeural` | `en-GB-Wavenet-D` | Daniel `onwK4e9ZLuTAKqWW03F9` |
| Rhea ♀ | `en-US-JennyNeural` | `en-US-Wavenet-E` | Bella `EXAVITQu4vr4xnSDxMaL` |
| Silas ♂ | `en-US-AndrewNeural` | `en-US-Wavenet-D` | Josh `TxGEqnHWrfWFTfGW9XjX` |
| Lena ♀ | `en-US-EmmaNeural` | `en-US-Wavenet-C` | Rachel `21m00Tcm4TlvDq8ikWAM` |

Override with `TTS_VOICE_<SPEAKER>` or provider-specific `EDGE_TTS_VOICE_<SPEAKER>`, `GOOGLE_TTS_VOICE_<SPEAKER>`, `ELEVENLABS_VOICE_<SPEAKER>`. See `.env.example`.

### GCP setup (optional)

```bash
# enable Cloud Text-to-Speech, create an API key, then:
cp .env.example .env.local
# GOOGLE_CLOUD_TTS_API_KEY=...
npm run dev
```

Vercel: Project → Settings → Environment Variables. Server-only — never `NEXT_PUBLIC_`.

### Why this still deploys without keys
`/api/tts` uses the `ws` package only (no Python, no native binaries). Short clips finish under the function limit (`maxDuration` 15s). If Edge is down or you are offline, the client falls back to Web Speech.

The default path does **not** teach every book move. Key points fire on highlighted plies. Soft-fail is still professor copy: one square, one job.

### Why splash
Tap **Why** on the coach strip or **Explain** on the dock — available on every ply, including quiet developing moves. A splash opens with a mini board. The relevant **branch** auto-plays while the coach narrates. Colored arrows + Chess.com-style glyphs (`!!` `!` `!?` `?` `??`) land on those Why plies. **Back / Forward** and play/pause work inside the splash.

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
Large **Back** and **Forward** under the board (thumb zone). Instant ply-by-ply through the spine — hurry the repertoire. Same control set inside Why and Analyze. Chessground animations ~90ms (no teleports).

### Analyze
**Analyze** on the dock, or **long-press the board**. Fast splash: board, play/pause, Back/Forward, close. Vertical **eval bar** (Lichess/Chess.com style) beside the board — Stockfish primary. The human-plan strip shows Stockfish / Lc0-style / Maia-style votes.

### History Gig Pack
When the current ply has a real chess-history milestone, a small **paper mark** appears on the coach strip and the board corner. Tap it: fast splash, professor voice (“This is where history kissed the board…”), year, people, why it matters *here*, Wikipedia (and Chess.com when cited). Never blocks training.

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
