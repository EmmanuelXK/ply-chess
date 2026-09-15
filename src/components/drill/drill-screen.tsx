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
  Volume2,
  VolumeX,
} from "lucide-react";

import { ChessBoard, type BoardArrow } from "@/components/board/chess-board";
import { Button } from "@/components/ui/button";
import { AnalyzeSplash } from "@/components/drill/analyze-splash";
import { HistoryMark } from "@/components/drill/history-mark";
import { LineTreeMenu } from "@/components/drill/line-tree-menu";
import { HistorySplash } from "@/components/drill/history-splash";
import { InlineAsk } from "@/components/drill/inline-ask";
import { PlyNav } from "@/components/drill/ply-nav";
import { PracticePanel } from "@/components/drill/practice-panel";
import { QuizSheet } from "@/components/drill/quiz-sheet";
import { StudySheet } from "@/components/drill/study-sheet";
import { WhySplash } from "@/components/drill/why-splash";
import { lastMoveFrom, needsPromotion, toDests } from "@/lib/chess/dests";
import { playLine } from "@/lib/chess/line";
import {
  prefetchDialogue,
  silence,
  speak,
  speakDialogue,
  unlockSpeech,
  type SpeakHandle,
} from "@/lib/chess/speak";
import {
  ACTIVE_COACH,
  dialogueForPly,
  dialogueForStart,
  type DialogueAsk,
  type DialogueScene,
  type LessonStyle,
  type MissMemory,
} from "@/lib/dialogue";
import { readVoiceOnDefault, writeVoiceOnDefault } from "@/lib/tts/prefs";
import { shouldAutoSpeakOnScene } from "@/lib/tts/ask-coach";
import {
  drillStudyMode,
  markProgress,
  markReviewed,
  reviewStartPly,
  type StudyMode,
} from "@/lib/reps/schedule";
import { shouldAutoOpenAnalyze } from "@/lib/coach-brain/handoff";
import {
  coachAfterPly,
  coachAtStart,
  coachOnFail,
  coachOnHint,
  coachOnPlan,
  textForCoachTap,
  type CoachKind,
  type CoachState,
} from "@/lib/openings/coach";
import {
  isUserPly,
  openingFromTrap,
  quizForPly,
  STUDY_MODES,
  explainLessonAt,
  historyAt,
  type Opening,
  type PlanVoice,
  type Trap,
} from "@/lib/openings";
import type { Square } from "chess.js";

const MOVE_MS = 90;
const OPPONENT_MS = 140;
const AUTO_WAIT_MS = 720;
const PLAN_VOICES = ["steady", "creative", "aggressive"] as const;

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
  const [coach, setCoach] = useState<CoachState>(() => coachAtStart(opening));
  const [hintKeys, setHintKeys] = useState<Key[] | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [voice, setVoice] = useState<PlanVoice>("aggressive");
  const [tts, setTts] = useState(() => readVoiceOnDefault());
  const [lessonStyle, setLessonStyle] = useState<LessonStyle>(
    initialReps === "trial" ? "podcast" : "teach",
  );
  const [podcastPlaying, setPodcastPlaying] = useState(initialReps === "trial");
  const [misses, setMisses] = useState<MissMemory[]>([]);
  const [busy, setBusy] = useState(false);
  const [check, setCheck] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [lineMenuOpen, setLineMenuOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(initialReps === "drill");
  const [thinkOpen, setThinkOpen] = useState(initialReps === "practice");
  const [reps, setReps] = useState(() => drillStudyMode(initialReps));
  const [boardEpoch, setBoardEpoch] = useState(0);
  const [trialLeft, setTrialLeft] = useState(8);
  const [coachSpeaking, setCoachSpeaking] = useState(false);
  const [scene, setScene] = useState<DialogueScene>(() =>
    dialogueForStart(opening, { duo: ACTIVE_COACH, mode: "solo" }),
  );
  const [beatIndex, setBeatIndex] = useState(0);
  const [ask, setAsk] = useState<DialogueAsk | null>(null);
  const [askPicked, setAskPicked] = useState<string | null>(null);
  const lessonRef = useRef(lessonStyle);
  const missesRef = useRef<MissMemory[]>([]);
  const askWaitRef = useRef<((id: string | null) => void) | null>(null);
  const speechRef = useRef<SpeakHandle | null>(null);
  const lastSpokenRef = useRef("");
  const resumePlyRef = useRef<number | null>(null);
  const autoAnalyzeRef = useRef(false);

  useEffect(() => {
    lessonRef.current = lessonStyle;
  }, [lessonStyle]);
  useEffect(() => {
    missesRef.current = misses;
  }, [misses]);

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

  const pushScene = useCallback(
    (next: CoachState, afterPly: number, kind?: CoachKind) => {
      setCoach(next);
      const nextScene =
        afterPly < 0
          ? dialogueForStart(opening, {
              duo: ACTIVE_COACH,
              mode: "solo",
              soloText: next.text,
              misses: missesRef.current,
            })
          : dialogueForPly(opening, afterPly, {
              duo: ACTIVE_COACH,
              mode: "solo",
              kind: kind ?? next.kind,
              fen: gameRef.current.fen(),
              soloText: next.text,
              misses: missesRef.current,
            });
      setScene(nextScene);
      setBeatIndex(0);
      setAsk(null);
      setAskPicked(null);
      prefetchAround(opening, afterPly);
    },
    [opening],
  );

  const finishBook = useCallback(
    (wasPlan: boolean) => {
      modeRef.current = "plan";
      pushScene(
        {
          text: "Book done. Pick a plan.",
          chunkName: "Plan mode",
          kind: "plan",
        },
        opening.moves.length - 1,
        "plan",
      );
      if (shouldAutoOpenAnalyze(wasPlan, true, autoAnalyzeRef.current)) {
        autoAnalyzeRef.current = true;
        setAnalyzeOpen(true);
      }
    },
    [opening.moves.length, pushScene],
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
      if (pos.appliedPly === 0) pushScene(coachAtStart(opening), -1, "start");
      else if (pos.appliedPly >= opening.moves.length) {
        finishBook(wasPlan);
      } else {
        pushScene(coachAfterPly(opening, pos.appliedPly - 1), pos.appliedPly - 1);
      }
      sync();
    },
    [opening, pushScene, sync, finishBook],
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
    const wasPlan = false;
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
    if (pos.appliedPly === 0) pushScene(coachAtStart(opening), -1, "start");
    else if (pos.appliedPly >= opening.moves.length) {
      finishBook(wasPlan);
    } else {
      pushScene(
        coachAfterPly(opening, pos.appliedPly - 1),
        pos.appliedPly - 1,
      );
    }
    setHintKeys(null);
    setHintUsed(false);
    setVoice("aggressive");
    setBusy(false);
    setCheck(pos.check);
    setMisses([]);
    missesRef.current = [];
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
        pushScene(coachAfterPly(opening, plyRef.current - 1), plyRef.current - 1);
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
  }, [opening, playSan, session, initialReps, pushScene, finishBook]);

  useEffect(() => {
    askWaitRef.current?.(null);
    askWaitRef.current = null;
    speechRef.current?.stop();
    speechRef.current = null;
    setCoachSpeaking(false);
    silence();
    const beat = scene.beats[0];
    setBeatIndex(0);
    setAsk(beat?.ask ?? null);
    setAskPicked(null);
    void shouldAutoSpeakOnScene();
  }, [scene]);

  useEffect(() => {
    if (lessonStyle !== "podcast" || !podcastPlaying) return;
    let cancelled = false;
    const run = async () => {
      const handle = speechRef.current;
      if (handle) {
        await Promise.race([
          handle.done,
          new Promise((r) => window.setTimeout(r, AUTO_WAIT_MS + 2200)),
        ]);
      } else {
        await new Promise((r) => window.setTimeout(r, AUTO_WAIT_MS));
      }
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
  }, [scene, lessonStyle, podcastPlaying, opening.moves.length, applyPly]);

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
  }, [reps, podcastPlaying, scene, applyPly, opening.moves.length]);

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
  const why = useMemo(() => explainLessonAt(opening, ply), [opening, ply]);
  const historyNow = historyAt(opening, ply);

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
        const fail = coachOnFail(opening, plyNow);
        const miss: MissMemory = {
          ply: plyNow,
          san: bookSan,
          idea: fail.text,
        };
        setMisses((prev) => {
          const next = [...prev, miss].slice(-4);
          missesRef.current = next;
          return next;
        });
        pushScene(fail, plyNow, "fail");
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

      pushScene(coachAfterPly(opening, plyRef.current - 1), plyRef.current - 1);
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
          if (reply) {
            if (modeRef.current === "plan") {
              finishBook(false);
            } else {
              pushScene(
                coachAfterPly(opening, plyRef.current - 1),
                plyRef.current - 1,
              );
            }
          }
          lockRef.current = false;
          setBusy(false);
        }, OPPONENT_MS);
      }
    },
    [opening, playSan, pushScene, snapBoard, sync, finishBook],
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
      pushScene(coachOnHint(opening, ply), ply, "hint");
    } catch {
      /* ignore */
    }
  };

  const restart = () => {
    silence();
    cancelTimer();
    setSession((n) => n + 1);
  };

  const pickVoice = (next: PlanVoice) => {
    setVoice(next);
    pushScene(coachOnPlan(next, opening), opening.moves.length - 1, "plan");
  };

  const cyclePlan = () => {
    const i = PLAN_VOICES.indexOf(voice);
    pickVoice(PLAN_VOICES[(i + 1) % PLAN_VOICES.length]);
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
      whyOpen ||
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
    whyOpen,
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

  const askCoach = useCallback(() => {
    unlockSpeech();
    const beat = scene.beats[beatIndex] ?? scene.beats[0];
    const authored = (beat?.text ?? coach.text).trim();
    const text = textForCoachTap(authored, lastSpokenRef.current);
    if (!tts) {
      setWhyOpen(true);
      return;
    }
    if (!text && scene.beats.length === 0) {
      setWhyOpen(true);
      return;
    }
    speechRef.current?.stop();
    const handle =
      scene.beats.length > 0
        ? speakDialogue(scene.beats, {
            premium: false,
            onBeat: (index, next) => {
              setBeatIndex(index);
              setAsk(next.ask ?? null);
              setAskPicked(null);
              const spoken = next.text.replace(/\s+/g, " ").trim();
              if (spoken) lastSpokenRef.current = spoken;
            },
            waitForAsk: () =>
              new Promise((resolve) => {
                askWaitRef.current = (id) => {
                  askWaitRef.current = null;
                  resolve(id);
                };
                window.setTimeout(() => {
                  if (askWaitRef.current) askWaitRef.current(null);
                }, 14_000);
              }),
          })
        : speak(text ?? "");
    speechRef.current = handle;
    setCoachSpeaking(true);
    void handle.done.then(() => {
      if (speechRef.current === handle) setCoachSpeaking(false);
    });
  }, [scene.beats, beatIndex, coach.text, tts]);

  const analyzeLine = useMemo(
    () => [...played, ...opening.moves.slice(ply)],
    [played, opening.moves, ply],
  );
  const coachLine = (scene.beats[beatIndex]?.text ?? coach.text).trim();

  return (
    <div
      className="drill-shell"
      onPointerDown={() => {
        unlockSpeech();
      }}
    >
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
                {root.shortName}
              </h1>
              <p className="shrink-0 font-mono text-[11px] tabular-nums text-zinc-500">
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
            className="text-zinc-300 hover:text-white"
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
            className="text-zinc-300 hover:text-white"
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

        <div
          className={`coach-strip coach-${coach.kind}${
            coachLine ? "" : " coach-quiet"
          }${ask ? " coach-strip-ask" : ""}${
            coachSpeaking ? " coach-speaking" : ""
          }`}
          data-speaking={coachSpeaking ? "on" : "off"}
        >
          <div className="coach-copy">
            {coach.kind === "pin" ? <span className="pin-dot" aria-hidden /> : null}
            {reps === "trial" ? (
              <div className="coach-who">
                <span className="coach-mode-tag">{trialLeft}s</span>
              </div>
            ) : null}
            <p className="coach-line">
              {coachLine || (mode === "plan" ? "Pick a plan" : "Your move")}
            </p>
            {coach.detail &&
            (coach.kind === "fail" || coach.kind === "hint") ? (
              <p className="coach-detail">{coach.detail}</p>
            ) : null}
          </div>
          {ask ? (
            <InlineAsk
              ask={ask}
              picked={askPicked}
              onPick={(id) => {
                setAskPicked(id);
                askWaitRef.current?.(id);
              }}
            />
          ) : null}
          <div className="coach-ask-row">
            <button
              type="button"
              className="ask-coach"
              onClick={askCoach}
              aria-label="Ask Coach"
              title="Ask Aldric to explain this position"
              data-testid="ask-coach"
              data-speaking={coachSpeaking ? "on" : "off"}
            >
              <Volume2 />
              Ask Coach
            </button>
            <button
              type="button"
              className="why-chip"
              onClick={() => setWhyOpen(true)}
              title="Open the Why board"
              aria-label="Open the Why board"
            >
              Why
            </button>
            {mode === "plan" ? (
              <button
                type="button"
                className="plan-cycle"
                onClick={cyclePlan}
                aria-label={`Plan voice ${voice}. Tap to cycle.`}
              >
                {voice}
              </button>
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
        <p className="sr-only" role="status" aria-live="polite">
          {coachLine}
        </p>
      </header>

      <div className="board-stage">
        <div className="board-stack">
          <div className="board-with-history">
            <ChessBoard
              fen={fen}
              dests={dests}
              lastMove={lastMove}
              arrows={arrows}
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setTts((v) => {
              const next = !v;
              writeVoiceOnDefault(next);
              if (next) unlockSpeech();
              return next;
            });
          }}
          className="dock-btn"
          aria-pressed={tts}
          title={tts ? "Mute coach voice" : "Coach voice on when you Ask Coach"}
        >
          {tts ? <Volume2 /> : <VolumeX />}
          {tts ? "Voice" : "Mute"}
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

      {whyOpen ? (
        <WhySplash
          opening={opening}
          lesson={why}
          orientation={orientation}
          voiceOn={tts}
          onClose={() => setWhyOpen(false)}
        />
      ) : null}

      {historyOpen && historyNow.length ? (
        <HistorySplash
          opening={opening}
          milestones={historyNow}
          orientation={orientation}
          voiceOn={tts}
          onClose={() => setHistoryOpen(false)}
        />
      ) : null}

      {analyzeOpen ? (
        <AnalyzeSplash
          opening={opening}
          line={analyzeLine}
          startPly={played.length}
          orientation={orientation}
          onClose={() => setAnalyzeOpen(false)}
        />
      ) : null}

      {quizOpen && quiz ? (
        <QuizSheet
          quiz={quiz}
          opening={opening}
          voiceOn={tts}
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

function prefetchAround(opening: Opening, afterPly: number) {
  const start = Math.max(-1, afterPly);
  for (const ply of [start + 1, start + 2, start + 3, start + 4]) {
    if (ply >= opening.moves.length) continue;
    const scene = dialogueForPly(opening, ply, {
      duo: ACTIVE_COACH,
      mode: "solo",
    });
    if (scene.beats.length) prefetchDialogue(scene.beats);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
