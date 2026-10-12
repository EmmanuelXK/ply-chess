import assert from "node:assert/strict";
import test from "node:test";
import { chartAreas, evalUnit, gridMarks, plyIndexAt, unitToY } from "./eval-chart";

test("a missing score is not zero, and a drawn zero stays on the midline", () => {
  assert.equal(evalUnit(null, null), null);
  assert.equal(evalUnit(null, 0), null);
  assert.equal(evalUnit(Number.NaN, null), null);
  assert.equal(evalUnit(0, null), 0);
  assert.equal(unitToY(0), 0.5);
});

test("mates and five-pawn swings sit on the chart edge", () => {
  assert.equal(evalUnit(null, 1), 1);
  assert.equal(evalUnit(50, 3), 1);
  assert.equal(evalUnit(null, -1), -1);
  assert.equal(evalUnit(null, -8), -1);
  assert.equal(evalUnit(500, null), 1);
  assert.equal(evalUnit(2000, null), 1);
  assert.equal(evalUnit(-500, null), -1);
  assert.equal(evalUnit(-900, 0), -1);
  assert.equal(unitToY(1), 0);
  assert.equal(unitToY(-1), 1);
});

test("the scale is smooth, odd, and larger swings sit further out", () => {
  const one = evalUnit(100, null)!;
  const three = evalUnit(300, null)!;
  assert.ok(one > 0.15 && one < 0.7);
  assert.ok(one < three && three < 1);
  assert.equal(evalUnit(-100, null), -one);
  assert.ok(Math.abs(unitToY(one) + unitToY(-one) - 1) < 1e-12);
});

test("a missing ply is a gap, not a bridge through zero", () => {
  const areas = chartAreas([0.4, null, -0.3]);
  assert.equal(areas.length, 2);
  assert.equal(areas[0]?.side, "white");
  assert.equal(areas[1]?.side, "black");
  const left = Math.max(...areas[0]!.curve.map((point) => point.x));
  const right = Math.min(...areas[1]!.curve.map((point) => point.x));
  assert.ok(left < 0.2);
  assert.ok(right > 0.8);
  assert.deepEqual(chartAreas([0.4, null, 0.4]).length, 2);
});

test("a sign change splits on the midline", () => {
  const areas = chartAreas([0.5, -0.5]);
  assert.equal(areas.length, 2);
  assert.equal(areas[0]?.side, "white");
  assert.equal(areas[1]?.side, "black");
  const meetWhite = areas[0]!.curve.at(-1)!;
  const meetBlack = areas[1]!.curve[0]!;
  assert.equal(meetWhite.y, 0.5);
  assert.equal(meetBlack.y, 0.5);
  assert.ok(Math.abs(meetWhite.x - 0.5) < 1e-12);
  assert.ok(Math.abs(meetBlack.x - meetWhite.x) < 1e-12);
  assert.equal(areas[0]!.curve[0]?.y, unitToY(0.5));
  assert.equal(areas[1]!.curve.at(-1)?.y, unitToY(-0.5));
});

test("a known equal ply draws no area, including a flat zero line", () => {
  assert.deepEqual(chartAreas([0, 0, 0]), []);
  assert.deepEqual(chartAreas([0]), []);
  const areas = chartAreas([0.4, 0, -0.4]);
  assert.equal(areas.length, 2);
  assert.equal(areas[0]?.curve.at(-1)?.y, 0.5);
  assert.equal(areas[1]?.curve[0]?.y, 0.5);
  assert.equal(areas[0]?.curve.at(-1)?.x, 0.5);
});

test("one known ply stays a local sliver", () => {
  const areas = chartAreas([null, 1, null, null, null]);
  assert.equal(areas.length, 1);
  assert.equal(areas[0]?.side, "white");
  const xs = areas[0]!.curve.map((point) => point.x);
  const width = Math.max(...xs) - Math.min(...xs);
  assert.ok(width > 0 && width < 0.2);
  assert.ok(Math.min(...xs) > 0.05);
  assert.ok(Math.max(...xs) < 0.5);
  assert.ok(areas[0]!.curve.every((point) => point.y === 0));
});

test("a continuous advantage is one lobe", () => {
  const areas = chartAreas([0.2, 0.5, 0.1]);
  assert.equal(areas.length, 1);
  assert.equal(areas[0]?.side, "white");
  assert.deepEqual(
    areas[0]?.curve.map((point) => point.x),
    [0, 0.5, 1],
  );
});

test("a tap ratio lands on a ply", () => {
  assert.equal(plyIndexAt(0, 5), 0);
  assert.equal(plyIndexAt(1, 5), 4);
  assert.equal(plyIndexAt(0.5, 5), 2);
  assert.equal(plyIndexAt(-2, 5), 0);
  assert.equal(plyIndexAt(3, 3), 2);
  assert.equal(plyIndexAt(0.4, 1), 0);
});

test("grid lines mirror across the midline", () => {
  const marks = gridMarks();
  assert.ok(marks.some((mark) => mark.axis && mark.y === 0.5));
  for (const pawns of [1, 2, 4]) {
    const up = marks.find((mark) => mark.pawns === pawns)!;
    const down = marks.find((mark) => mark.pawns === -pawns)!;
    assert.ok(up.y < 0.5 && up.y > 0);
    assert.ok(Math.abs(up.y + down.y - 1) < 1e-12);
  }
});
