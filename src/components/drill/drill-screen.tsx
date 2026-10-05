"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Chess, type Square } from "chess.js";
import type { Key } from "@lichess-org/chessground/types";
import {
  ChevronLeft,
  FlipVertical2,
  Lightbulb,
  Menu,
  RotateCcw,
  ScanSearch,
} from "lucide-react";

import { ChessBoard, type BoardArrow, type BoardMark } from "@/components/board/chess-board";
import { Button } from "@/components/ui/button";
import { AnalyzeSplash } from "@/components/drill/analyze-splash";
import { HistoryMark } from "@/components/drill/history-mark";
import { LineTreeMenu } from "@/components/drill/line-tree-menu";
import { HistorySplash } from "@/components/drill/history-splash";
import { PlyNav } from "@/components/drill/ply-nav";
import { StudySheet } from "@/components/drill/study-sheet";
import { lastMoveFrom, needsPromotion, toDests } from "@/lib/chess/dests";
import { playLine } from "@/lib/chess/line";
import { moveNoteAt } from "@/lib/openings/move-note";
import { moveMarkAt } from "@/lib/openings/move-mark";
import {
  DAILY_QUEUE_CAP,
  introduceMove,
  listDueCards,
  markProgress,
  markReviewed,
  type DueMove,
  type StudyMode,
} from "@/lib/reps/schedule";
import {
  STUDY_MODES,
  getOpening,
  historyAt,
  openingFromTrap,
  type Opening,
  type Trap,
} from "@/lib/openings";

const MOVE_MS = 90;
const REVIEW_JUMP_MS = 480;

export function DrillScreen({
  opening: root,
  initialReps = "learn",
  initialTrap = null,
  daily = false,
}: {
  opening: Opening;
  initialReps?: StudyMode;
  initialTrap?: string | null;
  /** Walk due moves across weapons, not only this line. */
  daily?: boolean;
}) {
  const [activeId, setActiveId] = useState(root.id);
  const activeRoot = getOpening(activeId) ?? root;
  const [lineId, setLineId] = useState<string | null>(initialTrap);
  const trap = activeRoot.traps.find((item) => item.id === lineId) ?? null;
  const opening = useMemo(
    () => (trap ? openingFromTrap(activeRoot, trap) : activeRoot),
    [activeRoot, trap],
  );

  const gameRef = useRef(new Chess());
  const plyRef = useRef(0);
  const modeRef = useRef<"drill" | "plan">("drill");
  const lockRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const repsRef = useRef<StudyMode>(initialReps);
  const dailyRef = useRef(daily);
  const activeIdRef = useRef(activeId);
  const queueRef = useRef<DueMove[]>([]);
  const queueIndexRef = useRef(0);
  const resumePlyRef = useRef<number | null>(null);
  const holdRef = useRef(false);
  const advanceRef = useRef<() => void>(() => {});

  const [session, setSession] = useState(0);
  const [fen, setFen] = useState(() => new Chess().fen());
  const [ply, setPly] = useState(0);
  const [played, setPlayed] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<Key[] | null>(null);
  const [orientation, setOrientation] = useState<"white" | "black">(root.side);
  const [mode, setMode] = useState<"drill" | "plan">("drill");
  const [hintKeys, setHintKeys] = useState<Key[] | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [check, setCheck] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [lineMenuOpen, setLineMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [reps, setReps] = useState<StudyMode>(initialReps);
  const [boardEpoch, setBoardEpoch] = useState(0);
  const [holdBook, setHoldBook] = useState(false);
  const [reviewEmpty, setReviewEmpty] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [queuePos, setQueuePos] = useState(0);
  const [queueLen, setQueueLen] = useState(0);

  const setHold = useCallback((next: boolean) => {
    holdRef.current = next;
    setHoldBook(next);
  }, []);

  useEffect(() => {
    repsRef.current = reps;
  }, [reps]);
  useEffect(() => {
    dailyRef.current = daily;
  }, [daily]);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const sync = useCallback(() => {
    const g = gameRef.current;
    setFen(g.fen());
    setPly(plyRef.current);
    setPlayed(g.history());
    setCheck(g.inCheck());
    setMode(modeRef.current);
    setLastMove(lastMoveFrom(g));
  }, []);

  const snapBoard = useCallback(() => {
    setBoardEpoch((n) => n + 1);
    sync();
  }, [sync]);

  const finishBook = useCallback(
    (wasPlan: boolean) => {
      modeRef.current = "plan";
      if (!wasPlan) setAnalyzeOpen(true);
      sync();
    },
    [sync],
  );

  const cancelTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    lockRef.current = false;
    setBusy(false);
  }, []);

  const applyPly = useCallback(
    (nextPly: number) => {
      const capped = Math.max(0, Math.min(nextPly, opening.moves.length));
      const pos = playLine(opening.moves, capped);
      const wasPlan = modeRef.current === "plan";
      gameRef.current = pos.chess;
      plyRef.current = pos.appliedPly;
      modeRef.current = pos.appliedPly >= opening.moves.length ? "plan" : "drill";
      setLastMove(pos.lastMove);
      setHintKeys(null);
      setHintUsed(false);
      if (pos.appliedPly >= opening.moves.length && repsRef.current !== "review") {
        finishBook(wasPlan);
      }
      sync();
    },
    [finishBook, opening.moves, sync],
  );

  const collectQueue = useCallback(
    (openingId?: string) => {
      return listDueCards(openingId)
        .filter((row) => {
          if (openingId && row.openingId === opening.id) {
            return row.ply >= 0 && row.ply < opening.moves.length;
          }
          const found = getOpening(row.openingId);
          return !!found && row.ply >= 0 && row.ply < found.moves.length;
        })
        .slice(0, DAILY_QUEUE_CAP);
    },
    [opening.id, opening.moves.length],
  );

  const goToQueueIndex = useCallback(
    (index: number) => {
      const item = queueRef.current[index];
      queueIndexRef.current = index;
      setQueuePos(index);
      setHold(false);
      if (!item) {
        setReviewDone(queueRef.current.length > 0);
        setReviewEmpty(queueRef.current.length === 0);
        return;
      }
      if (item.openingId !== opening.id) {
        resumePlyRef.current = item.ply;
        if (lineId) setLineId(null);
        setActiveId(item.openingId);
        return;
      }
      applyPly(item.ply);
    },
    [applyPly, lineId, opening.id, setHold],
  );

  useEffect(() => {
    advanceRef.current = () => {
      goToQueueIndex(queueIndexRef.current + 1);
    };
  }, [goToQueueIndex]);

  useEffect(() => {
    const modeNow = repsRef.current;
    let startPly = resumePlyRef.current;
    resumePlyRef.current = null;
    const clear = () => {
      lockRef.current = false;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    if (modeNow === "review" && startPly == null) {
      const items = dailyRef.current ? collectQueue() : collectQueue(opening.id);
      queueRef.current = items;
      queueIndexRef.current = 0;
      setQueueLen(items.length);
      setQueuePos(0);
      setReviewDone(false);
      setReviewEmpty(items.length === 0);
      if (!items.length) {
        startPly = 0;
      } else if (items[0].openingId !== opening.id) {
        resumePlyRef.current = items[0].ply;
        setLineId(null);
        setActiveId(items[0].openingId);
        return clear;
      } else {
        startPly = items[0].ply;
      }
    }

    const pos = playLine(opening.moves, startPly ?? 0);
    gameRef.current = pos.chess;
    plyRef.current = pos.appliedPly;
    modeRef.current = pos.appliedPly >= opening.moves.length ? "plan" : "drill";
    lockRef.current = false;
    holdRef.current = false;
    setAnalyzeOpen(false);
    setFen(pos.fen);
    setPly(pos.appliedPly);
    setPlayed(pos.chess.history());
    setLastMove(pos.lastMove);
    setOrientation(opening.side);
    setMode(modeRef.current);
    setHintKeys(null);
    setHintUsed(false);
    setBusy(false);
    setCheck(pos.check);
    setBookOpen(false);
    setLineMenuOpen(false);
    setHoldBook(false);
    if (modeNow !== "review") {
      setReviewEmpty(false);
      setReviewDone(false);
    }
    return clear;
  }, [collectQueue, opening, session]);

  const dests = useMemo(() => {
    if (busy || holdBook || reviewEmpty || (reps === "review" && reviewDone)) {
      return new Map<Key, Key[]>();
    }
    if (mode === "drill" && ply >= opening.moves.length) return new Map<Key, Key[]>();
    return toDests(new Chess(fen));
  }, [busy, fen, holdBook, mode, opening.moves.length, ply, reps, reviewDone, reviewEmpty]);

  const turnColor = fen.includes(" w ") ? "white" : "black";
  const movableColor =
    busy || holdBook || reviewEmpty || (reps === "review" && reviewDone)
      ? undefined
      : mode === "plan"
        ? "both"
        : turnColor;

  const fullMoves = Math.ceil(opening.moves.length / 2);
  const shownMove = Math.min(Math.ceil(ply / 2), fullMoves);
  const historyNow = historyAt(opening, ply);
  const note = useMemo(() => {
    if (reps === "review" && reviewEmpty) {
      return {
        san: "Clear",
        comment: daily ? "Nothing due." : "Nothing due on this line.",
      };
    }
    if (reps === "review" && reviewDone) {
      return { san: "Done", comment: "Queue finished." };
    }
    return moveNoteAt(opening, ply);
  }, [daily, opening, ply, reps, reviewDone, reviewEmpty]);

  const mark = useMemo<BoardMark | null>(() => {
    if (ply <= 0 || !lastMove || lastMove.length < 2) return null;
    const kind = moveMarkAt(opening, ply - 1);
    if (!kind) return null;
    return { kind, square: lastMove[1] };
  }, [opening, ply, lastMove]);

  const arrows = useMemo<BoardArrow[]>(() => {
    const next: BoardArrow[] = [];
    if (lastMove && lastMove.length === 2) {
      const brush =
        mark?.kind === "gem"
          ? "yellow"
          : mark?.kind === "true"
            ? "green"
            : mark?.kind === "clean"
              ? "blue"
              : "last";
      next.push({ orig: lastMove[0], dest: lastMove[1], brush });
    }
    if (hintKeys && hintKeys.length === 2) {
      next.push({ orig: hintKeys[0], dest: hintKeys[1], brush: "hint" });
    }
    return next;
  }, [lastMove, hintKeys, mark]);

  const onMove = useCallback(
    (from: Key, to: Key) => {
      if (holdRef.current || (lockRef.current && modeRef.current === "drill")) {
        snapBoard();
        return;
      }
      const g = gameRef.current;

      if (modeRef.current === "plan") {
        const promotion = needsPromotion(g, from as Square, to as Square) ? "q" : undefined;
        const move = g.move({ from, to, promotion });
        if (!move) {
          snapBoard();
          return;
        }
        setHintKeys(null);
        sync();
        return;
      }

      const plyNow = plyRef.current;
      const bookSan = opening.moves[plyNow];
      if (!bookSan) {
        snapBoard();
        return;
      }

      const probe = new Chess(g.fen());
      let expected;
      try {
        expected = probe.move(bookSan);
      } catch {
        expected = null;
      }

      const promotion =
        expected?.promotion ??
        (needsPromotion(g, from as Square, to as Square) ? "q" : undefined);
      const move = g.move({ from, to, promotion });
      if (!move) {
        snapBoard();
        return;
      }

      const ok =
        expected &&
        expected.from === move.from &&
        expected.to === move.to &&
        (expected.promotion ?? undefined) === (move.promotion ?? undefined);

      if (!ok) {
        g.undo();
        if (repsRef.current === "learn") {
          snapBoard();
          return;
        }
        const book = g.move(bookSan);
        if (!book) {
          snapBoard();
          return;
        }
        plyRef.current += 1;
        markReviewed(opening.id, plyNow, false);
        setHold(true);
        setHintKeys(null);
        snapBoard();
        return;
      }

      plyRef.current += 1;
      setHintKeys(null);
      setHintUsed(false);
      if (repsRef.current === "learn") {
        introduceMove(opening.id, plyNow);
        markProgress(opening.id, plyRef.current);
        if (plyRef.current >= opening.moves.length) finishBook(false);
        else sync();
        return;
      }

      markReviewed(opening.id, plyNow, true);
      markProgress(opening.id, plyRef.current);
      sync();
      if (repsRef.current === "review") {
        lockRef.current = true;
        setBusy(true);
        if (timerRef.current !== null) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          timerRef.current = null;
          lockRef.current = false;
          setBusy(false);
          advanceRef.current();
        }, REVIEW_JUMP_MS);
        return;
      }
      if (plyRef.current >= opening.moves.length) finishBook(false);
    },
    [finishBook, opening.id, opening.moves, setHold, snapBoard, sync],
  );

  const hint = () => {
    if (reps !== "learn" || hintUsed || busy || holdBook) return;
    const san = opening.moves[ply];
    if (!san) return;
    const probe = new Chess(gameRef.current.fen());
    try {
      const move = probe.move(san);
      if (!move) return;
      setHintKeys([move.from as Key, move.to as Key]);
      setHintUsed(true);
    } catch {
      /* ignore */
    }
  };

  const restart = () => {
    cancelTimer();
    setHold(false);
    setSession((n) => n + 1);
  };

  const stepBack = useCallback(() => {
    cancelTimer();
    setHold(false);
    if (repsRef.current === "review") {
      if (queueIndexRef.current > 0) goToQueueIndex(queueIndexRef.current - 1);
      return;
    }
    applyPly(plyRef.current - 1);
  }, [applyPly, cancelTimer, goToQueueIndex, setHold]);

  const stepForward = useCallback(() => {
    const jumping = timerRef.current !== null && repsRef.current === "review" && !holdRef.current;
    cancelTimer();
    if (jumping) {
      advanceRef.current();
      return;
    }
    if (holdRef.current) {
      setHold(false);
      if (repsRef.current === "review") {
        advanceRef.current();
        return;
      }
      if (plyRef.current >= opening.moves.length) finishBook(false);
      return;
    }
    if (repsRef.current !== "learn") return;
    if (plyRef.current >= opening.moves.length) return;
    const index = plyRef.current;
    applyPly(index + 1);
    introduceMove(opening.id, index);
  }, [applyPly, cancelTimer, finishBook, opening.id, opening.moves.length, setHold]);

  useEffect(() => {
    const sheetOpen = bookOpen || lineMenuOpen || historyOpen || analyzeOpen;
    const onKey = (event: KeyboardEvent) => {
      if (sheetOpen) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepBack();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepForward();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [analyzeOpen, bookOpen, historyOpen, lineMenuOpen, stepBack, stepForward]);

  const switchTrap = (next: Trap | null, jumpPly?: number) => {
    const same = (next?.id ?? null) === lineId;
    setLineMenuOpen(false);
    setBookOpen(false);
    if (same) {
      if (jumpPly != null) {
        cancelTimer();
        applyPly(jumpPly);
      }
      return;
    }
    resumePlyRef.current = jumpPly ?? null;
    setLineId(next?.id ?? null);
    setSession((n) => n + 1);
  };

  const selectMode = (next: StudyMode) => {
    cancelTimer();
    setHold(false);
    setReps(next);
    repsRef.current = next;
    setHintKeys(null);
    setHintUsed(false);
    if (next === "learn" || next === "quiz") {
      setReviewEmpty(false);
      setReviewDone(false);
      applyPly(0);
      return;
    }
    const items = dailyRef.current ? collectQueue() : collectQueue(opening.id);
    queueRef.current = items;
    queueIndexRef.current = 0;
    setQueueLen(items.length);
    setQueuePos(0);
    setReviewDone(false);
    setReviewEmpty(items.length === 0);
    if (!items.length) {
      applyPly(0);
      return;
    }
    const first = items[0];
    if (first.openingId === opening.id) {
      applyPly(first.ply);
      return;
    }
    resumePlyRef.current = first.ply;
    if (lineId) setLineId(null);
    setActiveId(first.openingId);
  };

  const analyzeLine = useMemo(
    () => [...played, ...opening.moves.slice(ply)],
    [played, opening.moves, ply],
  );

  const canForward =
    reps === "learn" ? ply < opening.moves.length : holdBook || (reps === "review" && busy);
  const canBack = reps === "review" ? queuePos > 0 : ply > 0;
  const status = holdBook
    ? `Book move. ${note.san}. ${note.comment ?? ""}`.trim()
    : note.comment
      ? `${note.san}. ${note.comment}`
      : note.san;

  return (
    <div className="drill-shell" data-mode={reps} data-testid="train-screen">
      <header className="drill-top">
        <div className="drill-nav">
          <Button asChild variant="ghost" size="icon-sm">
            <Link href="/" aria-label="Back to repertoire">
              <ChevronLeft />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <h1 className="drill-title">{activeRoot.shortName}</h1>
              <p className="drill-count">
                {reps === "review" && queueLen > 0
                  ? `${Math.min(queuePos + 1, queueLen)}/${queueLen}`
                  : `${shownMove}/${fullMoves}`}
              </p>
            </div>
            {reps === "review" ? (
              <p className="drill-branch">
                {reviewDone ? "Queue finished" : reviewEmpty ? "Nothing due" : "Due moves"}
              </p>
            ) : mode === "plan" ? (
              <p className="truncate text-[11px] text-[var(--mist)]">Plan mode — free play</p>
            ) : trap ? (
              <p className="drill-branch">{trap.name}</p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setOrientation((side) => (side === "white" ? "black" : "white"))}
            aria-label="Flip board"
            title="Flip board"
          >
            <FlipVertical2 />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setLineMenuOpen(true)}
            aria-label="Repertoire branches"
            aria-expanded={lineMenuOpen}
            aria-haspopup="dialog"
          >
            <Menu />
          </Button>
        </div>

        <div className="reps-row" role="tablist" aria-label="Study mode" data-testid="study-mode">
          {STUDY_MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={reps === item.id}
              className={reps === item.id ? "reps-chip reps-chip-on" : "reps-chip"}
              onClick={() => selectMode(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {status}
        </p>
      </header>

      <div className="learn-main">
        <div className="board-stage">
          <div className="board-with-history">
            <ChessBoard
              fen={fen}
              dests={dests}
              lastMove={lastMove}
              arrows={arrows}
              mark={mark}
              orientation={orientation}
              turnColor={turnColor}
              viewOnly={(busy && mode === "drill") || holdBook}
              movableColor={movableColor}
              check={check}
              animationMs={MOVE_MS}
              resyncKey={boardEpoch}
              onMove={onMove}
              onLongPress={() => setAnalyzeOpen(true)}
            />
          </div>
        </div>
        <PlyNav
          onBack={stepBack}
          onForward={stepForward}
          canBack={canBack}
          canForward={canForward}
          lastSan={played.at(-1) ?? "Start"}
        />
        <div className="move-note" data-testid="move-note" data-book={holdBook ? "true" : undefined}>
          <p className="move-note-san">{note.san}</p>
          <p className="move-note-comment">{note.comment ?? ""}</p>
          {holdBook ? <span className="move-note-timer">Book</span> : null}
          {historyNow.length ? (
            <HistoryMark
              glyph={historyNow[0].glyph}
              label={`${historyNow[0].title} (${historyNow[0].year})`}
              onClick={() => setHistoryOpen(true)}
            />
          ) : null}
        </div>
      </div>

      <footer className="drill-dock">
        <Button
          variant="ghost"
          size="sm"
          onClick={hint}
          disabled={reps !== "learn" || hintUsed || busy || holdBook || ply >= opening.moves.length}
          className="dock-btn"
        >
          <Lightbulb />
          Hint
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setAnalyzeOpen(true)} className="dock-btn">
          <ScanSearch />
          Analyze
        </Button>
        <Button variant="ghost" size="sm" onClick={restart} className="dock-btn">
          <RotateCcw />
          Restart
        </Button>
      </footer>

      {lineMenuOpen ? (
        <LineTreeMenu
          opening={activeRoot}
          trapId={lineId}
          ply={ply}
          onClose={() => setLineMenuOpen(false)}
          onPickBranch={switchTrap}
          onOpenBook={() => {
            setLineMenuOpen(false);
            setBookOpen(true);
          }}
        />
      ) : null}

      {bookOpen ? (
        <StudySheet
          opening={activeRoot}
          trapId={lineId}
          onClose={() => setBookOpen(false)}
          onSpine={() => {
            setLineId(null);
            setBookOpen(false);
            setSession((n) => n + 1);
          }}
          onTrap={(next) => switchTrap(next)}
        />
      ) : null}

      {historyOpen && historyNow.length ? (
        <HistorySplash
          opening={opening}
          milestones={historyNow}
          orientation={orientation}
          onClose={() => setHistoryOpen(false)}
        />
      ) : null}

      {analyzeOpen ? (
        <AnalyzeSplash
          line={analyzeLine}
          startPly={played.length}
          orientation={orientation}
          onClose={() => setAnalyzeOpen(false)}
        />
      ) : null}
    </div>
  );
}
