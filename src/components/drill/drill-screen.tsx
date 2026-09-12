"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Chess } from "chess.js";
import type { Key } from "@lichess-org/chessground/types";
import {
  BookOpen,
  ChevronLeft,
  FlipVertical2,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  ScanSearch,
  Volume2,
  VolumeX,
} from "lucide-react";

import { ChessBoard, type BoardArrow } from "@/components/board/chess-board";
import { Button } from "@/components/ui/button";
import { AnalyzeSplash } from "@/components/drill/analyze-splash";
import { ChatHeads } from "@/components/drill/chat-heads";
import { HistoryMark } from "@/components/drill/history-mark";
import { HistorySplash } from "@/components/drill/history-splash";
import { InlineAsk } from "@/components/drill/inline-ask";
import { PlyNav } from "@/components/drill/ply-nav";
import { PracticePanel } from "@/components/drill/practice-panel";
import { QuizSheet } from "@/components/drill/quiz-sheet";
import { SpeakerChip } from "@/components/drill/speaker-chip";
import { StudySheet } from "@/components/drill/study-sheet";
import { WhySplash } from "@/components/drill/why-splash";
import { needsPromotion, toDests } from "@/lib/chess/dests";
import { playLine } from "@/lib/chess/line";
import {
  silence,
  speakDialogue,
  unlockSpeech,
  type SpeakHandle,
} from "@/lib/chess/speak";
import {
  DEFAULT_DUO,
  dialogueForPly,
  dialogueForStart,
  readStoredDuo,
  readStoredLesson,
  readStoredMode,
  type DialogueAsk,
  type DialogueMode,
  type DialogueScene,
  type DuoId,
  type LessonStyle,
  type MissMemory,
} from "@/lib/dialogue";
import { readVoiceOnDefault } from "@/lib/tts/prefs";
import {
  coachAfterPly,
  coachAtStart,
  coachOnFail,
  coachOnHint,
  coachOnPlan,
  type CoachKind,
  type CoachState,
} from "@/lib/openings/coach";
import {
  isUserPly,
  openingFromTrap,
  quizForPly,
  REPS_MODES,
  whyLessonAt,
  historyAt,
  type Opening,
  type PlanVoice,
  type RepsMode,
  type Trap,
} from "@/lib/openings";
import type { Square } from "chess.js";

const OPPONENT_MS = 280;

export function DrillScreen({
  opening: root,
  initialReps = "spine",
  initialTrap = null,
}: {
  opening: Opening;
  initialReps?: RepsMode;
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
  const [tts, setTts] = useState(false);
  const [lessonStyle, setLessonStyle] = useState<LessonStyle>("teach");
  const [podcastPlaying, setPodcastPlaying] = useState(false);
  const [misses, setMisses] = useState<MissMemory[]>([]);
  const [busy, setBusy] = useState(false);
  const [check, setCheck] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(initialReps === "quiz");
  const [thinkOpen, setThinkOpen] = useState(initialReps === "think");
  const [reps, setReps] = useState<RepsMode>(initialReps);
  const [duo, setDuo] = useState<DuoId>(DEFAULT_DUO);
  const [dialogueMode, setDialogueMode] = useState<DialogueMode>("dual");
  const [scene, setScene] = useState<DialogueScene>(() =>
    dialogueForStart(opening, { duo: DEFAULT_DUO, mode: "dual" }),
  );
  const [beatIndex, setBeatIndex] = useState(0);
  const [ask, setAsk] = useState<DialogueAsk | null>(null);
  const [askPicked, setAskPicked] = useState<string | null>(null);
  const duoRef = useRef(duo);
  const modeRefDialogue = useRef(dialogueMode);
  const lessonRef = useRef(lessonStyle);
  const missesRef = useRef<MissMemory[]>([]);
  const askWaitRef = useRef<((id: string | null) => void) | null>(null);
  const speechRef = useRef<SpeakHandle | null>(null);

  useEffect(() => {
    const storedDuo = readStoredDuo();
    const storedMode = readStoredMode();
    const storedLesson = readStoredLesson();
    setDuo(storedDuo);
    setDialogueMode(storedMode);
    setLessonStyle(storedLesson);
    setPodcastPlaying(storedLesson === "podcast");
    setTts(readVoiceOnDefault());
    duoRef.current = storedDuo;
    modeRefDialogue.current = storedMode;
    lessonRef.current = storedLesson;
  }, []);

  useEffect(() => {
    duoRef.current = duo;
  }, [duo]);
  useEffect(() => {
    modeRefDialogue.current = dialogueMode;
  }, [dialogueMode]);
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
  }, []);

  const pushScene = useCallback(
    (next: CoachState, afterPly: number, kind?: CoachKind) => {
      setCoach(next);
      const nextScene =
        afterPly < 0
          ? dialogueForStart(opening, {
              duo: duoRef.current,
              mode: modeRefDialogue.current,
              soloText: next.text,
              misses: missesRef.current,
            })
          : dialogueForPly(opening, afterPly, {
              duo: duoRef.current,
              mode: modeRefDialogue.current,
              kind: kind ?? next.kind,
              fen: gameRef.current.fen(),
              soloText: next.text,
              misses: missesRef.current,
            });
      setScene(nextScene);
      setBeatIndex(0);
      setAsk(null);
      setAskPicked(null);
    },
    [opening],
  );

  const applyPly = useCallback(
    (nextPly: number) => {
      const capped = Math.max(0, Math.min(nextPly, opening.moves.length));
      const pos = playLine(opening.moves, capped);
      gameRef.current = pos.chess;
      plyRef.current = capped;
      modeRef.current = capped >= opening.moves.length ? "plan" : "drill";
      setLastMove(pos.lastMove);
      setHintKeys(null);
      setHintUsed(false);
      if (capped === 0) pushScene(coachAtStart(opening), -1, "start");
      else if (capped >= opening.moves.length) {
        pushScene(
          {
            text: "Book done. Pick a plan.",
            chunkName: "Plan mode",
            kind: "plan",
          },
          opening.moves.length - 1,
          "plan",
        );
      } else {
        pushScene(coachAfterPly(opening, capped - 1), capped - 1);
      }
      sync();
    },
    [opening, pushScene, sync],
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
    gameRef.current = new Chess();
    plyRef.current = 0;
    modeRef.current = "drill";
    lockRef.current = false;
    setFen(gameRef.current.fen());
    setPly(0);
    setPlayed([]);
    setLastMove(null);
    setOrientation(opening.side);
    setMode("drill");
    pushScene(coachAtStart(opening), -1, "start");
    setHintKeys(null);
    setHintUsed(false);
    setVoice("aggressive");
    setBusy(false);
    setCheck(false);
    setMisses([]);
    missesRef.current = [];
    setBookOpen(initialReps === "traps");
    setQuizOpen(initialReps === "quiz");
    setThinkOpen(initialReps === "think");
    if (lessonRef.current === "podcast") setPodcastPlaying(true);

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
        await sleep(plyRef.current === 0 ? 280 : OPPONENT_MS);
        if (cancelled) return;
        const move = playSan(opening.moves[plyRef.current]);
        if (move) pushScene(coachAfterPly(opening, plyRef.current - 1), plyRef.current - 1);
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
  }, [opening, playSan, session, initialReps, pushScene]);

  useEffect(() => {
    askWaitRef.current?.(null);
    askWaitRef.current = null;
    speechRef.current?.stop();
    speechRef.current = null;
    if (!tts) {
      silence();
      return;
    }
    const handle = speakDialogue(scene.beats, {
      premium: dialogueMode === "dual",
      onBeat: (index, beat) => {
        setBeatIndex(index);
        setAsk(beat.ask ?? null);
        setAskPicked(null);
      },
      waitForAsk: (beat) =>
        new Promise((resolve) => {
          askWaitRef.current = (id) => {
            askWaitRef.current = null;
            resolve(id);
          };
          window.setTimeout(() => {
            if (askWaitRef.current) {
              askWaitRef.current(null);
            }
          }, 14_000);
        }),
    });
    speechRef.current = handle;
    return () => {
      handle.stop();
      if (speechRef.current === handle) speechRef.current = null;
    };
  }, [scene, tts, dialogueMode]);

  useEffect(() => {
    if (lessonStyle !== "podcast" || !podcastPlaying) return;
    let cancelled = false;
    const run = async () => {
      const handle = speechRef.current;
      if (handle) {
        await Promise.race([
          handle.done,
          new Promise((r) => window.setTimeout(r, tts ? 7200 : 1300)),
        ]);
      } else {
        await new Promise((r) => window.setTimeout(r, tts ? 1600 : 1100));
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
  }, [scene, lessonStyle, podcastPlaying, tts, opening.moves.length, applyPly]);

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
        sync();
        return;
      }
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
        pushScene(
          {
            text: "Book done. Pick a plan.",
            chunkName: "Plan mode",
            kind: "plan",
          },
          opening.moves.length - 1,
          "plan",
        );
        sync();
        return;
      }

      pushScene(coachAfterPly(opening, plyRef.current - 1), plyRef.current - 1);
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
              pushScene(
                {
                  text: "Book done. Pick a plan.",
                  chunkName: "Plan mode",
                  kind: "plan",
                },
                opening.moves.length - 1,
                "plan",
              );
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
    [opening, playSan, pushScene, sync],
  );

  const fullMoves = Math.ceil(opening.moves.length / 2);
  const shownMove = Math.min(Math.ceil(ply / 2), fullMoves);
  const quiz = quizForPly(opening, Math.max(0, ply - 1));
  const why = whyLessonAt(opening, ply);
  const historyNow = historyAt(opening, ply);

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

  const stepBack = () => {
    cancelTimer();
    if (lessonStyle === "podcast") setPodcastPlaying(false);
    applyPly(plyRef.current - 1);
  };

  const stepForward = () => {
    cancelTimer();
    if (lessonStyle === "podcast") setPodcastPlaying(false);
    if (plyRef.current >= opening.moves.length) return;
    applyPly(plyRef.current + 1);
  };

  const switchTrap = (next: Trap | null) => {
    setLineId(next?.id ?? null);
    setBookOpen(false);
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
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-zinc-300 hover:text-white"
            onClick={() => setBookOpen(true)}
            aria-label="Pillars and traps"
          >
            <BookOpen />
          </Button>
        </div>

        <div className="reps-row" role="tablist" aria-label="Reps mode">
          {REPS_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={reps === m.id}
              className={reps === m.id ? "reps-chip reps-chip-on" : "reps-chip"}
              onClick={() => {
                setReps(m.id);
                if (m.id === "traps") setBookOpen(true);
                if (m.id === "quiz") setQuizOpen(true);
                if (m.id === "think") setThinkOpen(true);
                if (m.id === "spine") {
                  setLineId(null);
                  if (lineId) setSession((n) => n + 1);
                }
              }}
            >
              {m.label}
            </button>
          ))}
          <Link href="/settings?focus=duo" className="reps-chip reps-link">
            Masters
          </Link>
        </div>

        <div
          className={`coach-strip coach-${coach.kind} strip-${duo} strip-speaker-${scene.beats[beatIndex]?.speaker ?? scene.speaker}`}
          role="status"
          aria-live="polite"
        >
          {coach.kind === "pin" ? <span className="pin-dot" aria-hidden /> : null}
          <div className="min-w-0 flex-1">
            <div className="coach-who">
              <SpeakerChip
                duoId={duo}
                speaker={scene.beats[beatIndex]?.speaker ?? scene.speaker}
              />
              {lessonStyle === "podcast" ? (
                <span className="coach-mode-tag">Podcast</span>
              ) : null}
            </div>
            <p>{scene.beats[beatIndex]?.text ?? coach.text}</p>
            {(ask ?? scene.beats.find((b) => b.ask)?.ask) ? (
              <InlineAsk
                ask={(ask ?? scene.beats.find((b) => b.ask)?.ask)!}
                picked={askPicked}
                onPick={(id) => {
                  setAskPicked(id);
                  askWaitRef.current?.(id);
                }}
              />
            ) : scene.detail && dialogueMode === "solo" ? (
              <p className="coach-detail">{scene.detail}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="why-chip"
            onClick={() => setWhyOpen(true)}
            disabled={!why}
            title={why ? "Why this move" : "Why unlocks on the next taught ply"}
          >
            Why
          </button>
          {historyNow.length ? (
            <HistoryMark
              glyph={historyNow[0].glyph}
              label={`${historyNow[0].title} (${historyNow[0].year})`}
              onClick={() => setHistoryOpen(true)}
            />
          ) : null}
        </div>
      </header>

      <div className="board-stage">
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
            animationMs={150}
            onMove={onMove}
            onLongPress={() => setAnalyzeOpen(true)}
          />
          {dialogueMode === "dual" ? (
            <ChatHeads
              duoId={duo}
              speaker={scene.beats[beatIndex]?.speaker ?? scene.speaker}
              text={scene.beats[beatIndex]?.text ?? coach.text}
              fen={fen}
              san={opening.moves[Math.max(0, ply - 1)]}
              orientation={orientation}
            />
          ) : null}
          {historyNow.length ? (
            <div className="history-corner">
              <HistoryMark
                glyph={historyNow[0].glyph}
                label={`${historyNow[0].title} (${historyNow[0].year})`}
                onClick={() => setHistoryOpen(true)}
              />
            </div>
          ) : null}
        </div>
      </div>

      <PlyNav
        onBack={stepBack}
        onForward={stepForward}
        canBack={ply > 0}
        canForward={ply < opening.moves.length}
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
          onClick={() => setWhyOpen(true)}
          disabled={!why}
          className="dock-btn"
        >
          <HelpCircle />
          Why
        </Button>
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
          onClick={() => {
            setTts((v) => {
              const next = !v;
              if (next) unlockSpeech();
              return next;
            });
          }}
          className="dock-btn"
          aria-pressed={tts}
        >
          {tts ? <Volume2 /> : <VolumeX />}
          {tts ? "Voice" : "Mute"}
        </Button>
      </footer>

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

      {whyOpen && why ? (
        <WhySplash
          opening={opening}
          lesson={why}
          orientation={orientation}
          duo={duo}
          mode={dialogueMode}
          onClose={() => setWhyOpen(false)}
        />
      ) : null}

      {historyOpen && historyNow.length ? (
        <HistorySplash
          opening={opening}
          milestones={historyNow}
          orientation={orientation}
          duo={duo}
          mode={dialogueMode}
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
          opening={opening}
          duo={duo}
          mode={dialogueMode}
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
