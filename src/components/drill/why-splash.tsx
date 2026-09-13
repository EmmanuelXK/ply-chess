"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Key } from "@lichess-org/chessground/types";
import { X } from "lucide-react";

import { ChessBoard, type BoardArrow, type BoardGlyph } from "@/components/board/chess-board";
import { PlyNav } from "@/components/drill/ply-nav";
import { playLine } from "@/lib/chess/line";
import { silence, speakDialogue, type SpeakHandle } from "@/lib/chess/speak";
import { SpeakerChip } from "@/components/drill/speaker-chip";
import {
  dialogueForWhy,
  getDuo,
  type DialogueMode,
  type DuoId,
} from "@/lib/dialogue";
import type { Opening, WhyLesson } from "@/lib/openings";

const EMPTY_DESTS = new Map<Key, Key[]>();

export function WhySplash({
  opening,
  lesson,
  orientation,
  duo,
  mode,
  onClose,
}: {
  opening: Opening;
  lesson: WhyLesson;
  orientation: "white" | "black";
  duo: DuoId;
  mode: DialogueMode;
  onClose: () => void;
}) {
  const prefix = useMemo(
    () => opening.moves.slice(0, lesson.startPly),
    [opening.moves, lesson.startPly],
  );
  const line = useMemo(
    () => [...prefix, ...lesson.branch.map((b) => b.san)],
    [prefix, lesson.branch],
  );
  const [ply, setPly] = useState(lesson.startPly);
  const [playing, setPlaying] = useState(true);
  const handleRef = useRef<SpeakHandle | null>(null);

  const pos = useMemo(() => playLine(line, ply), [line, ply]);
  const branchIndex = ply - lesson.startPly;
  const step = branchIndex > 0 ? lesson.branch[branchIndex - 1] : undefined;

  const arrows = useMemo<BoardArrow[]>(() => {
    const next: BoardArrow[] = [];
    if (pos.lastMove) {
      next.push({ orig: pos.lastMove[0], dest: pos.lastMove[1], brush: "last" });
    }
    for (const a of step?.arrows ?? []) {
      next.push({
        orig: a.orig as Key,
        dest: a.dest as Key,
        brush: a.brush,
      });
    }
    return next;
  }, [pos.lastMove, step]);

  const glyphs = useMemo<BoardGlyph[]>(() => {
    if (!step?.glyph || !pos.lastMove) return [];
    return [{ square: pos.lastMove[1], glyph: step.glyph }];
  }, [step, pos.lastMove]);

  const stopVoice = () => {
    handleRef.current?.stop();
    handleRef.current = null;
    silence();
  };

  const go = useCallback(
    (next: number) => {
      setPly(Math.max(0, Math.min(next, line.length)));
    },
    [line.length],
  );

  useEffect(() => {
    stopVoice();
    const text =
      ply === lesson.startPly && branchIndex <= 0
        ? lesson.intro
        : (step?.narrate ?? lesson.intro);
    const scene = dialogueForWhy(opening, lesson, text, { duo, mode });
    handleRef.current = speakDialogue(scene.beats, {
      premium: mode === "dual",
    });
    return () => stopVoice();
    // Narration is ply-driven; step/branch are derived from ply.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ply, lesson.intro, lesson.startPly, duo, mode, opening]);

  useEffect(() => {
    if (!playing || ply >= line.length) return;
    let cancelled = false;
    const run = async () => {
      const handle = handleRef.current;
      if (handle) {
        await Promise.race([
          handle.done,
          new Promise((r) => window.setTimeout(r, 5200)),
        ]);
      } else {
        await new Promise((r) => window.setTimeout(r, 900));
      }
      if (cancelled) return;
      setPly((p) => Math.min(p + 1, line.length));
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [ply, playing, line.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        setPlaying(false);
        go(ply - 1);
      }
      if (e.key === "ArrowRight") {
        setPlaying(false);
        go(ply + 1);
      }
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((on) => !on);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose, ply]);

  return (
    <div className="splash-root" role="dialog" aria-modal="true" aria-label="Why">
      <button type="button" className="splash-scrim" aria-label="Close why" onClick={onClose} />
      <div className="splash-card splash-in">
        <header className="splash-head">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.16em] text-amber-200/80 uppercase">
              Why
            </p>
            <h2 className="truncate text-[17px] font-semibold tracking-tight">
              {lesson.title}
            </h2>
          </div>
          <button type="button" className="study-close" onClick={onClose} aria-label="Close">
            <X className="size-3.5" />
            Close
          </button>
        </header>
        <p className="splash-copy">
          <SpeakerChip
            duoId={duo}
            speaker={
              mode === "dual" && step
                ? getDuo(duo).right.id
                : getDuo(duo).left.id
            }
          />{" "}
          {step?.narrate ?? lesson.intro}
        </p>
        <div className="splash-board">
          <ChessBoard
            fen={pos.fen}
            dests={EMPTY_DESTS}
            lastMove={pos.lastMove}
            arrows={arrows}
            glyphs={glyphs}
            circles={(step?.circles ?? []) as Key[]}
            orientation={orientation}
            turnColor={pos.turnColor}
            viewOnly
            movableColor={undefined}
            check={pos.check}
            coordinates={false}
            animationMs={140}
            onMove={() => {}}
          />
        </div>
        <PlyNav
          canBack={ply > 0}
          canForward={ply < line.length}
          playing={playing && ply < line.length}
          onBack={() => {
            setPlaying(false);
            go(ply - 1);
          }}
          onForward={() => {
            setPlaying(false);
            go(ply + 1);
          }}
          onPlay={() => {
            if (ply >= line.length) {
              go(lesson.startPly);
              setPlaying(true);
              return;
            }
            setPlaying((on) => !on);
          }}
        />
      </div>
    </div>
  );
}
