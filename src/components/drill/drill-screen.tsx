"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Chess } from "chess.js";
import type { Key } from "@lichess-org/chessground/types";
import {
  ChevronLeft,
  ChevronRight,
  FlipVertical2,
  Lightbulb,
  RotateCcw,
  StepForward,
  Volume2,
  VolumeX,
} from "lucide-react";

import { ChessBoard, type BoardArrow } from "@/components/board/chess-board";
import { Button } from "@/components/ui/button";
import { needsPromotion, sanToSquares, toDests } from "@/lib/chess/dests";
import { silence, speak } from "@/lib/chess/speak";
import {
  collectPin,
  dueCards,
  enrollLearn,
  formatDueLabel,
  gradeLabel,
  loadJournal,
  reviewTrain,
  type StudyMode,
} from "@/lib/journal";
import {
  coachAfterPly,
  coachAtStart,
  coachOnFail,
  coachOnHint,
  coachOnPlan,
  type CoachState,
} from "@/lib/openings/coach";
import { isUserPly, userPlyCount, type Opening, type PlanVoice } from "@/lib/openings";
import type { Square } from "chess.js";

const OPPONENT_MS = 320;
const FAIL_MS = 900;

export function DrillScreen({
  opening,
  initialMode,
  queueDue = false,
}: {
  opening: Opening;
  initialMode?: StudyMode;
  queueDue?: boolean;
}) {
  const studyMode: StudyMode = initialMode ?? "learn";
  const gameRef = useRef(new Chess());
  const plyRef = useRef(0);
  const modeRef = useRef<"drill" | "plan">("drill");
  const lockRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const studyModeRef = useRef<StudyMode>(studyMode);
  const continueLineRef = useRef<() => void>(() => {});
  const firstAttemptRef = useRef<Record<number, boolean>>({});
  const hintsUsedRef = useRef(0);
  const finishedRef = useRef(false);
  const [session, setSession] = useState(0);
  const [fen, setFen] = useState(() => new Chess().fen());
  const [ply, setPly] = useState(0);
  const [lastMove, setLastMove] = useState<Key[] | null>(null);
  const [orientation, setOrientation] = useState<"white" | "black">(
    opening.side,
  );
  const [mode, setMode] = useState<"drill" | "plan">("drill");
  const [coach, setCoach] = useState<CoachState>(() =>
    studyMode === "train" ? trainStartCoach(opening) : coachAtStart(opening),
  );
  const [hintKeys, setHintKeys] = useState<Key[] | null>(null);
  const [hintBrush, setHintBrush] = useState<"hint" | "book" | "correct">(
    "hint",
  );
  const [hintUsed, setHintUsed] = useState(false);
  const [voice, setVoice] = useState<PlanVoice>("steady");
  const [tts, setTts] = useState(false);
  const [busy, setBusy] = useState(false);
  const [check, setCheck] = useState(false);
  const [nextDueId, setNextDueId] = useState<string | null>(null);

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

  const finishBook = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    lockRef.current = false;
    setBusy(false);
    modeRef.current = "plan";

    if (studyModeRef.current === "learn") {
      enrollLearn(opening.id);
      setCoach({
        text: "Enrolled. Due tomorrow.",
        chunkName: "Plan mode",
        kind: "plan",
      });
    } else {
      const total = userPlyCount(opening);
      const correct = opening.moves.reduce((n, _, i) => {
        if (!isUserPly(opening.side, i)) return n;
        return n + (firstAttemptRef.current[i] === true ? 1 : 0);
      }, 0);
      const { card, grade } = reviewTrain(opening.id, {
        correct,
        total,
        hintsUsed: hintsUsedRef.current,
      });
      const due = formatDueLabel(new Date(card.fsrs.due), new Date());
      setCoach({
        text: `${correct}/${total} first try · ${gradeLabel(grade)} · ${due}`,
        chunkName: "Plan mode",
        kind: "plan",
      });
      if (queueDue) {
        const rest = dueCards(loadJournal()).filter(
          (c) => c.variationId !== opening.id,
        );
        setNextDueId(rest[0]?.variationId ?? null);
      }
    }
    sync();
  }, [opening, queueDue, sync]);

  const continueLine = useCallback(() => {
    const afterPly = plyRef.current - 1;
    const pin = opening.pins.find((p) => p.afterPly === afterPly);
    if (pin) {
      collectPin({
        openingId: opening.id,
        afterPly,
        label: pin.label,
      });
    }

    if (plyRef.current >= opening.moves.length) {
      finishBook();
      return;
    }

    setCoach(coachAfterPly(opening, afterPly));

    if (!isUserPly(opening.side, plyRef.current)) {
      lockRef.current = true;
      setBusy(true);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        const reply = playSan(opening.moves[plyRef.current]);
        if (reply) continueLineRef.current();
        else {
          lockRef.current = false;
          setBusy(false);
        }
      }, OPPONENT_MS);
      return;
    }

    lockRef.current = false;
    setBusy(false);
  }, [finishBook, opening, playSan]);

  useEffect(() => {
    continueLineRef.current = continueLine;
  }, [continueLine]);

  useEffect(() => {
    studyModeRef.current = studyMode;
    gameRef.current = new Chess();
    plyRef.current = 0;
    modeRef.current = "drill";
    lockRef.current = false;
    finishedRef.current = false;
    firstAttemptRef.current = {};
    hintsUsedRef.current = 0;
    setFen(gameRef.current.fen());
    setPly(0);
    setLastMove(null);
    setOrientation(opening.side);
    setMode("drill");
    setCoach(
      studyMode === "train" ? trainStartCoach(opening) : coachAtStart(opening),
    );
    setHintKeys(null);
    setHintUsed(false);
    setVoice("steady");
    setBusy(false);
    setCheck(false);
    setNextDueId(null);

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
          const afterPly = plyRef.current - 1;
          const pin = opening.pins.find((p) => p.afterPly === afterPly);
          if (pin) {
            collectPin({
              openingId: opening.id,
              afterPly,
              label: pin.label,
            });
          }
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
  }, [opening, playSan, session, studyMode]);

  useEffect(() => {
    if (!tts) {
      silence();
      return;
    }
    speak(coach.text);
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

  const bookSquares =
    studyMode === "learn" &&
    mode === "drill" &&
    !busy &&
    isUserPly(opening.side, ply)
      ? sanToSquares(fen, opening.moves[ply] ?? "")
      : null;

  const arrows = useMemo<BoardArrow[]>(() => {
    const next: BoardArrow[] = [];
    if (lastMove && lastMove.length === 2) {
      next.push({ orig: lastMove[0], dest: lastMove[1], brush: "last" });
    }
    if (hintKeys && hintKeys.length === 2) {
      next.push({ orig: hintKeys[0], dest: hintKeys[1], brush: hintBrush });
    } else if (bookSquares) {
      next.push({
        orig: bookSquares.from,
        dest: bookSquares.to,
        brush: "book",
      });
    }
    return next;
  }, [lastMove, hintKeys, hintBrush, bookSquares]);

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
        if (studyModeRef.current === "learn") {
          setHintKeys(null);
          sync();
          return;
        }
        if (firstAttemptRef.current[plyNow] === undefined) {
          firstAttemptRef.current[plyNow] = false;
        }
        if (expected) {
          setHintBrush("correct");
          setHintKeys([expected.from as Key, expected.to as Key]);
        }
        lockRef.current = true;
        setBusy(true);
        if (timerRef.current !== null) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          timerRef.current = null;
          setHintKeys(null);
          const played = playSan(bookSan);
          if (played) continueLine();
          else {
            lockRef.current = false;
            setBusy(false);
          }
        }, FAIL_MS);
        sync();
        return;
      }

      if (firstAttemptRef.current[plyNow] === undefined) {
        firstAttemptRef.current[plyNow] = true;
      }
      plyRef.current += 1;
      setLastMove([move.from as Key, move.to as Key]);
      setHintKeys(null);
      setHintUsed(false);
      sync();

      if (plyRef.current >= opening.moves.length) {
        finishBook();
        return;
      }

      continueLine();
    },
    [continueLine, finishBook, opening, playSan, sync],
  );

  const fullMoves = Math.ceil(opening.moves.length / 2);
  const shownMove = Math.min(Math.ceil(ply / 2), fullMoves);

  const hint = () => {
    if (mode !== "drill" || hintUsed || busy || studyMode !== "train") return;
    const san = opening.moves[ply];
    if (!san) return;
    const squares = sanToSquares(gameRef.current.fen(), san);
    if (!squares) return;
    if (firstAttemptRef.current[ply] === undefined) {
      firstAttemptRef.current[ply] = false;
    }
    hintsUsedRef.current += 1;
    setHintBrush("hint");
    setHintKeys([squares.from, squares.to]);
    setHintUsed(true);
    setCoach(coachOnHint(opening, ply));
  };

  const playNext = () => {
    if (studyMode !== "learn" || mode !== "drill" || busy || lockRef.current) {
      return;
    }
    const plyNow = plyRef.current;
    if (!isUserPly(opening.side, plyNow)) return;
    const san = opening.moves[plyNow];
    if (!san) return;
    const move = playSan(san);
    if (!move) return;
    continueLine();
  };

  const restart = () => {
    silence();
    finishedRef.current = false;
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
                : `${studyMode === "learn" ? "Learn" : "Train"} · ${coach.chunkName ?? opening.chunks[0]?.name}`}
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

      {mode === "plan" && nextDueId ? (
        <div className="plan-bar">
          <Button asChild variant="secondary" size="sm" className="w-full">
            <Link href={`/drill/${nextDueId}?mode=train&queue=due`}>
              Next due
              <ChevronRight />
            </Link>
          </Button>
        </div>
      ) : null}

      <footer className="drill-dock">
        {studyMode === "learn" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={playNext}
            disabled={mode !== "drill" || busy}
            className="dock-btn"
          >
            <StepForward />
            Next
          </Button>
        ) : (
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
        )}
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
          onClick={() => setTts((v) => !v)}
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

function trainStartCoach(opening: Opening): CoachState {
  return {
    text: "Play the book move.",
    chunkName: opening.chunks[0]?.name,
    kind: "start",
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
