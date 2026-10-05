"use client";

import { EvalBar } from "@/components/board/eval-bar";
import { useAnalysis } from "@/components/drill/use-analysis";
import { ENGINE_CHOICES, type AnalysisEngineId } from "@/lib/engines/catalog";
import type { AnalysisPhase } from "@/lib/engines/session";
import type { EvalTick } from "@/lib/engines/types";
import { formatScore } from "@/lib/engines/uci";

const BOARD_DEPTH = 8;

const NAMES: Record<AnalysisEngineId, { short: string; full: string }> = {
  stockfish: { short: "Stockfish", full: "Stockfish" },
  fairy: { short: "Fairy-SF", full: "Fairy-Stockfish" },
  lc0: { short: "Lc0", full: "Lc0" },
};

function phaseWord(phase: AnalysisPhase): string {
  if (phase === "loading") return "Loading";
  if (phase === "searching") return "Searching";
  if (phase === "ready") return "Ready";
  if (phase === "error") return "Unavailable";
  return "Stopped";
}

function EngineRow({
  id,
  fen,
  orientation,
  enabled,
}: {
  id: AnalysisEngineId;
  fen: string;
  orientation: "white" | "black";
  enabled: boolean;
}) {
  const { view, phase } = useAnalysis({
    fen,
    engineId: id,
    depth: BOARD_DEPTH,
    run: enabled,
    nonce: 0,
    enabled,
    owner: `board:${id}`,
    multipv: 1,
  });
  const line = view.lines[0];
  const score = formatScore(line);
  const tick: EvalTick = {
    cp: line?.cp ?? null,
    mate: line?.mate ?? null,
    depth: view.depth,
  };
  const name = NAMES[id];
  const status = line ? phaseWord(phase) : phase === "error" ? "Unavailable" : "Loading";

  return (
    <div className="engine-eval-row" data-testid={`engine-eval-${id}`} data-phase={phase}>
      <span className="engine-eval-name">
        {name.short}
        <span className="engine-eval-phase">{status}</span>
      </span>
      <EvalBar tick={tick} orientation={orientation} layout="horizontal" showLabel={false} />
      <span className="engine-eval-cp" aria-label={`${name.full} evaluation ${score}`}>
        {line ? score : "—"}
      </span>
    </div>
  );
}

export function BoardEngines({
  fen,
  orientation,
  enabled,
}: {
  fen: string;
  orientation: "white" | "black";
  enabled: boolean;
}) {
  return (
    <div className="engine-strip" data-testid="board-engines" aria-label="Engine evaluations">
      {ENGINE_CHOICES.map((engine) => (
        <EngineRow
          key={engine.id}
          id={engine.id}
          fen={fen}
          orientation={orientation}
          enabled={enabled}
        />
      ))}
    </div>
  );
}
