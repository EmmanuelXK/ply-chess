"use client";

import { EvalBar } from "@/components/board/eval-bar";
import { useAnalysis } from "@/components/drill/use-analysis";
import { LIVE_DEPTH } from "@/lib/engines/catalog";
import type { EvalTick } from "@/lib/engines/types";
import { formatScore } from "@/lib/engines/uci";

function ScoreRow({
  name,
  phase,
  tick,
  pending,
  testId,
  orientation,
}: {
  name: string;
  phase: string;
  tick: EvalTick | null;
  pending: boolean;
  testId: string;
  orientation: "white" | "black";
}) {
  const score = pending || !tick ? "—" : formatScore(tick);
  const depth = !pending && tick && tick.depth > 0 ? `d${tick.depth}` : "";
  return (
    <div className="engine-eval-row" data-testid={testId} data-phase={phase}>
      <span className="engine-eval-name">
        {name}
        <span className="engine-eval-phase">{phase}</span>
      </span>
      <EvalBar tick={tick} orientation={orientation} layout="horizontal" showLabel={false} pending={pending} />
      <span className="engine-eval-cp" aria-label={`${name} evaluation ${score}`}>
        {score}
      </span>
      <span className="engine-eval-depth" data-testid={`${testId}-depth`}>
        {depth}
      </span>
    </div>
  );
}

export function BoardEngines({
  fen,
  orientation,
  enabled,
  book,
}: {
  fen: string;
  orientation: "white" | "black";
  enabled: boolean;
  /** Stored book eval for this position, when the board is still on a book line. */
  book: EvalTick | null;
}) {
  const { view, phase } = useAnalysis({
    fen,
    engineId: "stockfish",
    depth: LIVE_DEPTH,
    run: enabled,
    nonce: 0,
    enabled,
    owner: "board:stockfish",
    multipv: 1,
  });
  const line = view.lines[0];
  const live: EvalTick | null = line
    ? {
        cp: line.cp,
        mate: line.mate,
        depth: view.depth,
        best: line.uci[0],
      }
    : null;
  const livePending = !line;
  const livePhase = line ? (phase === "searching" ? "Searching" : "Live") : phase === "error" ? "Unavailable" : "Loading";

  return (
    <div className="engine-strip" data-testid="board-engines" aria-label="Engine evaluations">
      {book ? (
        <ScoreRow
          name="Book"
          phase="book eval"
          tick={book}
          pending={false}
          testId="engine-eval-book"
          orientation={orientation}
        />
      ) : null}
      <ScoreRow
        name="Stockfish"
        phase={livePhase}
        tick={live}
        pending={livePending}
        testId="engine-eval-stockfish"
        orientation={orientation}
      />
    </div>
  );
}
