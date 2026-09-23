"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Chessground } from "@lichess-org/chessground";
import "@/app/chessground.css";
import type { Api } from "@lichess-org/chessground/api";
import type { Key } from "@lichess-org/chessground/types";
import type { DrawBrushes, DrawShape } from "@lichess-org/chessground/draw";
import type { MoveMark } from "@/lib/openings/move-mark";
import { MOVE_MARK_LABEL } from "@/lib/openings/move-mark";
import type { ArrowBrush, MoveGlyph } from "@/lib/openings/types";
import {
  clearChessgroundTransients,
  dropStuckFadingPieces,
} from "@/lib/chess/clear-transients";

export interface BoardArrow {
  orig: Key;
  dest: Key;
  brush: ArrowBrush;
}

export interface BoardGlyph {
  square: Key;
  glyph: MoveGlyph;
}

export interface BoardMark {
  square: Key;
  kind: MoveMark;
}

interface ChessBoardProps {
  fen: string;
  dests: Map<Key, Key[]>;
  lastMove: Key[] | null;
  arrows: BoardArrow[];
  glyphs?: BoardGlyph[];
  circles?: Key[];
  mark?: BoardMark | null;
  orientation: "white" | "black";
  turnColor: "white" | "black";
  viewOnly?: boolean;
  movableColor: "white" | "black" | "both" | undefined;
  check?: boolean;
  coordinates?: boolean;
  animationMs?: number;
  resyncKey?: number;
  onMove: (from: Key, to: Key) => void;
  onLongPress?: () => void;
}

const brushes: DrawBrushes = {
  green: { key: "g", color: "#1f8a4c", opacity: 0.96, lineWidth: 14 },
  red: { key: "r", color: "#882020", opacity: 1, lineWidth: 12 },
  blue: { key: "b", color: "#2a6294", opacity: 0.95, lineWidth: 13 },
  yellow: { key: "y", color: "#e4b15a", opacity: 1, lineWidth: 15 },
  purple: { key: "p", color: "#7e22ce", opacity: 0.92, lineWidth: 11 },
  last: { key: "last", color: "#e39b2d", opacity: 0.98, lineWidth: 13 },
  hint: { key: "hint", color: "#e39b2d", opacity: 0.95, lineWidth: 14 },
};

export function ChessBoard({
  fen,
  dests,
  lastMove,
  arrows,
  glyphs = [],
  circles = [],
  mark = null,
  orientation,
  turnColor,
  viewOnly = false,
  movableColor,
  check = false,
  coordinates = true,
  animationMs = 90,
  resyncKey = 0,
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
    resyncKey,
  });
  const [side, setSide] = useState(0);
  const [ready, setReady] = useState(false);
  const sideRef = useRef(0);
  const resyncSeenRef = useRef(resyncKey);

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
      resyncKey,
    };
  });

  useLayoutEffect(() => {
    const host = hostRef.current;
    const parent = host?.parentElement;
    if (!host || !parent) return;

    const well =
      parent.closest(".board-with-history") ??
      parent.closest(".splash-board") ??
      parent.closest(".analyze-board") ??
      parent.closest(".atlas-board") ??
      parent.closest(".history-board") ??
      parent;

    const measure = () => {
      const next = Math.max(
        0,
        Math.floor(Math.min(well.clientWidth, well.clientHeight)),
      );
      sideRef.current = next;
      setSide(next);
      if (next >= 32) setReady(true);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(well);
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
    const scrub = () => clearChessgroundTransients(el);
    const api = Chessground(el, {
      fen: latest.fen,
      orientation: latest.orientation,
      turnColor: latest.turnColor,
      check: latest.check,
      lastMove: latest.lastMove ?? [],
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
        showGhost: false,
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
          after: (orig, dest) => {
            scrub();
            onMoveRef.current(orig, dest);
          },
        },
      },
      events: {
        move: scrub,
        change: scrub,
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
    scrub();

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
    clearChessgroundTransients(wrap);
  }, [side]);

  useLayoutEffect(() => {
    const api = apiRef.current;
    const host = hostRef.current;
    if (!api || !host) return;

    const snap = resyncKey !== resyncSeenRef.current;
    resyncSeenRef.current = resyncKey;
    if (snap && api.state.animation.current) {
      api.state.animation.current = undefined;
    }
    if (snap) api.cancelMove();

    api.set({
      fen,
      orientation,
      turnColor,
      check,
      lastMove: lastMove ?? [],
      animation: snap
        ? { enabled: false, duration: 0 }
        : { enabled: true, duration: animationMs },
      movable: {
        color: viewOnly ? undefined : movableColor,
        dests,
      },
      drawable: {
        autoShapes: toShapes(arrows, circles),
      },
    });
    if (snap) {
      api.set({
        animation: { enabled: animationMs >= 70, duration: animationMs },
      });
    }
    clearChessgroundTransients(host);

    const wait = snap ? 0 : animationMs + 32;
    const timer = window.setTimeout(() => {
      if (!api.state.animation.current) dropStuckFadingPieces(host);
      clearChessgroundTransients(host);
    }, wait);
    return () => window.clearTimeout(timer);
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
    resyncKey,
  ]);

  useEffect(() => {
    if (!onLongPress) return;
    const host = hostRef.current;
    if (!host) return;
    let timer: number | null = null;
    let startX = 0;
    let startY = 0;
    const start = (event: PointerEvent) => {
      startX = event.clientX;
      startY = event.clientY;
      timer = window.setTimeout(() => onLongPress(), 420);
    };
    const moved = (event: PointerEvent) => {
      if (timer === null) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (dx * dx + dy * dy > 64) {
        window.clearTimeout(timer);
        timer = null;
      }
    };
    const clear = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = null;
    };
    host.addEventListener("pointerdown", start);
    host.addEventListener("pointermove", moved);
    host.addEventListener("pointerup", clear);
    host.addEventListener("pointercancel", clear);
    host.addEventListener("pointerleave", clear);
    return () => {
      clear();
      host.removeEventListener("pointerdown", start);
      host.removeEventListener("pointermove", moved);
      host.removeEventListener("pointerup", clear);
      host.removeEventListener("pointercancel", clear);
      host.removeEventListener("pointerleave", clear);
    };
  }, [onLongPress]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const scrub = () => {
      requestAnimationFrame(() => clearChessgroundTransients(host));
    };
    host.addEventListener("pointerup", scrub);
    host.addEventListener("pointercancel", scrub);
    host.addEventListener("lostpointercapture", scrub);
    return () => {
      host.removeEventListener("pointerup", scrub);
      host.removeEventListener("pointercancel", scrub);
      host.removeEventListener("lostpointercapture", scrub);
    };
  }, [ready]);

  return (
    <div
      ref={hostRef}
      className="board-frame"
      data-mark={mark?.kind}
      style={
        side > 0 ? { width: side, height: side, maxWidth: "none" } : undefined
      }
    >
      {mark ? (
        <span
          className={`move-mark move-mark-${mark.kind}`}
          style={glyphStyle(mark.square, orientation)}
          title={markTitle(mark.kind)}
        >
          {MOVE_MARK_LABEL[mark.kind]}
        </span>
      ) : null}
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

function markTitle(kind: BoardMark["kind"]): string {
  if (kind === "gem") return "Signature idea";
  if (kind === "true") return "The house move";
  return "Clean theory";
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
    modifiers: { lineWidth: a.brush === "last" || a.brush === "hint" ? 13 : 15 },
  }));
  for (const sq of circles) {
    shapes.push({ orig: sq, dest: sq, brush: "yellow" });
  }
  return shapes;
}
