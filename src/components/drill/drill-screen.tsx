"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Chess } from "chess.js";
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
import { PracticePanel } from "@/components/drill/practice-panel";
import { QuizSheet } from "@/components/drill/quiz-sheet";
import { StudySheet } from "@/components/drill/study-sheet";
import { lastMoveFrom, needsPromotion, toDests } from "@/lib/chess/dests";
import { playLine } from "@/lib/chess/line";
import { moveNoteAt } from "@/lib/openings/move-note";
import { moveMarkAt } from "@/lib/openings/move-mark";
import {
  drillStudyMode,
  markProgress,
  markReviewed,
  reviewStartPly,
  type StudyMode,
} from "@/lib/reps/schedule";
import {
  isUserPly,
  openingFromTrap,
  quizForPly,
  STUDY_MODES,
  historyAt,
  type Opening,
  type Trap,
} from "@/lib/openings";
import type { Square } from "chess.js";

const MOVE_MS = 90;
const OPPONENT_MS = 140;
const AUTO_WAIT_MS = 720;

type LessonStyle = "podcast" | "teach";

export function DrillScreen({
  opening: root,
  initialReps = "learn",
  initialTrap = null,
}: {
  opening: Opening;
  initialReps?: StudyMode;
  initialTrap?: string | null;
}) {
  const [lineId, setLineId] = useState<string | null>(initialTrap);
  const trap = root.traps.find((t) => t.id === lineId) ?? null;
  const opening = useMemo(
    () => (trap ? openingFromTrap(root, trap) : root),
    [root, trap],
  );

  const gameRef = useRef(new Chess());
  const plyRef = useRef(0);
  const modeRef = useRef<"drill" | "plan">("drill");
  const lockRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const [session, setSession] = useState(0);
  const [fen, setFen] = useState(() => new Chess().fen());
  const [ply, setPly] = useState(0);
  const [played, setPlayed] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<Key[] | null>(null);
  const [orientation, setOrientation] = useState<"white" | "black">(root.side);
  const [mode, setMode] = useState<"drill" | "plan">("drill");
  const [hintKeys, setHintKeys] = useState<Key[] | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [lessonStyle, setLessonStyle] = useState<LessonStyle>(
    initialReps === "trial" ? "podcast" : "teach",
  );
  const [podcastPlaying, setPodcastPlaying] = useState(initialReps === "trial");
  const [busy, setBusy] = useState(false);
  const [check, setCheck] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [lineMenuOpen, setLineMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(initialReps === "drill");
  const [thinkOpen, setThinkOpen] = useState(initialReps === "practice");
  const [reps, setReps] = useState(() => drillStudyMode(initialReps));
  const [boardEpoch, setBoardEpoch] = useState(0);
  const [trialLeft, setTrialLeft] = useState(8);
  const lessonRef = useRef(lessonStyle);
  const resumePlyRef = useRef<number | null>(null);
  const autoAnalyzeRef = useRef(false);

  useEffect(() => {
    lessonRef.current = lessonStyle;
  }, [lessonStyle]);

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
      if (!wasPlan && !autoAnalyzeRef.current) {
        autoAnalyzeRef.current = true;
        setAnalyzeOpen(true);
      }
      sync();
    },
    [sync],
  );

  const applyPly = useCallback(
    (nextPly: number) => {
      const capped = Math.max(0, Math.min(nextPly, opening.moves.length));
      const pos = playLine(opening.moves, capped);
      const wasPlan = modeRef.current === "plan";
      gameRef.current = pos.chess;
      plyRef.current = pos.appliedPly;
      modeRef.current =
        pos.appliedPly >= opening.moves.length ? "plan" : "drill";
      setLastMove(pos.lastMove);
      setHintKeys(null);
      setHintUsed(false);
      if (pos.appliedPly >= opening.moves.length) finishBook(wasPlan);
      sync();
    },
    [opening, sync, finishBook],
  );

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
    const startPly =
      resumePlyRef.current ??
      (drillStudyMode(initialReps) === "reps" ? reviewStartPly(opening) : 0);
    resumePlyRef.current = null;
    const pos = playLine(opening.moves, startPly);
    gameRef.current = pos.chess;
    plyRef.current = pos.appliedPly;
    modeRef.current =
      pos.appliedPly >= opening.moves.length ? "plan" : "drill";
    lockRef.current = false;
    autoAnalyzeRef.current = false;
    setAnalyzeOpen(false);
    setFen(pos.fen);
    setPly(pos.appliedPly);
    setPlayed(pos.chess.history());
    setLastMove(pos.lastMove);
    setOrientation(opening.side);
    setMode(modeRef.current);
    if (pos.appliedPly >= opening.moves.length) finishBook(false);
    setHintKeys(null);
    setHintUsed(false);
    setBusy(false);
    setCheck(pos.check);
    setBookOpen(initialReps === "drill");
    setLineMenuOpen(false);
    setQuizOpen(false);
    setThinkOpen(initialReps === "practice");
    if (lessonRef.current === "podcast" || initialReps === "trial") {
      setPodcastPlaying(true);
    }

    let cancelled = false;

    const kick = async () => {
      if (lessonRef.current === "podcast") return;
      while (
        !cancelled &&
        modeRef.current === "drill" &&
        plyRef.current < opening.moves.length &&
        !isUserPly(opening.side, plyRef.current)
      ) {
        setBusy(true);
        lockRef.current = true;
        await sleep(plyRef.current === 0 ? 160 : OPPONENT_MS);
        if (cancelled) return;
        const move = playSan(opening.moves[plyRef.current]);
        if (!move) break;
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
  }, [opening, playSan, session, initialReps, finishBook]);

  useEffect(() => {
    if (lessonStyle !== "podcast" || !podcastPlaying) return;
    let cancelled = false;
    const run = async () => {
      await new Promise((r) => window.setTimeout(r, AUTO_WAIT_MS));
      if (cancelled) return;
      if (plyRef.current < opening.moves.length) {
        applyPly(plyRef.current + 1);
      } else {
        setPodcastPlaying(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [ply, lessonStyle, podcastPlaying, opening.moves.length, applyPly]);

  useEffect(() => {
    if (reps !== "trial" || !podcastPlaying) return;
    let left = 8;
    const id = window.setInterval(() => {
      left -= 1;
      if (left <= 0) {
        if (plyRef.current < opening.moves.length) applyPly(plyRef.current + 1);
        left = 8;
      }
      setTrialLeft(left);
    }, 1000);
    return () => window.clearInterval(id);
  }, [reps, podcastPlaying, ply, applyPly, opening.moves.length]);

  const dests = useMemo(() => {
    const g = new Chess(fen);
    if (mode === "drill" && (busy || lessonStyle === "podcast")) {
      return new Map<Key, Key[]>();
    }
    return toDests(g);
  }, [fen, mode, busy, lessonStyle]);

  const turnColor = fen.includes(" w ") ? "white" : "black";
  const movableColor =
    mode === "plan"
      ? "both"
      : busy || lessonStyle === "podcast"
        ? undefined
        : opening.side;

  const fullMoves = Math.ceil(opening.moves.length / 2);
  const shownMove = Math.min(Math.ceil(ply / 2), fullMoves);
  const quiz = quizForPly(opening, Math.max(0, ply - 1));
  const historyNow = historyAt(opening, ply);
  const note = useMemo(() => moveNoteAt(opening, ply), [opening, ply]);

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

  const cancelTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    lockRef.current = false;
    setBusy(false);
  };

  const onMove = useCallback(
    (from: Key, to: Key) => {
      if (lessonRef.current === "podcast") {
        snapBoard();
        return;
      }
      if (lockRef.current && modeRef.current === "drill") {
        snapBoard();
        return;
      }
      const g = gameRef.current;

      if (modeRef.current === "plan") {
        const promotion = needsPromotion(g, from as Square, to as Square)
          ? "q"
          : undefined;
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
      if (!bookSan || !isUserPly(opening.side, plyNow)) {
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

      const promotion = expected?.promotion
        ?? (needsPromotion(g, from as Square, to as Square) ? "q" : undefined);

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
        markReviewed(opening.id, plyNow, false);
        setHintKeys(null);
        snapBoard();
        return;
      }

      plyRef.current += 1;
      setHintKeys(null);
      setHintUsed(false);

      if (plyRef.current >= opening.moves.length) {
        finishBook(false);
        sync();
        return;
      }

      markReviewed(opening.id, plyNow, true);
      markProgress(opening.id, plyRef.current);
      sync();

      if (!isUserPly(opening.side, plyRef.current)) {
        lockRef.current = true;
        setBusy(true);
        if (timerRef.current !== null) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          timerRef.current = null;
          const reply = playSan(opening.moves[plyRef.current]);
          if (reply && modeRef.current === "plan") finishBook(false);
          lockRef.current = false;
          setBusy(false);
        }, OPPONENT_MS);
      }
    },
    [opening, playSan, snapBoard, sync, finishBook],
  );

  const hint = () => {
    if (mode !== "drill" || hintUsed || busy) return;
    if (!isUserPly(opening.side, ply)) return;
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
    setSession((n) => n + 1);
  };

  const stepBack = useCallback(() => {
    cancelTimer();
    if (lessonStyle === "podcast") setPodcastPlaying(false);
    applyPly(plyRef.current - 1);
  }, [applyPly, lessonStyle]);

  const stepForward = useCallback(() => {
    cancelTimer();
    if (lessonStyle === "podcast") setPodcastPlaying(false);
    if (plyRef.current >= opening.moves.length) return;
    applyPly(plyRef.current + 1);
  }, [applyPly, lessonStyle, opening.moves.length]);

  useEffect(() => {
    const sheetOpen =
      bookOpen ||
      lineMenuOpen ||
      historyOpen ||
      analyzeOpen ||
      quizOpen ||
      thinkOpen;
    const onKey = (event: KeyboardEvent) => {
      if (sheetOpen) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
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
  }, [
    analyzeOpen,
    bookOpen,
    historyOpen,
    lineMenuOpen,
    quizOpen,
    stepBack,
    stepForward,
    thinkOpen,
  ]);

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

  const analyzeLine = useMemo(
    () => [...played, ...opening.moves.slice(ply)],
    [played, opening.moves, ply],
  );

  return (
    <div className="drill-shell">
      <header className="drill-top">
        <div className="drill-nav">
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
          >
            <Link href="/" aria-label="Back to repertoire">
              <ChevronLeft />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <h1 className="drill-title">{root.shortName}</h1>
              <p className="drill-count">
                {shownMove}/{fullMoves}
              </p>
            </div>
            {mode === "plan" ? (
              <p className="truncate text-[11px] text-[var(--mist)]">
                Plan mode — free play
              </p>
            ) : trap ? (
              <p className="drill-branch">{trap.name}</p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              setOrientation((o) => (o === "white" ? "black" : "white"))
            }
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

        <div className="reps-row" role="tablist" aria-label="Study mode">
          {STUDY_MODES.filter((m) => m.id !== "progress").map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={reps === m.id}
              className={reps === m.id ? "reps-chip reps-chip-on" : "reps-chip"}
              onClick={() => {
                setReps(drillStudyMode(m.id));
                const auto = m.id === "trial";
                setLessonStyle(auto ? "podcast" : "teach");
                setPodcastPlaying(auto);
                if (m.id === "drill") setBookOpen(true);
                if (m.id === "practice") setThinkOpen(true);
                if (m.id === "learn") {
                  setLineId(null);
                  if (lineId) setSession((n) => n + 1);
                }
                if (m.id === "reps") {
                  cancelTimer();
                  applyPly(reviewStartPly(opening));
                }
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {note.comment ? `${note.san}. ${note.comment}` : note.san}
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
              viewOnly={(busy && mode === "drill") || lessonStyle === "podcast"}
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
          canBack={ply > 0}
          canForward={ply < opening.moves.length}
          lastSan={played.at(-1) ?? "Start"}
          playing={lessonStyle === "podcast" ? podcastPlaying : undefined}
          onPlay={
            lessonStyle === "podcast"
              ? () => {
                  if (plyRef.current >= opening.moves.length) {
                    applyPly(0);
                    setPodcastPlaying(true);
                    return;
                  }
                  setPodcastPlaying((on) => !on);
                }
              : undefined
          }
        />
        <div className="move-note" data-testid="move-note">
          <p className="move-note-san">{note.san}</p>
          <p className="move-note-comment">{note.comment ?? ""}</p>
          {reps === "trial" ? (
            <span className="move-note-timer">{trialLeft}s</span>
          ) : null}
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
          disabled={
            mode !== "drill" ||
            hintUsed ||
            busy ||
            !isUserPly(opening.side, ply)
          }
          className="dock-btn"
        >
          <Lightbulb />
          Hint
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAnalyzeOpen(true)}
          className="dock-btn"
        >
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
          opening={root}
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
          opening={root}
          trapId={lineId}
          onClose={() => setBookOpen(false)}
          onSpine={() => {
            setLineId(null);
            setBookOpen(false);
            setSession((n) => n + 1);
          }}
          onTrap={(t) => switchTrap(t)}
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

      {quizOpen && quiz ? (
        <QuizSheet
          quiz={quiz}
          onClose={() => setQuizOpen(false)}
        />
      ) : null}

      {thinkOpen ? (
        <PracticePanel
          opening={opening}
          startMoves={played}
          orientation={orientation}
          onClose={() => setThinkOpen(false)}
        />
      ) : null}

    </div>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
