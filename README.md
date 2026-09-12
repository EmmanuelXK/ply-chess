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
npm run build
```

On an iPhone: open the URL, Share → Add to Home Screen. The shell is standalone, with safe-area padding and a full-board drill view.

## Drill

- **Coach strip** — few words. Names the chunk. Pins event boundaries. Soft-fails with the chunk’s job, not a lecture.
- **Board** — Lichess Chessground. Touch-drag + tap-to-move. Thin black last-move arrow.
- **Hint** — next book move, once.
- **Plan mode** — after the book, free play. Coach shifts to a plan voice.
- **Voice / Mute** — professor TTS for coach lines (Why / History / quiz text uses the same `speak()` helper). Mute and rapid Back/Forward cancel in-flight audio.

## Voice (professor TTS)

Default is **free**. No API key, no paid account. The stack:

1. **Microsoft Edge neural TTS** via `/api/tts` (Node.js route, outbound WebSocket, in-memory MP3 — no Python, no native binaries).
2. **Web Speech API** in the browser if Edge TTS is down, offline, or the function times out.
3. **Optional ElevenLabs** when `ELEVENLABS_API_KEY` is set (quota/network errors fall back to Edge, then Web Speech).

Default free voice: **`en-GB-RyanNeural`** — British male neural, synthesized at `-12%` rate and `-6%` pitch so it sounds like a clear older professor, not a rush-hour announcer. Override with `EDGE_TTS_VOICE` (`en-US-GuyNeural` and `en-GB-ThomasNeural` are other deep male options).

Optional ElevenLabs stock voice: **George** (`JBFqnCBsd6RMkjVDRZzb`). Override with `ELEVENLABS_VOICE_ID`.

Repeated coach lines are cached by text hash in the browser session and in the warm serverless instance.

### Local

```bash
cp .env.example .env.local
# leave empty for free Edge TTS, or set ELEVENLABS_API_KEY
npm run dev
```

### Vercel (blitzbar.app)

No env vars required for production voice. To add ElevenLabs later:

1. Create a key at [elevenlabs.io](https://elevenlabs.io) → Developers → API keys.
2. Vercel project → Settings → Environment Variables.
3. Add `ELEVENLABS_API_KEY` (and optionally `ELEVENLABS_VOICE_ID`, `EDGE_TTS_VOICE`) for Production and Preview. Do **not** use a `NEXT_PUBLIC_` prefix.
4. Redeploy.

The build is green with zero TTS env vars. Keys must stay server-only.

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

Next.js App Router, TypeScript, Tailwind, shadcn/ui, `chess.js`, [`@lichess-org/chessground`](https://github.com/lichess-org/chessground) (Lichess board — better mobile drag than `react-chessboard`).
