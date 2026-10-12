/** White's point of view, mapped into [-1, 1] for the analysis chart. */

export const PAWN_CLAMP = 5;

/** Horizontal guides, in pawns. The chart edge itself is the ±5 clamp. */
export const GRID_PAWNS = [1, 2, 4] as const;

const SIGMOID_K = 3;
const SIGMOID_DENOM = Math.tanh(SIGMOID_K);
const ZERO = 1e-9;

export interface ChartPoint {
  x: number;
  y: number;
}

export interface ChartArea {
  side: "white" | "black";
  /** Eval curve, left to right. The renderer closes it down to the midline. */
  curve: ChartPoint[];
}

/**
 * Smooth clamp. ±5 pawns and any nonzero mate land on ±1.
 * A missing score stays null. A real 0 stays on the midline.
 */
export function evalUnit(cp: number | null, mate: number | null): number | null {
  if (mate != null && mate !== 0 && Number.isFinite(mate)) return mate > 0 ? 1 : -1;
  if (cp == null || !Number.isFinite(cp)) return null;
  const pawns = Math.max(-PAWN_CLAMP, Math.min(PAWN_CLAMP, cp / 100));
  return Math.tanh((SIGMOID_K * pawns) / PAWN_CLAMP) / SIGMOID_DENOM;
}

/** 0 is the top of the chart (White), 1 is the bottom (Black). */
export function unitToY(unit: number): number {
  return (1 - unit) / 2;
}

export function plyIndexAt(ratio: number, count: number): number {
  if (count <= 1) return 0;
  const clamped = Math.min(1, Math.max(0, ratio));
  return Math.round(clamped * (count - 1));
}

export function gridMarks(): { pawns: number; y: number; axis: boolean }[] {
  const marks: { pawns: number; y: number; axis: boolean }[] = [
    { pawns: 0, y: 0.5, axis: true },
  ];
  for (const pawns of GRID_PAWNS) {
    const unit = evalUnit(pawns * 100, null);
    if (unit == null) continue;
    marks.push({ pawns, y: unitToY(unit), axis: false });
    marks.push({ pawns: -pawns, y: unitToY(-unit), axis: false });
  }
  return marks;
}

function xAt(index: number, count: number): number {
  if (count <= 1) return 0.5;
  return index / (count - 1);
}

function sideOf(unit: number): ChartArea["side"] | null {
  if (unit > ZERO) return "white";
  if (unit < -ZERO) return "black";
  return null;
}

/**
 * Filled lobes between the eval and the zero line.
 * Nulls are gaps: a missing ply is not drawn as 0 and is not bridged.
 * An isolated known ply is a short local sliver so it still reads.
 */
export function chartAreas(units: readonly (number | null)[]): ChartArea[] {
  const count = units.length;
  const areas: ChartArea[] = [];
  let run: { index: number; unit: number }[] = [];

  const flush = () => {
    if (run.length === 0) return;
    if (run.length === 1) {
      pushSliver(areas, run[0]!, count);
    } else {
      pushRun(areas, run, count);
    }
    run = [];
  };

  units.forEach((unit, index) => {
    if (unit == null || !Number.isFinite(unit)) {
      flush();
      return;
    }
    run.push({ index, unit });
  });
  flush();
  return areas;
}

function pushSliver(
  areas: ChartArea[],
  point: { index: number; unit: number },
  count: number,
): void {
  const side = sideOf(point.unit);
  if (!side) return;
  const x = xAt(point.index, count);
  const half = count <= 1 ? 0.06 : Math.min(0.04, 0.5 / (count - 1));
  const y = unitToY(point.unit);
  areas.push({
    side,
    curve: [
      { x: Math.max(0, x - half), y },
      { x: Math.min(1, x + half), y },
    ],
  });
}

interface Tagged {
  x: number;
  y: number;
  side: ChartArea["side"] | null;
}

function pushRun(
  areas: ChartArea[],
  run: { index: number; unit: number }[],
  count: number,
): void {
  const first = run[0]!;
  const tagged: Tagged[] = [
    { x: xAt(first.index, count), y: unitToY(first.unit), side: sideOf(first.unit) },
  ];

  for (let i = 0; i < run.length - 1; i++) {
    const left = run[i]!;
    const right = run[i + 1]!;
    const leftSide = sideOf(left.unit);
    const rightSide = sideOf(right.unit);
    const x0 = xAt(left.index, count);
    const x1 = xAt(right.index, count);
    if (leftSide && rightSide && leftSide !== rightSide) {
      const t = left.unit / (left.unit - right.unit);
      tagged.push({ x: x0 + (x1 - x0) * t, y: 0.5, side: null });
    }
    tagged.push({ x: x1, y: unitToY(right.unit), side: rightSide });
  }

  let curve: ChartPoint[] = [];
  let curveSide: ChartArea["side"] | null = null;
  const close = () => {
    if (curve.length >= 2 && curveSide) areas.push({ side: curveSide, curve });
    curve = [];
    curveSide = null;
  };

  for (const point of tagged) {
    if (!point.side) {
      if (curveSide) {
        curve.push({ x: point.x, y: point.y });
        close();
      }
      curve = [{ x: point.x, y: point.y }];
      continue;
    }
    if (curveSide && curveSide !== point.side) {
      curve.push({ x: point.x, y: 0.5 });
      close();
      curve = [
        { x: point.x, y: 0.5 },
        { x: point.x, y: point.y },
      ];
      curveSide = point.side;
      continue;
    }
    curve.push({ x: point.x, y: point.y });
    curveSide = point.side;
  }
  close();
}
