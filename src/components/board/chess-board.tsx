"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Chessground } from "@lichess-org/chessground";
import type { Api } from "@lichess-org/chessground/api";
import type { Key } from "@lichess-org/chessground/types";
import type { DrawBrushes, DrawShape } from "@lichess-org/chessground/draw";
import type { ArrowBrush, MoveGlyph } from "@/lib/openings/types";

export interface BoardArrow {
  orig: Key;
  dest: Key;
  brush: ArrowBrush;
}

export interface BoardGlyph {
  square: Key;
  glyph: MoveGlyph;
}

interface ChessBoardProps {
  fen: string;
  dests: Map<Key, Key[]>;
  lastMove: Key[] | null;
  arrows: BoardArrow[];
  glyphs?: BoardGlyph[];
  circles?: Key[];
  orientation: "white" | "black";
  turnColor: "white" | "black";
  viewOnly?: boolean;
  movableColor: "white" | "black" | "both" | undefined;
  check?: boolean;
  coordinates?: boolean;
  animationMs?: number;
  onMove: (from: Key, to: Key) => void;
  onLongPress?: () => void;
}

const brushes: DrawBrushes = {
  green: { key: "g", color: "#15781B", opacity: 1, lineWidth: 10 },
  red: { key: "r", color: "#882020", opacity: 1, lineWidth: 10 },
  blue: { key: "b", color: "#003088", opacity: 1, lineWidth: 10 },
  yellow: { key: "y", color: "#e68f00", opacity: 1, lineWidth: 10 },
  purple: { key: "p", color: "#7e22ce", opacity: 0.92, lineWidth: 9 },
  last: { key: "last", color: "#0a0a0a", opacity: 0.94, lineWidth: 6 },
  hint: { key: "hint", color: "#7aa2ff", opacity: 0.88, lineWidth: 9 },
};

export function ChessBoard({
  fen,
  dests,
  lastMove,
  arrows,
  glyphs = [],
  circles = [],
  orientation,
  turnColor,
  viewOnly = false,
  movableColor,
  check = false,
  coordinates = true,
  animationMs = 150,
  onMove,
  onLongPress,
}: ChessBoardProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<Api | null>(null);
  const onMoveRef = useRef(onMove);
  const latestRef = useRef({
    fen,
    dests,
    lastMove,
    arrows,
    circles,
    orientation,
    turnColor,
    viewOnly,
    movableColor,
    check,
    coordinates,
    animationMs,
  });
  const [side, setSide] = useState(0);
  const [ready, setReady] = useState(false);
  const sideRef = useRef(0);

  useEffect(() => {
    onMoveRef.current = onMove;
    latestRef.current = {
      fen,
      dests,
      lastMove,
      arrows,
      circles,
      orientation,
      turnColor,
      viewOnly,
      movableColor,
      check,
      coordinates,
      animationMs,
    };
  });

  useLayoutEffect(() => {
    const host = hostRef.current;
    const parent = host?.parentElement;
    if (!host || !parent) return;

    const measure = () => {
      const next = Math.max(
        0,
        Math.floor(Math.min(parent.clientWidth, parent.clientHeight)),
      );
      sideRef.current = next;
      setSide(next);
      if (next >= 32) setReady(true);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    measure();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const host = hostRef.current;
    if (!host) return;

    const el = document.createElement("div");
    el.className = "cg-wrap board-cg";
    const px = Math.max(sideRef.current, 32);
    el.style.width = `${px}px`;
    el.style.height = `${px}px`;
    host.replaceChildren(el);

    const latest = latestRef.current;
    const api = Chessground(el, {
      fen: latest.fen,
      orientation: latest.orientation,
      turnColor: latest.turnColor,
      check: latest.check,
      lastMove: latest.lastMove ?? undefined,
      coordinates: latest.coordinates,
      disableContextMenu: true,
      blockTouchScroll: true,
      trustAllEvents: true,
      addPieceZIndex: true,
      jsHover: true,
      addDimensionsCssVarsTo: el,
      animation: { enabled: true, duration: latest.animationMs },
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
        autoShapes: toShapes(latest.arrows, latest.circles),
      },
    });
    apiRef.current = api;

    return () => {
      api.destroy();
      if (apiRef.current === api) apiRef.current = null;
      el.remove();
    };
  }, [ready]);

  useEffect(() => {
    if (!apiRef.current || side < 32) return;
    const wrap = hostRef.current?.querySelector(".cg-wrap") as HTMLElement | null;
    if (!wrap) return;
    wrap.style.width = `${side}px`;
    wrap.style.height = `${side}px`;
    apiRef.current.redrawAll();
  }, [side]);

  useEffect(() => {
    apiRef.current?.set({
      fen,
      orientation,
      turnColor,
      check,
      lastMove: lastMove ?? undefined,
      viewOnly,
      animation: { enabled: true, duration: animationMs },
      movable: {
        color: viewOnly ? undefined : movableColor,
        dests,
      },
      drawable: {
        autoShapes: toShapes(arrows, circles),
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
    circles,
    animationMs,
  ]);

  useEffect(() => {
    if (!onLongPress) return;
    const host = hostRef.current;
    if (!host) return;
    let timer: number | null = null;
    const start = () => {
      timer = window.setTimeout(() => onLongPress(), 420);
    };
    const clear = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = null;
    };
    host.addEventListener("pointerdown", start);
    host.addEventListener("pointerup", clear);
    host.addEventListener("pointercancel", clear);
    host.addEventListener("pointerleave", clear);
    return () => {
      clear();
      host.removeEventListener("pointerdown", start);
      host.removeEventListener("pointerup", clear);
      host.removeEventListener("pointercancel", clear);
      host.removeEventListener("pointerleave", clear);
    };
  }, [onLongPress]);

  return (
    <div
      ref={hostRef}
      className="board-frame"
      style={
        side > 0 ? { width: side, height: side, maxWidth: "none" } : undefined
      }
    >
      {glyphs.map((g) => (
        <span
          key={`${g.square}-${g.glyph}`}
          className={`move-glyph glyph-${glyphClass(g.glyph)}`}
          style={glyphStyle(g.square, orientation)}
          aria-hidden
        >
          {g.glyph}
        </span>
      ))}
    </div>
  );
}

function glyphClass(g: MoveGlyph): string {
  if (g === "!!") return "brilliant";
  if (g === "!") return "good";
  if (g === "!?") return "interesting";
  if (g === "?!") return "dubious";
  if (g === "?") return "mistake";
  return "blunder";
}

function glyphStyle(square: Key, orientation: "white" | "black") {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  const x = orientation === "white" ? file : 7 - file;
  const y = orientation === "white" ? 7 - rank : rank;
  return {
    left: `${(x + 0.68) * 12.5}%`,
    top: `${(y + 0.02) * 12.5}%`,
  };
}

function toShapes(arrows: BoardArrow[], circles: Key[]): DrawShape[] {
  const shapes: DrawShape[] = arrows.map((a) => ({
    orig: a.orig,
    dest: a.dest,
    brush: a.brush,
    modifiers: { lineWidth: a.brush === "last" ? 7 : 10 },
  }));
  for (const sq of circles) {
    shapes.push({ orig: sq, dest: sq, brush: "yellow" });
  }
  return shapes;
}
