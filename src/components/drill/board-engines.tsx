"use client";

import { createContext, useContext, type ReactNode } from "react";

import { EvalBar } from "@/components/board/eval-bar";
import { useAnalysis } from "@/components/drill/use-analysis";
import { LIVE_DEPTH } from "@/lib/engines/catalog";
import type { EvalTick } from "@/lib/engines/types";
import { formatScore } from "@/lib/engines/uci";

interface BoardScores {
  tick: EvalTick | null;
  pending: boolean;
  bookText: string;
  bookDepth: string;
  sfText: string;
  sfDepth: string;
  sfPhase: string;
}

const BoardScoreContext = createContext<BoardScores | null>(null);

function known(tick: EvalTick | null): boolean {
  return !!tick && (tick.cp != null || (tick.mate != null && tick.mate !== 0));
}

function scoreText(tick: EvalTick | null): string {
  if (!known(tick) || !tick) return "—";
  return formatScore(tick);
}

function depthText(tick: EvalTick | null): string {
  if (!known(tick) || !tick || tick.depth <= 0) return "";
  return `d${tick.depth}`;
}

export function BoardEngines({
  fen,
  enabled,
  book,
  children,
}: {
  fen: string;
  enabled: boolean;
  /** Stored book eval for this position, when the board is still on a book line. */
  book: EvalTick | null;
  children: ReactNode;
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
  const shown = known(live) ? live : book;
  const scores: BoardScores = {
    tick: shown,
    pending: !known(shown),
    bookText: scoreText(book),
    bookDepth: depthText(book),
    sfText: scoreText(live),
    sfDepth: depthText(live),
    sfPhase: known(live)
      ? phase === "searching"
        ? "Searching"
        : "Live"
      : phase === "error"
        ? "Unavailable"
        : "Loading",
  };

  return <BoardScoreContext.Provider value={scores}>{children}</BoardScoreContext.Provider>;
}

function useBoardScores(): BoardScores {
  const scores = useContext(BoardScoreContext);
  if (!scores) {
    return {
      tick: null,
      pending: true,
      bookText: "—",
      bookDepth: "",
      sfText: "—",
      sfDepth: "",
      sfPhase: "Loading",
    };
  }
  return scores;
}

/** Vertical bar: the book score shows at once, then the live search replaces it. */
export function BoardEvalBar({ orientation }: { orientation: "white" | "black" }) {
  const { tick, pending } = useBoardScores();
  return (
    <EvalBar
      tick={tick}
      orientation={orientation}
      layout="vertical"
      showLabel={false}
      pending={pending}
    />
  );
}

export function BoardEvalReadout() {
  const scores = useBoardScores();
  return (
    <p className="eval-readout" data-testid="board-engines" aria-label="Engine evaluations">
      <span data-testid="engine-eval-book" data-phase="book eval">
        Book {scores.bookText}
        {scores.bookDepth ? " " : ""}
        <span data-testid="engine-eval-book-depth">{scores.bookDepth}</span>
      </span>
      <span aria-hidden> · </span>
      <span data-testid="engine-eval-stockfish" data-phase={scores.sfPhase}>
        SF {scores.sfText}
        {scores.sfDepth ? " " : ""}
        <span data-testid="engine-eval-stockfish-depth">{scores.sfDepth}</span>
      </span>
    </p>
  );
}
