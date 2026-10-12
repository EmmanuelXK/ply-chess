"use client";

import { graphPoints, type AnalysisTree } from "@/lib/chess/tree";

function tilt(cp: number | null, mate: number | null): number | null {
  if (mate != null && mate !== 0) return mate > 0 ? 0.96 : -0.96;
  if (cp == null) return null;
  return Math.tanh(cp / 380);
}

export function EvalGraph({
  tree,
  onJump,
}: {
  tree: AnalysisTree;
  onJump: (path: number[]) => void;
}) {
  const points = graphPoints(tree);
  const width = 100;
  const height = 36;
  const top = 4;
  const bottom = 32;
  const mid = (top + bottom) / 2;
  const span = Math.max(points.length - 1, 1);
  const xAt = (index: number) => (points.length === 1 ? width / 2 : (index / span) * width);
  const yAt = (value: number) => mid - value * (mid - top);

  const segments: string[] = [];
  let current = "";
  points.forEach((point, index) => {
    const value = tilt(point.cp, point.mate);
    if (value == null) {
      if (current) segments.push(current);
      current = "";
      return;
    }
    const command = `${current ? "L" : "M"}${xAt(index).toFixed(2)} ${yAt(value).toFixed(2)}`;
    current = current ? `${current} ${command}` : command;
  });
  if (current) segments.push(current);

  const cursor = Math.min(tree.path.length, points.length - 1);
  const cursorPoint = points[cursor];
  const cursorValue = cursorPoint ? tilt(cursorPoint.cp, cursorPoint.mate) : null;

  return (
    <button
      type="button"
      className="analyze-graph"
      data-testid="eval-graph"
      aria-label="Evaluation graph. Tap to jump to a move."
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        if (!rect.width || points.length === 0) return;
        const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
        const index = Math.round(ratio * span);
        const point = points[index];
        if (point) onJump(point.path);
      }}
    >
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden>
        <line x1="0" x2={width} y1={mid} y2={mid} className="analyze-graph-zero" />
        {segments.map((d) => (
          <path key={d} d={d} className="analyze-graph-line" />
        ))}
        {cursorValue != null ? (
          <circle cx={xAt(cursor)} cy={yAt(cursorValue)} r="1.7" className="analyze-graph-mark" />
        ) : (
          <line
            x1={xAt(cursor)}
            x2={xAt(cursor)}
            y1={top}
            y2={bottom}
            className="analyze-graph-cursor"
          />
        )}
      </svg>
    </button>
  );
}
