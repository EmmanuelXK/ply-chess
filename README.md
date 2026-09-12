# Opening Edge

iPhone-first PWA dashboard (`100dvh`, no page scroll). **21 attacking systems** (11 White · 5 vs 1.e4 · 5 vs 1.d4). Each line is a **spine to move 21**, **traps**, and **six pillars** — then Plan mode. Dual coaches speak in **short beats**, wander as chat heads, and point at named squares.

Production: [https://blitzbar.app](https://blitzbar.app) (Vercel project `ply-chess`, GitHub `EmmanuelXK/ply-chess`).

## Repertoire

White: Scotch Gambit, Evans, Italian attacking, Vienna Gambit, King's Gambit, Grand Prix, Smith-Morra, French KIA, Caro-Kann Fantasy, London, Jobava London.

Black vs 1.e4: Black Lion, Pirc, Sicilian Dragon, Scandinavian, Alekhine.

Black vs 1.d4: King's Indian, Modern Benoni, Benko, Dutch Leningrad, Budapest.

Home filters: All 21 / White / vs 1.e4 / vs 1.d4. Reps chips: **Spine · Traps · Quiz · Think**.

## Dual masters

Headphone training is **two teachers**, not one coach with a sidekick. Beats are **8–15 words**, one positional idea, friendly (pride on good moves, concern + a fix on a miss). They argue about 1/5 of the time and still land one plan. Duo / Podcast↔Teach / Dual↔Solo / voices live on the **Settings** tab only. Masters on the drill deep-links there.

| Duo | Teachers | Feel |
| --- | --- | --- |
| **Voss & Draven** (default) | Aldric Voss ♂ · Kael Draven ♀ | Warm mentor vs punchy romantic tease. |
| **Vale & Knox** | Soren Vale ♂ · Rhea Knox ♀ | Ice-cold calculator vs narrative fire. |
| **Crowe & Marquez** | Silas Crowe ♂ · Lena Marquez ♀ | Quiet planner vs relentless investigator. |

All six names are **original characters**. No real or fictional IP names, likenesses, voice clones, or catchphrases.

Shared lesson facts (concept / why / plan / sourced history / quizzes) are flavored per duo. Lion and London have authored facts; other systems generate from the professor pack + History Gig Pack.

The coach strip shows **who is speaking**. Mid-line questions appear as tap chips.

### Voice
Toggle **Voice** on the drill dock. Mute, Restart, Back/Forward, and navigation cancel in-flight audio.

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
npm run validate   # 21 spines legal, fingerprints, quizzes, professor, sourced history, legal Why branches
npm run build
```

On an iPhone: open the URL, Share → Add to Home Screen.

## Add a system

1. Add a spine in `src/lib/openings/spines.ts` (40–44 plies).
2. Add a spec in `src/lib/openings/specs.ts` (`bookChunks`, traps, pillars, coach).
3. Add a fingerprint in `src/lib/openings/fingerprints.ts`.
4. Optional authored Why/quizzes in `src/lib/openings/authored.ts`.
5. Add at least one sourced `HISTORY_PACK` row in `src/lib/openings/history.ts`.
6. `makeOpening` compiles chunks + professor + history. Home and `/drill/[id]` pick it up.

Inspired by Lotus / Chessreps *ideas* — no copied code, assets, or branding.

## Sync note

This repo is GitHub `EmmanuelXK/ply-chess` (what production `ply-chess` / blitzbar.app should track). If an Origin `grokmee/opening-edge` tree still exists, merge this branch there or point Vercel at this GitHub remote so the 21-system professor pack is what deploys.
