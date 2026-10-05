"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";

import { EvalBar } from "@/components/board/eval-bar";
import { useAnalysis } from "@/components/drill/use-analysis";
import { PlyNav } from "@/components/drill/ply-nav";
import { SplashBoard } from "@/components/drill/splash-board";
import { playLine } from "@/lib/chess/line";
import {
  ENGINE_CHOICES,
  ENGINE_DEPTHS,
  type AnalysisEngineId,
  type EngineDepth,
} from "@/lib/engines/catalog";
import {
  ENGINE_PREF_EVENT,
  readEngineChoice,
  readEngineDepth,
  writeEngineChoice,
  writeEngineDepth,
} from "@/lib/engines/preference";
import type { EvalTick } from "@/lib/engines/types";
import { formatNodes, formatScore } from "@/lib/engines/uci";

function subscribePrefs(onStoreChange: () => void): () => void {
  window.addEventListener(ENGINE_PREF_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(ENGINE_PREF_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function phaseCopy(phase: string, engineId: AnalysisEngineId): string {
  if (phase === "loading") return engineId === "lc0" ? "Loading network" : "Loading";
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
  const engineId = useSyncExternalStore(
    subscribePrefs,
    () => readEngineChoice(window.localStorage),
    () => "stockfish" as const,
  );
  const depth = useSyncExternalStore(
    subscribePrefs,
    () => readEngineDepth(window.localStorage),
    () => 12 as const,
  );
  const [run, setRun] = useState(true);
  const [nonce, setNonce] = useState(0);

  const pos = useMemo(() => playLine(line, ply), [line, ply]);
  const { view, phase } = useAnalysis({
    fen: pos.fen,
    engineId,
    depth,
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

  const chooseEngine = (id: AnalysisEngineId) => {
    writeEngineChoice(window.localStorage, id);
    setRun(true);
    setNonce((current) => current + 1);
  };

  const chooseDepth = (next: EngineDepth) => {
    writeEngineDepth(window.localStorage, next);
    setRun(true);
    setNonce((current) => current + 1);
  };

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

        <div className="engine-picker" role="radiogroup" aria-label="Engine" data-testid="engine-picker">
          {ENGINE_CHOICES.map((engine) => (
            <button
              key={engine.id}
              type="button"
              role="radio"
              aria-checked={engineId === engine.id}
              className={engineId === engine.id ? "engine-choice engine-choice-on" : "engine-choice"}
              onClick={() => chooseEngine(engine.id)}
            >
              <strong>{engine.label}</strong>
              <em>{engine.blurb}</em>
            </button>
          ))}
        </div>
        {engineId === "lc0" ? (
          <p className="engine-warn">Lc0 loads a 22 MB network only after you choose it.</p>
        ) : null}

        <div className="analyze-stage" data-testid="eval-bar">
          <EvalBar tick={tick} orientation={orientation} layout="vertical" />
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
          <EvalBar tick={tick} orientation={orientation} layout="horizontal" />
        </div>

        <div className="engine-meta">
          <span data-testid="engine-phase">{phaseCopy(phase, engineId)}</span>
          <span data-testid="engine-depth">d{view.depth || "–"}</span>
          <span data-testid="engine-nodes">{formatNodes(view.nodes)} nodes</span>
          <div className="engine-depths" role="group" aria-label="Depth">
            {ENGINE_DEPTHS.map((stop) => (
              <button
                key={stop}
                type="button"
                className={depth === stop ? "engine-depth engine-depth-on" : "engine-depth"}
                onClick={() => chooseDepth(stop)}
                aria-pressed={depth === stop}
              >
                {stop}
              </button>
            ))}
          </div>
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
