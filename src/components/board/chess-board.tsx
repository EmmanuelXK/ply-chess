"use client";

import { useEffect, useRef } from "react";
import type { Api } from "@lichess-org/chessground/api";
import type { Key } from "@lichess-org/chessground/types";
import type { DrawBrushes, DrawShape } from "@lichess-org/chessground/draw";

import "@lichess-org/chessground/assets/chessground.base.css";
import "@lichess-org/chessground/assets/chessground.brown.css";
import "@lichess-org/chessground/assets/chessground.cburnett.css";

export interface BoardArrow {
  orig: Key;
  dest: Key;
  brush: "last" | "hint";
}

interface ChessBoardProps {
  fen: string;
  dests: Map<Key, Key[]>;
  lastMove: Key[] | null;
  arrows: BoardArrow[];
  orientation: "white" | "black";
  turnColor: "white" | "black";
  viewOnly?: boolean;
  movableColor: "white" | "black" | "both" | undefined;
  check?: boolean;
  onMove: (from: Key, to: Key) => void;
}

const brushes: DrawBrushes = {
  green: { key: "g", color: "#15781B", opacity: 1, lineWidth: 10 },
  red: { key: "r", color: "#882020", opacity: 1, lineWidth: 10 },
  blue: { key: "b", color: "#003088", opacity: 1, lineWidth: 10 },
  yellow: { key: "y", color: "#e68f00", opacity: 1, lineWidth: 10 },
  last: { key: "last", color: "#0a0a0a", opacity: 0.94, lineWidth: 6 },
  hint: { key: "hint", color: "#7aa2ff", opacity: 0.88, lineWidth: 9 },
};

export function ChessBoard({
  fen,
  dests,
  lastMove,
  arrows,
  orientation,
  turnColor,
  viewOnly = false,
  movableColor,
  check = false,
  onMove,
}: ChessBoardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<Api | null>(null);
  const onMoveRef = useRef(onMove);
  const latestRef = useRef({
    fen,
    dests,
    lastMove,
    arrows,
    orientation,
    turnColor,
    viewOnly,
    movableColor,
    check,
  });

  useEffect(() => {
    onMoveRef.current = onMove;
    latestRef.current = {
      fen,
      dests,
      lastMove,
      arrows,
      orientation,
      turnColor,
      viewOnly,
      movableColor,
      check,
    };
  });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let alive = true;
    let api: Api | undefined;

    void import("@lichess-org/chessground").then(({ Chessground }) => {
      if (!alive || !wrapRef.current) return;
      const latest = latestRef.current;
      api = Chessground(wrapRef.current, {
        fen: latest.fen,
        orientation: latest.orientation,
        turnColor: latest.turnColor,
        check: latest.check,
        lastMove: latest.lastMove ?? undefined,
        coordinates: true,
        disableContextMenu: true,
        blockTouchScroll: true,
        trustAllEvents: true,
        addPieceZIndex: true,
        animation: { enabled: true, duration: 200 },
        draggable: {
          enabled: true,
          showGhost: true,
          autoDistance: true,
          distance: 0,
        },
        selectable: { enabled: true },
        highlight: { lastMove: true, check: true },
        movable: {
          free: false,
          color: latest.viewOnly ? undefined : latest.movableColor,
          dests: latest.dests,
          showDests: true,
          rookCastle: true,
          events: {
            after: (orig, dest) => onMoveRef.current(orig, dest),
          },
        },
        premovable: { enabled: false },
        predroppable: { enabled: false },
        drawable: {
          enabled: false,
          visible: true,
          brushes,
          autoShapes: toShapes(latest.arrows),
        },
      });
      apiRef.current = api;
    });

    return () => {
      alive = false;
      api?.destroy();
      apiRef.current?.destroy();
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    apiRef.current?.set({
      fen,
      orientation,
      turnColor,
      check,
      lastMove: lastMove ?? undefined,
      viewOnly,
      movable: {
        color: viewOnly ? undefined : movableColor,
        dests,
      },
      drawable: {
        autoShapes: toShapes(arrows),
      },
    });
  }, [
    fen,
    orientation,
    turnColor,
    check,
    lastMove,
    viewOnly,
    movableColor,
    dests,
    arrows,
  ]);

  return (
    <div className="board-frame">
      <div ref={wrapRef} className="cg-wrap board-cg" />
    </div>
  );
}

function toShapes(arrows: BoardArrow[]): DrawShape[] {
  return arrows.map((a) => ({
    orig: a.orig,
    dest: a.dest,
    brush: a.brush,
    modifiers: { lineWidth: a.brush === "last" ? 7 : 10 },
  }));
}
