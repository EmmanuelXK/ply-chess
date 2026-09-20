"use client";

import { useEffect, useRef, useState } from "react";
import { Chessground } from "@lichess-org/chessground";
import type { Api } from "@lichess-org/chessground/api";
import type { Key } from "@lichess-org/chessground/types";
import type { DrawBrushes, DrawShape } from "@lichess-org/chessground/draw";

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
  const hostRef = useRef<HTMLDivElement>(null);
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
  const [side, setSide] = useState(0);

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
    const host = hostRef.current;
    const parent = host?.parentElement;
    if (!host || !parent) return;

    const measure = () => {
      const next = Math.max(
        0,
        Math.floor(Math.min(parent.clientWidth, parent.clientHeight)),
      );
      setSide(next);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    measure();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || side < 32) return;

    const el = document.createElement("div");
    el.className = "cg-wrap board-cg";
    el.style.width = `${side}px`;
    el.style.height = `${side}px`;
    host.replaceChildren(el);

    const latest = latestRef.current;
    const api = Chessground(el, {
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
      jsHover: true,
      addDimensionsCssVarsTo: el,
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

    return () => {
      api.destroy();
      if (apiRef.current === api) apiRef.current = null;
      el.remove();
    };
  }, [side]);

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
    <div
      ref={hostRef}
      className="board-frame"
      style={
        side > 0
          ? { width: side, height: side, maxWidth: "none" }
          : undefined
      }
    />
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
