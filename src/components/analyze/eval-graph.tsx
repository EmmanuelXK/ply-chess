"use client";

import { useRef, type PointerEvent } from "react";
import { chartAreas, evalUnit, gridMarks, plyIndexAt, unitToY } from "@/lib/chess/eval-chart";
import { graphPoints, type AnalysisTree, type GraphPoint } from "@/lib/chess/tree";

const VB = 1000;

function place(point: { x: number; y: number }): string {
  return `${(point.x * VB).toFixed(2)} ${(point.y * 100).toFixed(2)}`;
}

function areaPath(curve: { x: number; y: number }[]): string {
  const first = curve[0];
  const last = curve[curve.length - 1];
  if (!first || !last) return "";
  const edge = curve.map((point) => `L${place(point)}`).join(" ");
  return `M${(first.x * VB).toFixed(2)} 50 ${edge} L${(last.x * VB).toFixed(2)} 50 Z`;
}

function curvePath(curve: { x: number; y: number }[]): string {
  return curve
    .map((point, index) => `${index === 0 ? "M" : "L"}${place(point)}`)
    .join(" ");
}

function describe(point: GraphPoint | undefined): string {
  if (!point) return "Evaluation chart";
  const where = point.san ?? "start";
  if (point.mate != null && point.mate !== 0) {
    const mate = point.mate > 0 ? `M${point.mate}` : `-M${Math.abs(point.mate)}`;
    return `${where}, ${mate}`;
  }
  if (point.cp == null) return `${where}, no eval`;
  const pawns = (point.cp / 100).toFixed(1);
  return `${where}, ${point.cp > 0 ? `+${pawns}` : pawns}`;
}

export function EvalGraph({
  tree,
  onJump,
}: {
  tree: AnalysisTree;
  onJump: (path: number[]) => void;
}) {
  const points = graphPoints(tree);
  const units = points.map((point) => evalUnit(point.cp, point.mate));
  const areas = chartAreas(units);
  const cursor = Math.min(tree.path.length, Math.max(points.length - 1, 0));
  const cursorUnit = units[cursor] ?? null;
  const cursorX = points.length <= 1 ? 0.5 : cursor / Math.max(points.length - 1, 1);
  const lastIndex = useRef<number | null>(null);

  const seek = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || points.length === 0) return;
    const index = plyIndexAt((event.clientX - rect.left) / rect.width, points.length);
    if (lastIndex.current === index) return;
    lastIndex.current = index;
    const point = points[index];
    if (point) onJump(point.path);
  };

  return (
    <div
      className="analyze-graph"
      data-testid="eval-graph"
      data-areas={areas.length}
      role="slider"
      tabIndex={0}
      aria-label="Evaluation chart. Drag to jump to a move."
      aria-valuemin={0}
      aria-valuemax={Math.max(points.length - 1, 0)}
      aria-valuenow={cursor}
      aria-valuetext={describe(points[cursor])}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        lastIndex.current = null;
        seek(event);
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        seek(event);
      }}
      onPointerUp={() => {
        lastIndex.current = null;
      }}
      onPointerCancel={() => {
        lastIndex.current = null;
      }}
    >
      <svg viewBox={`0 0 ${VB} 100`} preserveAspectRatio="none" aria-hidden>
        {areas.map((area, index) => (
          <path
            key={`${area.side}-${index}-${area.curve[0]?.x}`}
            d={areaPath(area.curve)}
            className={area.side === "white" ? "analyze-graph-fill-w" : "analyze-graph-fill-b"}
          />
        ))}
        {areas.map((area, index) => (
          <path
            key={`edge-${area.side}-${index}-${area.curve[0]?.x}`}
            d={curvePath(area.curve)}
            className={area.side === "white" ? "analyze-graph-edge-w" : "analyze-graph-edge-b"}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {gridMarks().map((mark) => (
          <line
            key={`${mark.pawns}`}
            x1="0"
            x2={VB}
            y1={mark.y * 100}
            y2={mark.y * 100}
            className={mark.axis ? "analyze-graph-zero" : "analyze-graph-grid"}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <span className="analyze-graph-cursor" style={{ left: `${cursorX * 100}%` }} />
      {cursorUnit != null ? (
        <span
          className={`analyze-graph-dot ${cursorUnit < 0 ? "is-black" : "is-white"}`}
          style={{ left: `${cursorX * 100}%`, top: `${unitToY(cursorUnit) * 100}%` }}
        />
      ) : null}
    </div>
  );
}
