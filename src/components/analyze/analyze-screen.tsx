"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";
import type { Key } from "@lichess-org/chessground/types";
import { Clipboard, Cpu, FlipVertical2 } from "lucide-react";

import { BoardShell } from "@/components/board/board-shell";
import { ChessBoard, type BoardArrow } from "@/components/board/chess-board";
import { EvalBar } from "@/components/board/eval-bar";
import { HeaderBar } from "@/components/board/header-bar";
import { NavControls } from "@/components/board/nav-controls";
import { EngineMenu } from "@/components/analyze/engine-menu";
import { EvalGraph } from "@/components/analyze/eval-graph";
import { MoveTreeView } from "@/components/analyze/move-tree-view";
import { NotationSheet } from "@/components/analyze/notation-sheet";
import { useAnalysis } from "@/components/drill/use-analysis";
import { Button } from "@/components/ui/button";
import { needsPromotion, toDests } from "@/lib/chess/dests";
import { openingName } from "@/lib/chess/opening-name";
import {
  START_FEN,
  canDelete,
  canPromote,
  canStepBack,
  canStepForward,
  cursorOf,
  deleteNode,
  fenAt,
  jumpTo,
  playUci,
  playUcis,
  promoteNode,
  recordScore,
  sansAlong,
  stepBack,
  stepForward,
  treeFromSans,
  type AnalysisTree,
  type ScoreMark,
} from "@/lib/chess/tree";
import { LIVE_DEPTH } from "@/lib/engines/catalog";
import type { AnalysisLimit } from "@/lib/engines/search";
import type { EvalTick } from "@/lib/engines/types";
import { formatNodes, formatScore, type AnalysisView } from "@/lib/engines/uci";

const PROMO = ["q", "r", "b", "n"] as const;

export function AnalyzeScreen({
  openingId,
  lineId,
  kicker,
  side,
  moves,
  startPly,
  scores,
}: {
  openingId: string | null;
  lineId: string | null;
  kicker: string;
  side: "white" | "black";
  moves: string[];
  startPly: number;
  scores: ScoreMark[];
}) {
  const [tree, setTree] = useState<AnalysisTree>(() =>
    treeFromSans(START_FEN, moves, startPly, scores),
  );
  const [orientation, setOrientation] = useState<"white" | "black">(side);
  const [run, setRun] = useState(true);
  const [nonce, setNonce] = useState(0);
  const [infinite, setInfinite] = useState(true);
  const [depth, setDepth] = useState(20);
  const [movetimeMs, setMovetimeMs] = useState(2500);
  const [showArrow, setShowArrow] = useState(true);
  const [menu, setMenu] = useState<"engine" | "notation" | null>(null);
  const [promotion, setPromotion] = useState<{ from: Key; to: Key } | null>(null);
  const [resync, setResync] = useState(0);

  const limit = useMemo<AnalysisLimit>(
    () => (infinite ? { kind: "infinite" } : { kind: "bounded", depth, movetimeMs }),
    [infinite, depth, movetimeMs],
  );
  const pos = cursorOf(tree);
  const rememberScore = useCallback((next: AnalysisView, fen: string) => {
    const line = next.lines[0];
    if (!line) return;
    if (line.cp == null && (line.mate == null || line.mate === 0)) return;
    setTree((current) => {
      if (fenAt(current) !== fen) return current;
      return recordScore(current, line.cp, line.mate);
    });
  }, []);
  const { view, phase } = useAnalysis({
    fen: pos.fen,
    engineId: "stockfish",
    depth: infinite ? LIVE_DEPTH : depth,
    run,
    nonce,
    enabled: true,
    owner: "analyze:page",
    multipv: 3,
    limit,
    onView: rememberScore,
  });
  const top = view.lines[0];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (menu) {
        if (event.key === "Escape") setMenu(null);
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPromotion(null);
        setTree((current) => stepBack(current));
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setPromotion(null);
        setTree((current) => stepForward(current));
      }
      if (event.key === "f") {
        setOrientation((current) => (current === "white" ? "black" : "white"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const dests = useMemo(() => toDests(new Chess(pos.fen)), [pos.fen]);
  const turnColor = pos.turn === "w" ? "white" : "black";
  const named = useMemo(
    () => openingName(tree.startFen, sansAlong(tree)),
    [tree],
  );
  const heading = named ? `${named.eco} ${named.name}` : "Starting position";
  const tick: EvalTick = {
    cp: top?.cp ?? null,
    mate: top?.mate ?? null,
    depth: view.depth,
    best: top?.uci[0],
  };
  const pending = !top;
  const arrows = useMemo<BoardArrow[]>(() => {
    const uci = showArrow ? top?.uci[0] : undefined;
    if (!uci || uci.length < 4) return [];
    return [
      {
        orig: uci.slice(0, 2) as Key,
        dest: uci.slice(2, 4) as Key,
        brush: "yellow",
      },
    ];
  }, [showArrow, top]);
  const busy = phase === "searching" || phase === "loading";
  const backHref = openingId
    ? `/drill/${openingId}${lineId ? `?trap=${encodeURIComponent(lineId)}` : ""}`
    : "/";

  const playFromBoard = useCallback(
    (from: Key, to: Key) => {
      const chess = new Chess(pos.fen);
      if (needsPromotion(chess, from as Square, to as Square)) {
        setPromotion({ from, to });
        setResync((value) => value + 1);
        return;
      }
      setPromotion(null);
      setTree((current) => playUci(current, `${from}${to}`));
    },
    [pos.fen],
  );

  return (
    <BoardShell
      testId="analyze-screen"
      fen={pos.fen}
      header={
        <HeaderBar
          backHref={backHref}
          backLabel="Back to Learn"
          kicker={kicker}
          title={heading}
          actions={
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Engine"
                aria-expanded={menu === "engine"}
                onClick={() => setMenu("engine")}
              >
                <Cpu />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="PGN and FEN"
                aria-expanded={menu === "notation"}
                onClick={() => setMenu("notation")}
              >
                <Clipboard />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Flip board"
                onClick={() => setOrientation((current) => (current === "white" ? "black" : "white"))}
              >
                <FlipVertical2 />
              </Button>
            </>
          }
        />
      }
      evalBar={
        <EvalBar tick={tick} orientation={orientation} layout="vertical" pending={pending} showLabel={false} />
      }
      wellTestId="best-move-arrow"
      wellArrow={arrows[0] ? `${arrows[0].orig}${arrows[0].dest}` : ""}
      board={
        <>
          <ChessBoard
            fen={pos.fen}
            dests={dests}
            lastMove={pos.lastMove as Key[] | null}
            arrows={arrows}
            orientation={orientation}
            turnColor={turnColor}
            movableColor={turnColor}
            check={pos.check}
            animationMs={90}
            resyncKey={resync}
            onMove={playFromBoard}
          />
          {promotion ? (
            <div className="analyze-promo" role="group" aria-label="Promotion">
              {PROMO.map((piece) => (
                <button
                  key={piece}
                  type="button"
                  onClick={() => {
                    const choice = promotion;
                    setPromotion(null);
                    setTree((current) => playUci(current, `${choice.from}${choice.to}${piece}`));
                  }}
                >
                  {piece.toUpperCase()}
                </button>
              ))}
            </div>
          ) : null}
        </>
      }
      panel={
        <>
        <div className="analyze-status">
          <span data-testid="engine-phase">{phaseLabel(phase)}</span>
          <strong data-testid="engine-depth">{pending ? "d…" : `d${view.depth}`}</strong>
          <span data-testid="engine-score">{pending ? "—" : formatScore(top)}</span>
          <span data-testid="engine-nodes">{formatNodes(view.nodes)}</span>
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

        <ol className="analyze-lines" data-testid="engine-lines">
          {view.lines.length ? (
            view.lines.map((line) => (
              <li key={line.multipv}>
                <button
                  type="button"
                  className="analyze-score"
                  onClick={() => setTree((current) => playUcis(current, line.uci.slice(0, 1)))}
                >
                  <strong>{formatScore(line)}</strong>
                  <em>{line.depth ? `d${line.depth}` : "d…"}</em>
                </button>
                <span className="analyze-sans">
                  {line.san.length ? (
                    line.san.map((san, index) => (
                      <button
                        key={`${line.multipv}-${san}-${index}`}
                        type="button"
                        onClick={() =>
                          setTree((current) => playUcis(current, line.uci.slice(0, index + 1)))
                        }
                      >
                        {san}
                      </button>
                    ))
                  ) : (
                    <span>—</span>
                  )}
                </span>
              </li>
            ))
          ) : (
            <li className="analyze-lines-wait">
              {phase === "error" ? "This browser could not start the engine." : "Waiting for a line"}
            </li>
          )}
        </ol>

        <EvalGraph tree={tree} onJump={(path) => setTree((current) => jumpTo(current, path))} />

        <div className="analyze-edit">
          <button
            type="button"
            disabled={!canPromote(tree)}
            onClick={() => setTree((current) => promoteNode(current, current.path))}
          >
            Main line
          </button>
          <button
            type="button"
            disabled={!canDelete(tree)}
            onClick={() => {
              setPromotion(null);
              setTree((current) => deleteNode(current, current.path));
            }}
          >
            Delete
          </button>
        </div>
        <MoveTreeView
          tree={tree}
          onJump={(path) => {
            setPromotion(null);
            setTree((current) => jumpTo(current, path));
          }}
        />
        </>
      }
      dock={
        <NavControls
          canBack={canStepBack(tree)}
          canForward={canStepForward(tree)}
          lastSan={pos.san ?? "Start"}
          onBack={() => {
            setPromotion(null);
            setTree((current) => stepBack(current));
          }}
          onForward={() => {
            setPromotion(null);
            setTree((current) => stepForward(current));
          }}
        />
      }
      overlays={
        <>
      {menu === "engine" ? (
        <EngineMenu
          infinite={infinite}
          depth={depth}
          movetimeMs={movetimeMs}
          showArrow={showArrow}
          onInfinite={setInfinite}
          onDepth={setDepth}
          onTime={setMovetimeMs}
          onArrow={setShowArrow}
          onClose={() => setMenu(null)}
        />
      ) : null}
      {menu === "notation" ? (
        <NotationSheet
          tree={tree}
          onLoad={(next) => {
            setPromotion(null);
            setTree(next);
            setNonce((current) => current + 1);
          }}
          onClose={() => setMenu(null)}
        />
      ) : null}
        </>
      }
    />
  );
}

function phaseLabel(phase: string): string {
  if (phase === "loading") return "Loading";
  if (phase === "searching") return "Searching";
  if (phase === "ready") return "Ready";
  if (phase === "error") return "Did not start";
  return "Stopped";
}
