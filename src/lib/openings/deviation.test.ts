import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { playLine } from "../chess/line";
import { leadsWithCoordinateDump, leadsWithSan } from "../dialogue";
import { shouldAutoSpeakOnScene, shouldOpenExplainOnCoachTap } from "../tts/ask-coach";
import { coachOnFail } from "./coach";
import { explainDeviation, shouldOpenCoachExplain } from "./deviation";
import { looksLikeMoveList } from "./helpers";
import { getOpening } from "./index";

describe("Lotus-style deviation coaching", () => {
  it("never auto-speaks a miss — Ask Coach opens the explain view", () => {
    assert.equal(shouldAutoSpeakOnScene(), false);
    assert.equal(shouldOpenCoachExplain("fail"), true);
    assert.equal(shouldOpenExplainOnCoachTap("fail"), true);
    assert.equal(shouldOpenCoachExplain("ok"), false);
    assert.equal(shouldOpenExplainOnCoachTap("ok"), false);
    assert.equal(shouldOpenExplainOnCoachTap("hint"), false);
    assert.equal(shouldOpenExplainOnCoachTap("start"), false);
    assert.equal(shouldOpenExplainOnCoachTap("plan"), false);
  });

  it("keeps the fail strip concept-first — SAN belongs in the explain layer", () => {
    const london = getOpening("london");
    assert.ok(london);
    const fail = coachOnFail(london, 0);
    assert.equal(fail.kind, "fail");
    assert.equal(leadsWithSan(fail.text), false, fail.text);
    assert.equal(looksLikeMoveList(fail.text), false, fail.text);
    assert.match(fail.text, /house|job|square|bishop|rock|triangle/i);
    assert.match(fail.detail ?? "", /d4|Play/);
  });

  it("builds a richer explain: problem, book idea, contrast, candidates, line", () => {
    const london = getOpening("london");
    assert.ok(london);
    const pos = playLine(london.moves, 0);
    const explain = explainDeviation({
      opening: london,
      ply: 0,
      playedSan: "e4",
      fen: pos.fen,
    });
    assert.equal(explain.playedSan, "e4");
    assert.equal(explain.bookSan, london.moves[0]);
    assert.equal(leadsWithSan(explain.problem), false, explain.problem);
    assert.equal(leadsWithCoordinateDump(explain.problem), false, explain.problem);
    assert.equal(looksLikeMoveList(explain.problem), false, explain.problem);
    assert.match(explain.problem, /job|house|square/i);
    assert.equal(leadsWithSan(explain.bookIdea), false, explain.bookIdea);
    assert.ok(explain.bookIdea.trim());
    assert.ok(explain.contrast?.trim());
    assert.match(explain.contrast ?? "", /\b(they|their|them)\b/i);
    assert.ok(explain.candidates.length >= 1);
    assert.ok(
      explain.candidates.some((row) => row.book && row.san === london.moves[0]),
      "book candidate must be the authored move",
    );
    assert.equal(explain.bookLine, london.moves);
    assert.equal(explain.startPly, 0);
  });

  it("uses authored Lion house copy — no invented chess truth", () => {
    const lion = getOpening("black-lion");
    assert.ok(lion);
    const pos = playLine(lion.moves, 1);
    const explain = explainDeviation({
      opening: lion,
      ply: 1,
      playedSan: "e5",
      fen: pos.fen,
    });
    assert.equal(explain.playedSan, "e5");
    assert.equal(leadsWithSan(explain.problem), false, explain.problem);
    assert.equal(leadsWithSan(explain.bookIdea), false, explain.bookIdea);
    assert.match(
      `${explain.problem} ${explain.bookIdea} ${explain.contrast ?? ""}`,
      /coil|house|lion|philidor|pawn|break|dark/i,
    );
    assert.doesNotMatch(explain.problem, /engine|stockfish|eval|best move/i);
    assert.ok(explain.candidates.every((row) => row.reason.trim()));
  });
});
