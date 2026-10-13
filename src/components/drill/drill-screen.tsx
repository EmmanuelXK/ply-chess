"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Chess, type Square } from "chess.js";
import type { Key } from "@lichess-org/chessground/types";
import {
  FlipVertical2,
  Lightbulb,
  Menu,
  RotateCcw,
  ScanSearch,
} from "lucide-react";

import { BoardShell } from "@/components/board/board-shell";
import { ChessBoard, type BoardArrow, type BoardMark } from "@/components/board/chess-board";
import { HeaderBar } from "@/components/board/header-bar";
import { NavControls } from "@/components/board/nav-controls";
import { Button } from "@/components/ui/button";
import { CoachBubble } from "@/components/coach/coach-bubble";
import { HistoryMark } from "@/components/drill/history-mark";
import { LineTreeMenu } from "@/components/drill/line-tree-menu";
import { HistorySplash } from "@/components/drill/history-splash";
import { ModeToggle } from "@/components/drill/mode-toggle";
import { PlanCard } from "@/components/drill/plan-card";
import { PracticeMiss } from "@/components/drill/practice-miss";
import { StudySheet } from "@/components/drill/study-sheet";
import { lastMoveFrom, needsPromotion, toDests } from "@/lib/chess/dests";
import { playLine } from "@/lib/chess/line";
import { BoardEngines, BoardEvalBar, BoardEvalReadout } from "@/components/drill/board-engines";
import { gradeBookPly } from "@/lib/chess/move-quality";
import { moveNoteAt } from "@/lib/openings/move-note";
import { fetchCrowd } from "@/lib/explorer/client";
import { pickWeighted } from "@/lib/explorer/crowd";
import { planForLine } from "@/lib/openings/line-plan";
import { judgeUserMove, storedReplies } from "@/lib/openings/practice";
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
  activeLine,
  branchChoices,
  getOpening,
  historyAt,
  isUserPly,
  openingOnLine,
  sharedPrefixLength,
  type Opening,
} from "@/lib/openings";

const MOVE_MS = 90;
const REVIEW_JUMP_MS = 480;

export function DrillScreen({
  opening: root,
  initialTrap = null,
  daily = false,
}: {
  opening: Opening;
  initialTrap?: string | null;
  /** Dormant review queue. Learn does not walk it. */
  daily?: boolean;
}) {
  const [activeId, setActiveId] = useState(root.id);
  const activeRoot = getOpening(activeId) ?? root;
  const [lineId, setLineId] = useState<string | null>(() => {
    if (!initialTrap) return null;
    const main = root.lines[0];
    if (!main || initialTrap === main.id) return null;
    return root.lines.some((line) => line.id === initialTrap) ? initialTrap : null;
  });
  const opening = useMemo(
    () => openingOnLine(activeRoot, lineId),
    [activeRoot, lineId],
  );

  const gameRef = useRef(new Chess());
  const plyRef = useRef(0);
  const modeRef = useRef<"drill" | "plan">("drill");
  const lockRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const repsRef = useRef<StudyMode>("learn");
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
  const router = useRouter();
  const reps: StudyMode = "learn";
  const [boardEpoch, setBoardEpoch] = useState(0);
  const [holdBook, setHoldBook] = useState(false);
  const [trainer, setTrainer] = useState<"learn" | "practice">("learn");
  const [miss, setMiss] = useState<{ played: string; book: string; reason: string } | null>(null);
  const [awaitReply, setAwaitReply] = useState(false);
  const [crowd, setCrowd] = useState<{ ply: number; san: string; percent: number } | null>(null);
  const [planPick, setPlanPick] = useState(0);
  const [shown, setShown] = useState<{ fen: string; arrows: string[]; squares: string[] } | null>(null);
  const replyGen = useRef(0);
  const trainerRef = useRef(trainer);
  const lineIdRef = useRef(lineId);
  const missRef = useRef(miss);
  const playReplyRef = useRef<() => void>(() => {});
  const switchLineRef = useRef<(nextId: string | null, jumpPly?: number) => void>(() => {});
  const [, setReviewEmpty] = useState(false);
  const [, setReviewDone] = useState(false);
  const [, setQueuePos] = useState(0);
  const [, setQueueLen] = useState(0);

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
  useEffect(() => {
    trainerRef.current = trainer;
  }, [trainer]);
  useEffect(() => {
    lineIdRef.current = lineId;
  }, [lineId]);
  useEffect(() => {
    missRef.current = miss;
  }, [miss]);

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

  const finishBook = useCallback(() => {
    modeRef.current = "plan";
    sync();
  }, [sync]);

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
      gameRef.current = pos.chess;
      plyRef.current = pos.appliedPly;
      modeRef.current = pos.appliedPly >= opening.moves.length ? "plan" : "drill";
      setLastMove(pos.lastMove);
      setHintKeys(null);
      setHintUsed(false);
      if (pos.appliedPly >= opening.moves.length && repsRef.current !== "review") {
        finishBook();
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

  const userToMove = isUserPly(opening.side, ply);
  const inPracticeBook = trainer === "practice" && mode === "drill" && ply < opening.moves.length;
  const dests = useMemo(() => {
    if (busy || holdBook) {
      return new Map<Key, Key[]>();
    }
    if (inPracticeBook && !userToMove) return new Map<Key, Key[]>();
    if (mode === "drill" && ply >= opening.moves.length) return new Map<Key, Key[]>();
    return toDests(new Chess(fen));
  }, [busy, fen, holdBook, inPracticeBook, mode, opening.moves.length, ply, userToMove]);

  const turnColor = fen.includes(" w ") ? "white" : "black";
  const movableColor =
    busy || holdBook
      ? undefined
      : inPracticeBook
        ? userToMove
          ? opening.side
          : undefined
        : mode === "plan"
          ? "both"
          : turnColor;

  const historyNow = historyAt(opening, ply);
  const note = useMemo(() => moveNoteAt(opening, ply), [opening, ply]);
  const line = activeLine(opening);
  const bookPos = useMemo(
    () => playLine(opening.moves, Math.min(ply, opening.moves.length)),
    [opening.moves, ply],
  );
  const onBook = fen === bookPos.fen;
  const bookEnded = onBook && ply >= opening.moves.length;
  const bookEval = onBook ? (opening.evals[Math.min(ply, opening.evals.length - 1)] ?? null) : null;
  const choices = useMemo(
    () => (onBook && !bookEnded ? branchChoices(opening, ply) : []),
    [bookEnded, onBook, opening, ply],
  );

  const mark = useMemo<BoardMark | null>(() => {
    if (ply <= 0 || !lastMove || lastMove.length < 2 || !onBook) return null;
    const kind = gradeBookPly(opening, ply - 1);
    if (!kind) return null;
    return { kind, square: lastMove[1] };
  }, [opening, ply, lastMove, onBook]);

  const linePlan = bookEnded ? planForLine(line?.id) : null;
  const planStep = linePlan?.steps[Math.min(planPick, Math.max(0, linePlan.steps.length - 1))] ?? null;
  const arrows = useMemo<BoardArrow[]>(() => {
    const next: BoardArrow[] = [];
    if (lastMove && lastMove.length === 2) {
      next.push({ orig: lastMove[0], dest: lastMove[1], brush: "last" });
    }
    if (hintKeys && hintKeys.length === 2) {
      next.push({ orig: hintKeys[0], dest: hintKeys[1], brush: "hint" });
    }
    if (planStep?.uci && planStep.uci.length >= 4) {
      next.push({
        orig: planStep.uci.slice(0, 2) as Key,
        dest: planStep.uci.slice(2, 4) as Key,
        brush: "blue",
      });
    }
    if (shown && shown.fen === fen) {
      for (const uci of shown.arrows) {
        if (uci.length < 4) continue;
        next.push({
          orig: uci.slice(0, 2) as Key,
          dest: uci.slice(2, 4) as Key,
          brush: "green",
        });
      }
    }
    return next;
  }, [fen, hintKeys, lastMove, planStep, shown]);
  const circles = useMemo<Key[]>(() => {
    const marks: Key[] = [];
    if (planStep?.square && !planStep.uci) marks.push(planStep.square as Key);
    if (shown && shown.fen === fen) {
      for (const square of shown.squares) marks.push(square as Key);
    }
    return marks;
  }, [fen, planStep, shown]);

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

      if (trainerRef.current === "practice") {
        const prefix = g.history().slice(0, -1);
        const currentId = activeLine(opening)?.id ?? null;
        const verdict = judgeUserMove(activeRoot, opening.side, prefix, move.san, currentId);
        if (!verdict.ok) {
          g.undo();
          setMiss({ played: move.san, book: verdict.bookSan, reason: verdict.reason });
          snapBoard();
          return;
        }
        setMiss(null);
        const mainId = activeRoot.lines[0]?.id ?? null;
        const normalized = !verdict.lineId || verdict.lineId === mainId ? null : verdict.lineId;
        if (normalized !== lineIdRef.current) {
          setAwaitReply(true);
          switchLineRef.current(verdict.lineId, plyNow + 1);
          return;
        }
        plyRef.current += 1;
        setHintKeys(null);
        setHintUsed(false);
        if (plyRef.current >= opening.moves.length) {
          setAwaitReply(false);
          finishBook();
        } else {
          setAwaitReply(true);
          sync();
        }
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
        if (plyRef.current >= opening.moves.length) finishBook();
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
      if (plyRef.current >= opening.moves.length) finishBook();
    },
    [activeRoot, finishBook, opening, setHold, snapBoard, sync],
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
    replyGen.current += 1;
    setHold(false);
    setMiss(null);
    setAwaitReply(false);
    setCrowd(null);
    setShown(null);
    setPlanPick(0);
    setSession((n) => n + 1);
  };

  const stepBack = useCallback(() => {
    cancelTimer();
    replyGen.current += 1;
    setHold(false);
    setMiss(null);
    setAwaitReply(false);
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
      if (plyRef.current >= opening.moves.length) finishBook();
      return;
    }
    if (trainerRef.current === "practice") {
      if (missRef.current) return;
      if (isUserPly(opening.side, plyRef.current)) return;
      if (plyRef.current >= opening.moves.length) return;
      playReplyRef.current();
      return;
    }
    if (repsRef.current !== "learn") return;
    if (plyRef.current >= opening.moves.length) return;
    const index = plyRef.current;
    applyPly(index + 1);
    introduceMove(opening.id, index);
  }, [applyPly, cancelTimer, finishBook, opening.id, opening.moves.length, opening.side, setHold]);

  useEffect(() => {
    const sheetOpen = bookOpen || lineMenuOpen || historyOpen;
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
  }, [bookOpen, historyOpen, lineMenuOpen, stepBack, stepForward]);

  const switchLine = useCallback(
    (nextId: string | null, jumpPly?: number) => {
      const mainId = activeRoot.lines[0]?.id ?? null;
      const normalized = !nextId || nextId === mainId ? null : nextId;
      const same = normalized === lineId;
      setLineMenuOpen(false);
      setBookOpen(false);
      if (same) {
        if (jumpPly != null) {
          cancelTimer();
          applyPly(jumpPly);
        }
        return;
      }
      const nextMoves =
        activeRoot.lines.find((item) => item.id === (normalized ?? mainId))?.moves ??
        activeRoot.lines[0]?.moves ??
        opening.moves;
      const shared = sharedPrefixLength(opening.moves, nextMoves);
      resumePlyRef.current =
        jumpPly != null ? Math.min(jumpPly, nextMoves.length) : Math.min(plyRef.current, shared);
      setLineId(normalized);
      setSession((n) => n + 1);
    },
    [activeRoot.lines, applyPly, cancelTimer, lineId, opening.moves],
  );
  const playStoredReply = useCallback(() => {
    const generation = ++replyGen.current;
    const currentPly = plyRef.current;
    const fenNow = gameRef.current.fen();
    const prefix = gameRef.current.history();
    const replies = storedReplies(activeRoot, prefix);
    void (async () => {
      const table = await fetchCrowd(fenNow);
      if (generation !== replyGen.current) return;
      if (trainerRef.current !== "practice" || missRef.current) return;
      if (plyRef.current !== currentPly) return;
      const picked = pickWeighted(replies, table, fenNow);
      if (!picked) return;
      if (picked.percent != null) {
        setCrowd({ ply: currentPly + 1, san: picked.reply.san, percent: picked.percent });
      } else {
        setCrowd(null);
      }
      if (opening.moves[currentPly] === picked.reply.san) {
        applyPly(currentPly + 1);
        return;
      }
      switchLine(picked.reply.lineId, currentPly + 1);
    })();
  }, [activeRoot, applyPly, opening.moves, switchLine]);
  useEffect(() => {
    switchLineRef.current = switchLine;
    playReplyRef.current = playStoredReply;
  }, [playStoredReply, switchLine]);

  useEffect(() => {
    if (trainer !== "practice" || !awaitReply || miss) return;
    if (isUserPly(opening.side, ply) || ply >= opening.moves.length || mode === "plan") return;
    const timer = window.setTimeout(() => {
      setAwaitReply(false);
      playReplyRef.current();
    }, 420);
    return () => window.clearTimeout(timer);
  }, [awaitReply, miss, mode, opening.moves.length, opening.side, ply, trainer]);

  const openAnalyze = useCallback(() => {
    const params = new URLSearchParams();
    params.set("opening", activeRoot.id);
    if (lineId) params.set("line", lineId);
    params.set("ply", String(plyRef.current));
    router.push(`/analyze?${params.toString()}`);
  }, [activeRoot.id, lineId, router]);

  const canForward =
    trainer === "practice"
      ? !userToMove && ply < opening.moves.length && !miss && mode === "drill"
      : ply < opening.moves.length || holdBook;
  const canBack = ply > 0;
  const status = [
    bookEnded ? "Book ends." : "",
    holdBook ? "Book move." : "",
    note.san,
    note.comment ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const bookTick = bookEval
    ? { cp: bookEval.cp, mate: bookEval.mate, depth: bookEval.depth, best: bookEval.best }
    : null;

  return (
    <BoardEngines fen={fen} enabled book={bookTick}>
      <BoardShell
        testId="train-screen"
        mode={reps}
        header={
          <HeaderBar
            backHref="/"
            backLabel="Back to repertoire"
            kicker={activeRoot.shortName}
            title={line?.nickname ?? activeRoot.shortName}
            titleTestId="line-nickname"
            subtitle={
              line ? (
                <>
                  <span data-testid="line-matchup">{line.matchup}</span>
                  <span aria-hidden> · </span>
                  <span data-testid="line-eco">{line.ecoName}</span>
                </>
              ) : null
            }
            actions={
              <>
                <ModeToggle
                  mode={trainer}
                  onChange={(next) => {
                    setTrainer(next);
                    setMiss(null);
                    replyGen.current += 1;
                    if (
                      next === "practice" &&
                      !isUserPly(opening.side, plyRef.current) &&
                      plyRef.current < opening.moves.length &&
                      modeRef.current === "drill"
                    ) {
                      setAwaitReply(true);
                    } else {
                      setAwaitReply(false);
                    }
                  }}
                />
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
              </>
            }
          />
        }
        evalBar={<BoardEvalBar orientation={orientation} />}
        board={
          <ChessBoard
            fen={fen}
            dests={dests}
            lastMove={lastMove}
            arrows={arrows}
            circles={circles}
            mark={mark}
            orientation={orientation}
            turnColor={turnColor}
            viewOnly={(busy && mode === "drill") || holdBook}
            movableColor={movableColor}
            check={check}
            animationMs={MOVE_MS}
            resyncKey={boardEpoch}
            onMove={onMove}
            onLongPress={openAnalyze}
          />
        }
        panel={
          <>
            <p className="sr-only" role="status" aria-live="polite">
              {status}
            </p>
            <div className="learn-readout" data-testid="move-note" data-book={holdBook ? "true" : undefined}>
              {trainer === "practice" && miss ? (
                <PracticeMiss played={miss.played} book={miss.book} reason={miss.reason} />
              ) : null}
              <div className="learn-readout-head">
                <p className="move-note-san">{note.san}</p>
                {holdBook ? <span className="move-note-timer">Book</span> : null}
                {historyNow.length ? (
                  <HistoryMark
                    glyph={historyNow[0].glyph}
                    label={`${historyNow[0].title} (${historyNow[0].year})`}
                    onClick={() => setHistoryOpen(true)}
                  />
                ) : null}
              </div>
              {trainer === "learn" && choices.length > 1 ? (
                <div
                  className="branch-chooser"
                  role="listbox"
                  aria-label="Opponent alternatives"
                  data-testid="branch-chooser"
                >
                  {choices.map((choice) => (
                    <button
                      key={choice.san}
                      type="button"
                      role="option"
                      aria-selected={choice.selected}
                      className={choice.selected ? "branch-chip branch-chip-on" : "branch-chip"}
                      onClick={() => switchLine(choice.lineId)}
                    >
                      <span className="branch-chip-move">{choice.chip}</span>
                      {choice.nickname ? <span className="branch-chip-nick">{choice.nickname}</span> : null}
                    </button>
                  ))}
                </div>
              ) : null}
              {linePlan ? (
                <PlanCard plan={linePlan} selected={planPick} onSelect={setPlanPick} />
              ) : bookEnded ? (
                <p className="explain-done" data-testid="book-ends">
                  Book ends{line?.eco.name ? ` · ${line.eco.name}` : ""}
                </p>
              ) : mode === "plan" ? (
                <p className="explain-done">Off book. Analyze from here.</p>
              ) : null}
              {trainer === "practice" && crowd && crowd.ply === ply && !miss ? (
                <p className="crowd-hint" data-testid="crowd-hint">
                  played by {crowd.percent}% of players
                </p>
              ) : null}
              {note.comment ? (
                <p className="explain-copy" data-testid="explain">
                  {note.comment}
                </p>
              ) : null}
              <BoardEvalReadout />
            </div>
          </>
        }
        dock={
          <>
            <div className="learn-actions">
              <Button
                variant="ghost"
                size="sm"
                onClick={hint}
                disabled={
                  trainer === "practice" ||
                  reps !== "learn" ||
                  hintUsed ||
                  busy ||
                  holdBook ||
                  ply >= opening.moves.length
                }
                className="dock-btn"
              >
                <Lightbulb />
                Hint
              </Button>
              <Button variant="ghost" size="sm" onClick={openAnalyze} className="dock-btn" data-testid="open-analyze">
                <ScanSearch />
                Analyze
              </Button>
              <Button variant="ghost" size="sm" onClick={restart} className="dock-btn">
                <RotateCcw />
                Restart
              </Button>
            </div>
            <NavControls
              onBack={stepBack}
              onForward={stepForward}
              canBack={canBack}
              canForward={canForward}
              lastSan={played.at(-1) ?? "Start"}
            />
          </>
        }
        overlays={
          <>
            {lineMenuOpen ? (
              <LineTreeMenu
                opening={activeRoot}
                trapId={lineId}
                ply={ply}
                onClose={() => setLineMenuOpen(false)}
                onPickBranch={switchLine}
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
                onSpine={() => switchLine(null)}
                onLine={(id) => switchLine(id)}
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
            <CoachBubble
              position={{
                fen,
                line: line?.nickname ?? activeRoot.shortName,
                matchup: line?.matchup ?? activeRoot.name,
                moves: played,
                side: opening.side,
                evalCp: bookEval?.cp ?? null,
                evalMate: bookEval?.mate ?? null,
                evalDepth: bookEval?.depth ?? null,
                best: bookEval?.best ?? null,
                note: note.comment ?? null,
              }}
              onShow={(mark) => setShown({ fen, arrows: mark.arrows, squares: mark.squares })}
            />
          </>
        }
      />
    </BoardEngines>
  );
}
