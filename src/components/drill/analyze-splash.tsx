"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { EvalBar } from "@/components/board/eval-bar";
import { useAnalysis } from "@/components/drill/use-analysis";
import { PlyNav } from "@/components/drill/ply-nav";
import { SplashBoard } from "@/components/drill/splash-board";
import { playLine } from "@/lib/chess/line";
import { LIVE_DEPTH } from "@/lib/engines/catalog";
import type { EvalTick } from "@/lib/engines/types";
import { formatNodes, formatScore } from "@/lib/engines/uci";

function phaseCopy(phase: string): string {
  if (phase === "loading") return "Loading";
  if (phase === "searching") return "Searching";
  if (phase === "ready") return "Ready";
  if (phase === "error") return "Did not start";
  return "Stopped";
}

export function AnalyzeSplash({
  line,
  startPly,
  orientation,
  onClose,
}: {
  line: string[];
  startPly: number;
  orientation: "white" | "black";
  onClose: () => void;
}) {
  const [ply, setPly] = useState(() => Math.max(0, Math.min(startPly, line.length)));
  const [playing, setPlaying] = useState(false);
  const [run, setRun] = useState(true);
  const [nonce, setNonce] = useState(0);

  const pos = useMemo(() => playLine(line, ply), [line, ply]);
  const { view, phase } = useAnalysis({
    fen: pos.fen,
    engineId: "stockfish",
    depth: LIVE_DEPTH,
    run,
    nonce,
    enabled: true,
  });
  const autoplaying = playing && ply < line.length;
  const busy = phase === "searching" || phase === "loading";

  useEffect(() => {
    if (!autoplaying) return;
    const timer = window.setTimeout(() => {
      setPly((current) => Math.min(current + 1, line.length));
    }, 260);
    return () => window.clearTimeout(timer);
  }, [autoplaying, ply, line.length]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") {
        setPlaying(false);
        setPly((current) => Math.max(0, current - 1));
      }
      if (event.key === "ArrowRight") {
        setPlaying(false);
        setPly((current) => Math.min(line.length, current + 1));
      }
      if (event.key === " ") {
        event.preventDefault();
        setPlaying((on) => !on);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, line.length]);

  const tick: EvalTick = {
    cp: view.lines[0]?.cp ?? null,
    mate: view.lines[0]?.mate ?? null,
    depth: view.depth,
    best: view.lines[0]?.uci[0],
  };

  const pending = !view.lines.length;
  const depthLabel = pending ? "…" : `d${view.depth}`;

  return (
    <div className="splash-root" role="dialog" aria-modal="true" aria-label="Analyze">
      <button type="button" className="splash-scrim" aria-label="Close analyze" onClick={onClose} />
      <div className="splash-card splash-in analyze-card" data-testid="analyze-panel" data-fen={pos.fen}>
        <header className="splash-head">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.16em] text-[var(--ember)] uppercase">
              Analyze
            </p>
            <h2 className="truncate text-[17px] font-semibold tracking-tight">This position</h2>
          </div>
          <button type="button" className="study-close" onClick={onClose} aria-label="Close">
            <X className="size-3.5" />
            Close
          </button>
        </header>

        <p className="engine-warn">Stockfish 17.1. Live search, about 2.5s or depth 20.</p>

        <div className="analyze-stage" data-testid="eval-bar">
          <div className="analyze-eval-col">
            <EvalBar tick={tick} orientation={orientation} layout="vertical" pending={pending} />
            <span className="engine-eval-depth" data-testid="eval-depth-beside">
              {depthLabel}
            </span>
          </div>
          <div className="analyze-board">
            <SplashBoard
              fen={pos.fen}
              lastMove={pos.lastMove}
              orientation={orientation}
              turnColor={pos.turnColor}
              check={pos.check}
              animationMs={90}
            />
          </div>
        </div>
        <div className="analyze-eval-h">
          <EvalBar tick={tick} orientation={orientation} layout="horizontal" pending={pending} />
          <span className="engine-eval-depth">{depthLabel}</span>
        </div>

        <div className="engine-meta">
          <span data-testid="engine-phase">{phaseCopy(phase)}</span>
          <span data-testid="engine-depth">{depthLabel}</span>
          <span data-testid="engine-nodes">{formatNodes(view.nodes)} nodes</span>
          <button
            type="button"
            className="engine-go"
            data-testid="engine-go"
            onClick={() => {
              if (busy) {
                setRun(false);
                return;
              }
              setRun(true);
              setNonce((current) => current + 1);
            }}
          >
            {busy ? "Stop" : "Go"}
          </button>
        </div>

        <ol className="engine-lines" data-testid="engine-lines">
          {view.lines.length ? (
            view.lines.map((row) => (
              <li key={row.multipv}>
                <span>{formatScore(row)}</span>
                <strong>{row.san.join(" ") || "—"}</strong>
              </li>
            ))
          ) : (
            <li>
              <span>—</span>
              <strong>{phase === "error" ? "This browser could not start the engine." : "Waiting for a line"}</strong>
            </li>
          )}
        </ol>

        <PlyNav
          canBack={ply > 0}
          canForward={ply < line.length}
          lastSan={ply > 0 ? line[ply - 1] : "Start"}
          playing={autoplaying}
          onBack={() => {
            setPlaying(false);
            setPly((current) => Math.max(0, current - 1));
          }}
          onForward={() => {
            setPlaying(false);
            setPly((current) => Math.min(line.length, current + 1));
          }}
          onPlay={() => {
            if (ply >= line.length) {
              setPly(0);
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
