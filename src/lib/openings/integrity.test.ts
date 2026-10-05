import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Chess, type Move } from "chess.js";
import { openings } from "./index";

const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function material(chess: Chess): number {
  let score = 0;
  for (const row of chess.board()) {
    for (const piece of row) {
      if (!piece) continue;
      const value = VALUE[piece.type] ?? 0;
      score += piece.color === "w" ? value : -value;
    }
  }
  return score;
}

/** Net gain for the side to move after a capture and the cheapest recapture. */
function punishGain(chess: Chess): number {
  const before = material(chess);
  const side = chess.turn();
  const captures = chess.moves({ verbose: true }).filter((move) => move.captured);
  let best = 0;
  for (const capture of captures) {
    const probe = new Chess(chess.fen());
    const played = probe.move(capture.san);
    if (!played) continue;
    const recaptures = probe
      .moves({ verbose: true })
      .filter((move) => move.captured && move.to === played.to);
    let gain = sideGain(material(probe), before, side);
    if (recaptures.length) {
      let cheapest = Infinity;
      for (const recapture of recaptures) {
        const next = new Chess(probe.fen());
        if (!next.move(recapture.san)) continue;
        cheapest = Math.min(cheapest, sideGain(material(next), before, side));
      }
      if (cheapest !== Infinity) gain = cheapest;
    }
    best = Math.max(best, gain);
  }
  return best;
}

function sideGain(after: number, before: number, side: "w" | "b"): number {
  return side === "w" ? after - before : before - after;
}

const LEADING_SAN =
  /^(?:(?:\.\.\.|…)\s*)?(O-O-O|O-O|[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQ])?[+#]?)[.!?](?:\s|$)/;

describe("repertoire integrity", () => {
  it("keeps every weapon legal, sided, and explained by matching notes", () => {
    assert.equal(openings.length, 26);
    const problems: string[] = [];

    for (const opening of openings) {
      if (opening.moves.length < 40) {
        problems.push(`${opening.id}: spine shorter than 40`);
      }
      const chess = new Chess();
      opening.moves.forEach((san, ply) => {
        let played: Move | null = null;
        try {
          played = chess.move(san);
        } catch {
          played = null;
        }
        if (!played) {
          problems.push(`${opening.id}: illegal ${san} at ply ${ply}`);
          return;
        }
        const expected = ply % 2 === 0 ? "w" : "b";
        if (played.color !== expected) {
          problems.push(`${opening.id}: ${san} at ply ${ply} is the wrong side`);
        }
      });

      if (punishGain(chess) >= 2) {
        problems.push(`${opening.id}: main line ends with a piece hanging (${punishGain(chess)})`);
      }

      for (const trap of opening.traps) {
        if (!trap.moves.length) problems.push(`${opening.id}/${trap.id}: empty trap`);
      }

      for (const line of opening.coach) {
        if (line.afterPly < 0) continue;
        const san = opening.moves[line.afterPly];
        const lead = LEADING_SAN.exec(line.text.trim());
        if (lead && lead[1] !== san) {
          problems.push(
            `${opening.id}: note on ply ${line.afterPly} says ${lead[1]} but the move is ${san}`,
          );
        }
      }

      for (const script of opening.professor) {
        const lesson = script.whyLesson;
        if (!lesson?.branch?.length) continue;
        const board = new Chess();
        let legal = true;
        for (const san of opening.moves.slice(0, lesson.startPly)) {
          try {
            if (!board.move(san)) legal = false;
          } catch {
            legal = false;
          }
        }
        if (!legal) {
          problems.push(`${opening.id}: why "${lesson.title}" start is illegal`);
          continue;
        }
        for (const step of lesson.branch) {
          let played: Move | null = null;
          try {
            played = board.move(step.san);
          } catch {
            played = null;
          }
          if (!played) {
            problems.push(`${opening.id}: why "${lesson.title}" illegal ${step.san}`);
            continue;
          }
          for (const arrow of step.arrows ?? []) {
            if (arrow.brush !== "green") continue;
            if (arrow.orig !== played.from || arrow.dest !== played.to) {
              problems.push(
                `${opening.id}: green arrow ${arrow.orig}-${arrow.dest} does not match ${step.san} (${played.from}-${played.to})`,
              );
            }
          }
        }
      }
    }

    assert.deepEqual(problems, []);
  });
});
