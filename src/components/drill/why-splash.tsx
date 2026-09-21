"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Key } from "@lichess-org/chessground/types";
import { X } from "lucide-react";

import { ChessBoard, type BoardArrow, type BoardGlyph } from "@/components/board/chess-board";
import { PlyNav } from "@/components/drill/ply-nav";
import { playLine } from "@/lib/chess/line";
import { CoachQuestions } from "@/components/drill/coach-questions";
import { chunkAt, housePicture, theoryAt } from "@/lib/openings";
import type { Opening, WhyLesson } from "@/lib/openings";

const EMPTY_DESTS = new Map<Key, Key[]>();

export function WhySplash({
  opening,
  lesson,
  orientation,
  onClose,
}: {
  opening: Opening;
  lesson: WhyLesson;
  orientation: "white" | "black";
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

  const pos = useMemo(() => playLine(line, ply), [line, ply]);
  const branchIndex = ply - lesson.startPly;
  const step = branchIndex > 0 ? lesson.branch[branchIndex - 1] : undefined;
  const house = chunkAt(opening, Math.max(0, lesson.startPly - 1));
  const picture = housePicture(house);
  const theory = useMemo(
    () => theoryAt(opening, Math.max(-1, lesson.startPly - 1)),
    [opening, lesson.startPly],
  );
  const idea = theory.idea || lesson.intro || picture;
  const reason = theory.reason;
  const plyNote = step?.narrate;

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

  const go = useCallback(
    (next: number) => {
      setPly(Math.max(0, Math.min(next, line.length)));
    },
    [line.length],
  );

  useEffect(() => {
    if (!playing || ply >= line.length) return;
    let cancelled = false;
    const run = async () => {
      await new Promise((r) => window.setTimeout(r, 900));
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
    <div className="splash-root" role="dialog" aria-modal="true" aria-label="Why" data-testid="why-splash">
      <button type="button" className="splash-scrim" aria-label="Close why" onClick={onClose} />
      <div className="splash-card splash-in">
        <header className="splash-head">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.16em] text-[var(--ember)] uppercase">
              Why{house ? ` · ${house.name}` : ""}
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
        <p className="splash-kicker">Idea</p>
        <p className="splash-picture">{idea}</p>
        <p className="splash-kicker">Reason</p>
        <p className="splash-copy">{reason}</p>
        <CoachQuestions
          plan={theory.plan}
          theyMoved={theory.theyMoved}
          secondBest={theory.secondBest}
          triad={theory.triad}
        />
        {plyNote && plyNote !== idea && plyNote !== reason ? (
          <p className="splash-copy splash-ply-note">{plyNote}</p>
        ) : null}
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
            animationMs={90}
            onMove={() => {}}
          />
        </div>
        <PlyNav
          canBack={ply > 0}
          canForward={ply < line.length}
          lastSan={ply > 0 ? line[ply - 1] : "Start"}
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
