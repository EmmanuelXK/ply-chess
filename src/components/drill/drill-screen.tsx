"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Chess } from "chess.js";
import type { Key } from "@lichess-org/chessground/types";
import {
  ChevronLeft,
  FlipVertical2,
  Lightbulb,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";

import { ChessBoard, type BoardArrow } from "@/components/board/chess-board";
import { Button } from "@/components/ui/button";
import { needsPromotion, toDests } from "@/lib/chess/dests";
import { silence, speak, unlockSpeech } from "@/lib/chess/speak";
import {
  coachAfterPly,
  coachAtStart,
  coachOnFail,
  coachOnHint,
  coachOnPlan,
  type CoachState,
} from "@/lib/openings/coach";
import { isUserPly, type Opening, type PlanVoice } from "@/lib/openings";
import type { Square } from "chess.js";

const OPPONENT_MS = 320;

export function DrillScreen({ opening }: { opening: Opening }) {
  const gameRef = useRef(new Chess());
  const plyRef = useRef(0);
  const modeRef = useRef<"drill" | "plan">("drill");
  const lockRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const [session, setSession] = useState(0);
  const [fen, setFen] = useState(() => new Chess().fen());
  const [ply, setPly] = useState(0);
  const [lastMove, setLastMove] = useState<Key[] | null>(null);
  const [orientation, setOrientation] = useState<"white" | "black">(
    opening.side,
  );
  const [mode, setMode] = useState<"drill" | "plan">("drill");
  const [coach, setCoach] = useState<CoachState>(() => coachAtStart(opening));
  const [hintKeys, setHintKeys] = useState<Key[] | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [voice, setVoice] = useState<PlanVoice>("steady");
  const [tts, setTts] = useState(false);
  const [busy, setBusy] = useState(false);
  const [check, setCheck] = useState(false);

  const sync = useCallback(() => {
    const g = gameRef.current;
    setFen(g.fen());
    setPly(plyRef.current);
    setCheck(g.inCheck());
    setMode(modeRef.current);
  }, []);

  const playSan = useCallback(
    (san: string) => {
      const move = gameRef.current.move(san);
      if (!move) return null;
      plyRef.current += 1;
      setLastMove([move.from as Key, move.to as Key]);
      if (plyRef.current >= opening.moves.length) {
        modeRef.current = "plan";
      }
      sync();
      return move;
    },
    [opening.moves.length, sync],
  );

  useEffect(() => {
    gameRef.current = new Chess();
    plyRef.current = 0;
    modeRef.current = "drill";
    lockRef.current = false;
    setFen(gameRef.current.fen());
    setPly(0);
    setLastMove(null);
    setOrientation(opening.side);
    setMode("drill");
    setCoach(coachAtStart(opening));
    setHintKeys(null);
    setHintUsed(false);
    setVoice("steady");
    setBusy(false);
    setCheck(false);

    let cancelled = false;

    const kick = async () => {
      while (
        !cancelled &&
        modeRef.current === "drill" &&
        plyRef.current < opening.moves.length &&
        !isUserPly(opening.side, plyRef.current)
      ) {
        setBusy(true);
        lockRef.current = true;
        await sleep(plyRef.current === 0 ? 400 : OPPONENT_MS);
        if (cancelled) return;
        const move = playSan(opening.moves[plyRef.current]);
        if (move) {
          setCoach(coachAfterPly(opening, plyRef.current - 1));
        }
      }
      lockRef.current = false;
      setBusy(false);
    };

    void kick();
    return () => {
      cancelled = true;
      lockRef.current = false;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [opening, playSan, session]);

  useEffect(() => {
    if (!tts) {
      silence();
      return;
    }
    speak(coach.text);
    return () => {
      silence();
    };
  }, [coach, tts]);

  const dests = useMemo(() => {
    const g = new Chess(fen);
    if (mode === "drill" && busy) return new Map<Key, Key[]>();
    return toDests(g);
  }, [fen, mode, busy]);

  const turnColor = fen.includes(" w ") ? "white" : "black";
  const movableColor =
    mode === "plan"
      ? "both"
      : busy
        ? undefined
        : opening.side;

  const arrows = useMemo<BoardArrow[]>(() => {
    const next: BoardArrow[] = [];
    if (lastMove && lastMove.length === 2) {
      next.push({ orig: lastMove[0], dest: lastMove[1], brush: "last" });
    }
    if (hintKeys && hintKeys.length === 2) {
      next.push({ orig: hintKeys[0], dest: hintKeys[1], brush: "hint" });
    }
    return next;
  }, [lastMove, hintKeys]);

  const onMove = useCallback(
    (from: Key, to: Key) => {
      if (lockRef.current && modeRef.current === "drill") {
        sync();
        return;
      }
      const g = gameRef.current;
      const promotion = needsPromotion(g, from as Square, to as Square)
        ? "q"
        : undefined;

      if (modeRef.current === "plan") {
        const move = g.move({ from, to, promotion });
        if (!move) {
          sync();
          return;
        }
        setLastMove([move.from as Key, move.to as Key]);
        setHintKeys(null);
        sync();
        return;
      }

      const plyNow = plyRef.current;
      const bookSan = opening.moves[plyNow];
      if (!bookSan || !isUserPly(opening.side, plyNow)) {
        sync();
        return;
      }

      const probe = new Chess(g.fen());
      let expected;
      try {
        expected = probe.move(bookSan);
      } catch {
        expected = null;
      }

      const move = g.move({ from, to, promotion });
      if (!move) {
        sync();
        return;
      }

      const ok =
        expected &&
        expected.from === move.from &&
        expected.to === move.to &&
        (expected.promotion ?? undefined) === (move.promotion ?? undefined);

      if (!ok) {
        g.undo();
        setCoach(coachOnFail(opening, plyNow));
        setHintKeys(null);
        sync();
        return;
      }

      plyRef.current += 1;
      setLastMove([move.from as Key, move.to as Key]);
      setHintKeys(null);
      setHintUsed(false);

      if (plyRef.current >= opening.moves.length) {
        modeRef.current = "plan";
        setCoach({
          text: "Book done. Pick a plan.",
          chunkName: "Plan mode",
          kind: "plan",
        });
        sync();
        return;
      }

      setCoach(coachAfterPly(opening, plyRef.current - 1));
      sync();

      if (!isUserPly(opening.side, plyRef.current)) {
        lockRef.current = true;
        setBusy(true);
        if (timerRef.current !== null) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          timerRef.current = null;
          const reply = playSan(opening.moves[plyRef.current]);
          if (reply) {
            if (modeRef.current === "plan") {
              setCoach({
                text: "Book done. Pick a plan.",
                chunkName: "Plan mode",
                kind: "plan",
              });
            } else {
              setCoach(coachAfterPly(opening, plyRef.current - 1));
            }
          }
          lockRef.current = false;
          setBusy(false);
        }, OPPONENT_MS);
      }
    },
    [opening, playSan, sync],
  );

  const fullMoves = Math.ceil(opening.moves.length / 2);
  const shownMove = Math.min(Math.ceil(ply / 2), fullMoves);

  const hint = () => {
    if (mode !== "drill" || hintUsed || busy) return;
    const san = opening.moves[ply];
    if (!san) return;
    const probe = new Chess(gameRef.current.fen());
    try {
      const move = probe.move(san);
      if (!move) return;
      setHintKeys([move.from as Key, move.to as Key]);
      setHintUsed(true);
      setCoach(coachOnHint(opening, ply));
    } catch {
      /* ignore */
    }
  };

  const restart = () => {
    silence();
    setSession((n) => n + 1);
  };

  const pickVoice = (next: PlanVoice) => {
    setVoice(next);
    setCoach(coachOnPlan(next, opening));
  };

  return (
    <div className="drill-shell">
      <header className="drill-top">
        <div className="drill-nav">
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            className="text-zinc-300 hover:text-white"
          >
            <Link href="/" aria-label="Back to repertoire">
              <ChevronLeft />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <h1 className="truncate text-[15px] font-semibold tracking-tight">
                {opening.shortName}
              </h1>
              <p className="shrink-0 font-mono text-[11px] tabular-nums text-zinc-500">
                {shownMove}/{fullMoves}
              </p>
            </div>
            <p className="truncate text-[11px] text-zinc-500">
              {mode === "plan"
                ? "Plan mode — free play"
                : (coach.chunkName ?? opening.chunks[0]?.name)}
            </p>
          </div>
        </div>

        <div
          className={`coach-strip coach-${coach.kind}`}
          role="status"
          aria-live="polite"
        >
          {coach.kind === "pin" ? (
            <span className="pin-dot" aria-hidden />
          ) : null}
          <p>{coach.text}</p>
        </div>
      </header>

      <div className="board-stage">
        <ChessBoard
          fen={fen}
          dests={dests}
          lastMove={lastMove}
          arrows={arrows}
          orientation={orientation}
          turnColor={turnColor}
          viewOnly={busy && mode === "drill"}
          movableColor={movableColor}
          check={check}
          onMove={onMove}
        />
      </div>

      {mode === "plan" ? (
        <div className="plan-bar">
          {(["steady", "creative", "aggressive"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => pickVoice(v)}
              className={voice === v ? "plan-chip plan-chip-on" : "plan-chip"}
            >
              {v}
            </button>
          ))}
        </div>
      ) : null}

      <footer className="drill-dock">
        <Button
          variant="ghost"
          size="sm"
          onClick={hint}
          disabled={mode !== "drill" || hintUsed || busy}
          className="dock-btn"
        >
          <Lightbulb />
          Hint
        </Button>
        <Button variant="ghost" size="sm" onClick={restart} className="dock-btn">
          <RotateCcw />
          Restart
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setOrientation((o) => (o === "white" ? "black" : "white"))
          }
          className="dock-btn"
        >
          <FlipVertical2 />
          Flip
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setTts((on) => {
              const next = !on;
              if (next) unlockSpeech();
              else silence();
              return next;
            })
          }
          className="dock-btn"
          aria-pressed={tts}
        >
          {tts ? <Volume2 /> : <VolumeX />}
          {tts ? "Voice" : "Mute"}
        </Button>
      </footer>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
