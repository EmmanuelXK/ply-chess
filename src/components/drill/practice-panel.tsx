"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { EvalBar } from "@/components/board/eval-bar";
import { HumanPlan } from "@/components/drill/human-plan";
import { PlyNav } from "@/components/drill/ply-nav";
import { SplashBoard } from "@/components/drill/splash-board";
import { useEngineTick } from "@/components/drill/use-engine-tick";
import { playLine } from "@/lib/chess/line";
import type { Opening } from "@/lib/openings";

export function PracticePanel({
  opening,
  startMoves,
  orientation,
  onClose,
}: {
  opening: Opening;
  startMoves: string[];
  orientation: "white" | "black";
  onClose: () => void;
}) {
  const line = useMemo(
    () => [...startMoves, ...opening.moves.slice(startMoves.length)],
    [opening.moves, startMoves],
  );
  const [ply, setPly] = useState(() => startMoves.length);
  const [playing, setPlaying] = useState(false);
  const pos = useMemo(() => playLine(line, ply), [line, ply]);
  const { tick, advice } = useEngineTick(pos.fen);
  const autoplaying = playing && ply < line.length;

  useEffect(() => {
    if (!autoplaying) return;
    let cancelled = false;
    const t = window.setTimeout(() => {
      if (cancelled) return;
      setPly((p) => Math.min(p + 1, line.length));
    }, 480);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [autoplaying, ply, line.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="splash-root" role="dialog" aria-modal="true" aria-label="Think">
      <button type="button" className="splash-scrim" aria-label="Close think" onClick={onClose} />
      <div className="splash-card splash-in analyze-card">
        <header className="splash-head">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.16em] text-emerald-200/80 uppercase">
              Think
            </p>
            <h2 className="truncate text-[17px] font-semibold tracking-tight">
              Think like a human
            </h2>
          </div>
          <button type="button" className="study-close" onClick={onClose} aria-label="Close">
            <X className="size-3.5" />
            Close
          </button>
        </header>
        <p className="splash-copy">
          Stockfish finds the number. Lc0-style and Maia-style vote the practical plan.
        </p>
        <div className="analyze-stage">
          <EvalBar tick={tick} orientation={orientation} layout="vertical" />
          <div className="analyze-board">
            <SplashBoard
              fen={pos.fen}
              lastMove={pos.lastMove}
              orientation={orientation}
              turnColor={pos.turnColor}
              check={pos.check}
              animationMs={140}
            />
          </div>
        </div>
        <div className="analyze-eval-h">
          <EvalBar tick={tick} orientation={orientation} layout="horizontal" />
        </div>
        <PlyNav
          canBack={ply > 0}
          canForward={ply < line.length}
          playing={autoplaying}
          onBack={() => {
            setPlaying(false);
            setPly((p) => Math.max(0, p - 1));
          }}
          onForward={() => {
            setPlaying(false);
            setPly((p) => Math.min(line.length, p + 1));
          }}
          onPlay={() => {
            if (ply >= line.length) {
              setPly(Math.min(startMoves.length, line.length));
              setPlaying(true);
              return;
            }
            setPlaying((on) => !on);
          }}
        />
        <HumanPlan advice={advice} />
      </div>
    </div>
  );
}
