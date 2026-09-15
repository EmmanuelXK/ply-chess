import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { playLine } from "../chess/line";
import { collectFacts, dialogueForPly, leadsWithSan, spokenHook, stripMoveDumpLead } from "../dialogue";
import { SHORT_HOOKS } from "../dialogue/hooks";
import { coachAfterPly, coachOnFail, coachOnPlan } from "../openings/coach";
import { getOpening, isKeyPly } from "../openings";
import {
  adaptiveDepth,
  compressBeforeCalculate,
  createPlayerModel,
  createSpeechBudget,
  decideCoachBrain,
  engineConsensus,
  coachBrainV2FromEnv,
  coachBrainV2FromStored,
  isCoachBrainV2Enabled,
  singlePathAnalyzer,
  stubAnalyzer,
  analysisFromStockfishMoves,
  shouldAutoOpenAnalyze,
  teachingLookahead,
} from "./index";
import type { CandidateMove, EngineAnalysis } from "./types";

function lion() {
  const opening = getOpening("black-lion");
  assert.ok(opening);
  return opening;
}

function factsFor(
  opening: ReturnType<typeof lion>,
  ply: number,
  kind: "ok" | "fail" | "start" | "hint" = "ok",
  fen?: string,
) {
  return collectFacts({ opening, ply, kind, fen });
}

function dummyCandidate(san: string, extra?: Partial<CandidateMove>): CandidateMove {
  return {
    san,
    classification: "Practical",
    reason: "Authored house job.",
    changesPlan: true,
    ...extra,
  };
}

describe("COACH_BRAIN_V2 flag", () => {
  it("stays off unless env or settings explicitly enable it", () => {
    assert.equal(coachBrainV2FromEnv(undefined), false);
    assert.equal(coachBrainV2FromEnv(""), false);
    assert.equal(coachBrainV2FromEnv("0"), false);
    assert.equal(coachBrainV2FromStored(null), false);
    assert.equal(coachBrainV2FromStored("0"), false);
    assert.equal(isCoachBrainV2Enabled(), false);
  });

  it("turns on from env or stored 1", () => {
    assert.equal(coachBrainV2FromEnv("1"), true);
    assert.equal(coachBrainV2FromEnv("true"), true);
    assert.equal(coachBrainV2FromEnv("ON"), true);
    assert.equal(coachBrainV2FromStored("1"), true);
  });
});

describe("dialogueForPly legacy path", () => {
  it("matches flag-off / brain:false on a Lion key ply", () => {
    const opening = lion();
    const legacy = dialogueForPly(opening, 7, { duo: "voss-draven", mode: "solo" });
    const explicit = dialogueForPly(opening, 7, {
      duo: "voss-draven",
      mode: "solo",
      brain: false,
    });
    assert.deepEqual(
      explicit.beats.map((beat) => beat.text),
      legacy.beats.map((beat) => beat.text),
    );
    assert.equal(legacy.beats.length, 1);
  });
});

describe("CoachBrain intents", () => {
  it("silences ordinary develop plies", () => {
    const opening = lion();
    const quiet = opening.moves.findIndex((_, ply) => !isKeyPly(opening, ply));
    assert.ok(quiet >= 0);
    const decision = decideCoachBrain({
      opening,
      afterPly: quiet,
      kind: "ok",
      facts: factsFor(opening, quiet),
      player: createPlayerModel(),
      budget: createSpeechBudget(),
    });
    assert.equal(decision.intent, "SILENCE");
    assert.equal(decision.speak, false);
    assert.equal(decision.compress, null);

    const scene = dialogueForPly(opening, quiet, {
      duo: "voss-draven",
      mode: "solo",
      brain: true,
      player: createPlayerModel(),
      budget: createSpeechBudget(),
    });
    assert.equal(scene.beats.length, 0);
  });

  it("reinforces or introduces a key ply from the authored hook", () => {
    const opening = lion();
    const hook = SHORT_HOOKS[opening.id]?.find((row) => row.ply === 7);
    assert.ok(hook);
    const player = createPlayerModel();
    const budget = createSpeechBudget({ maxOptional: 8, windowPlies: 40 });
    const pos = playLine(opening.moves, 8);
    const decision = decideCoachBrain({
      opening,
      afterPly: 7,
      kind: "ok",
      facts: factsFor(opening, 7, "ok", pos.fen),
      fen: pos.fen,
      soloText: coachAfterPly(opening, 7).text,
      player,
      budget,
    });
    assert.ok(
      decision.intent === "REINFORCE" ||
        decision.intent === "INTRODUCE" ||
        decision.intent === "TRANSFER",
    );
    assert.equal(decision.speak, true);
    assert.equal(decision.content.source, "hook");
    assert.equal(decision.content.text, spokenHook(hook));
    assert.equal(leadsWithSan(decision.content.text), false);
  });

  it("corrects a miss with authored copy", () => {
    const opening = lion();
    const fail = coachOnFail(opening, 5);
    const decision = decideCoachBrain({
      opening,
      afterPly: 5,
      kind: "fail",
      facts: factsFor(opening, 5, "fail"),
      soloText: fail.text,
      player: createPlayerModel(),
      budget: createSpeechBudget(),
    });
    assert.equal(decision.intent, "CORRECT");
    assert.equal(decision.method, "explain");
    assert.equal(decision.speak, true);
    assert.ok(decision.content.text.trim());
    assert.equal(leadsWithSan(decision.content.text), false);
  });

  it("rotates explain → question → contrast on the same concept", () => {
    const opening = lion();
    const player = createPlayerModel();
    const budget = createSpeechBudget();
    const fail = coachOnFail(opening, 5);
    const intents: string[] = [];
    const methods: string[] = [];
    for (let i = 0; i < 3; i++) {
      const decision = decideCoachBrain({
        opening,
        afterPly: 5,
        kind: "fail",
        facts: factsFor(opening, 5, "fail"),
        soloText: fail.text,
        player,
        budget,
      });
      intents.push(decision.intent);
      methods.push(decision.method);
    }
    assert.deepEqual(intents, ["CORRECT", "CORRECT", "CORRECT"]);
    assert.deepEqual(methods, ["explain", "question", "contrast"]);
    assert.ok(
      decideCoachBrain({
        opening,
        afterPly: 5,
        kind: "fail",
        facts: factsFor(opening, 5, "fail"),
        soloText: fail.text,
        player,
        budget,
      }).content.ask || methods[1] === "question",
    );
  });

  it("lets speech budget silence extra reinforce beats", () => {
    const opening = lion();
    const keys = opening.moves
      .map((_, ply) => ply)
      .filter((ply) => isKeyPly(opening, ply));
    assert.ok(keys.length >= 2);
    const player = createPlayerModel();
    const budget = createSpeechBudget({ maxOptional: 1, windowPlies: 40 });
    const first = decideCoachBrain({
      opening,
      afterPly: keys[0],
      kind: "ok",
      facts: factsFor(opening, keys[0]),
      player,
      budget,
    });
    const second = decideCoachBrain({
      opening,
      afterPly: keys[1],
      kind: "ok",
      facts: factsFor(opening, keys[1]),
      player,
      budget,
    });
    assert.equal(first.speak, true);
    assert.equal(second.intent, "SILENCE");
    assert.equal(second.speak, false);
  });
});

describe("compress before calculate", () => {
  it("understands a Lion position and keeps 2–5 plan candidates, including the book move", () => {
    const opening = lion();
    const afterPly = 7;
    const pos = playLine(opening.moves, afterPly + 1);
    const decision = compressBeforeCalculate({
      opening,
      afterPly,
      facts: factsFor(opening, afterPly, "ok", pos.fen),
      fen: pos.fen,
    });
    assert.ok(decision.candidates.length >= 2);
    assert.ok(decision.candidates.length <= 5);
    assert.ok(decision.compressed.length >= 2);
    assert.ok(decision.compressed.length <= 5);
    const book = opening.moves[afterPly + 1];
    assert.ok(
      decision.candidates.some((row) => row.book && row.san === book),
      `expected book ${book} among candidates`,
    );
    const chessLegal = pos.chess.moves().length;
    assert.ok(
      decision.candidates.length < chessLegal,
      "must not treat every legal move equally",
    );
    assert.ok(decision.understanding.opponentIntent);
    assert.ok(decision.understanding.plans.length >= 1);
    assert.ok(decision.human.what);
    assert.ok(decision.human.why);
    assert.ok(decision.depth >= 4 && decision.depth <= 8);
    assert.ok(decision.lookahead.length <= 8);
    assert.ok((decision.consensus.analyses[0]?.pv?.length ?? 0) <= 8);
  });

  it("caps teaching lookahead at 4–8 meaningful ply", () => {
    const opening = lion();
    const short = teachingLookahead(opening, 0, 4);
    const long = teachingLookahead(opening, 0, 8);
    assert.ok(short.length <= 4 || short.length <= 8);
    assert.ok(long.length <= 8);
    assert.ok(long.every((row) => row.idea.trim()));
  });

  it("escalates depth on forcing/sacrifice, not on quiet agreement", () => {
    const quiet = adaptiveDepth({
      understanding: {
        materialCp: 0,
        kingSafety: { us: 0, them: 0 },
        structure: [],
        activity: 8,
        space: 0,
        weakSquares: [],
        files: [],
        diags: [],
        threats: [],
        plans: ["coil"],
        opponentIntent: "They want a cheap Italian.",
        volatile: false,
        forcing: false,
        sacrifice: false,
      },
      compressed: [dummyCandidate("Be7", { classification: "Practical", book: true })],
      disagree: false,
    });
    assert.equal(quiet.depth, 4);
    assert.equal(quiet.escalate, false);

    const hot = adaptiveDepth({
      understanding: {
        ...{
          materialCp: -100,
          kingSafety: { us: -10, them: 0 },
          structure: [],
          activity: 20,
          space: 0,
          weakSquares: [],
          files: [],
          diags: [],
          threats: ["Check"],
          plans: ["hunt"],
          opponentIntent: "They take the gift.",
          volatile: true,
          forcing: true,
          sacrifice: true,
        },
      },
      compressed: [dummyCandidate("Bxf7+", { classification: "Critical", book: true })],
      disagree: true,
    });
    assert.equal(hot.depth, 8);
    assert.equal(hot.escalate, true);
  });
});

describe("engine interfaces", () => {
  it("stubs a single analyzer and investigates disagreement instead of max eval", () => {
    const candidates = [
      dummyCandidate("Be7", { book: true, classification: "Strong" }),
      dummyCandidate("Qh4", { classification: "Inferior" }),
    ];
    const stub = stubAnalyzer.analyze({
      candidates,
      depth: 6,
      lookaheadSans: ["Be7", "d3", "O-O", "c6", "a3", "Qc7", "h3", "h6", "Nc3"],
    });
    assert.equal(stub.engineId, "stub");
    assert.equal(stub.ready, true);
    assert.ok((stub.pv?.length ?? 0) <= 8);

    const heuristic = singlePathAnalyzer.analyze({
      candidates,
      depth: 4,
      lookaheadSans: ["Be7", "d3"],
    });
    assert.equal(heuristic.engineId, "heuristic");

    const split: EngineAnalysis[] = [
      {
        engineId: "stockfish",
        ready: true,
        candidates: [dummyCandidate("Qh4")],
        evalCp: 900,
        note: "tactical spam",
      },
      {
        engineId: "maia",
        ready: true,
        candidates: [dummyCandidate("Be7")],
        evalCp: 40,
        note: "human prior",
      },
    ];
    const consensus = engineConsensus(split);
    assert.equal(consensus.agree, false);
    assert.equal(consensus.verdict, "investigate");
    assert.match(consensus.disagreement ?? "", /do not crown max eval/i);
    assert.equal(
      consensus.analyses.sort((a, b) => (b.evalCp ?? 0) - (a.evalCp ?? 0))[0]?.candidates[0]?.san,
      "Qh4",
    );
    assert.notEqual(consensus.verdict, "stable");
  });

  it("maps Stockfish onto compressed candidates and truncates teaching PV", () => {
    const start = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const longPv = ["d2d4", "d7d5", "c2c4", "e7e6", "b1c3", "g8f6", "c1g5", "f8e7", "e2e3", "e8g8"];
    const analysis = analysisFromStockfishMoves(
      [dummyCandidate("e4", { book: true, classification: "Strong" })],
      [{ san: "d4", uci: "d2d4", scoreCp: 55, pv: longPv }],
      start,
      6,
    );
    assert.equal(analysis.engineId, "stockfish");
    assert.equal(analysis.candidates[0]?.san, "d4");
    assert.ok((analysis.pv?.length ?? 0) <= 6);
    assert.match(analysis.note, /investigate/i);
  });
});

describe("strip + plan handoff", () => {
  it("peels e5-d5 SAN dumps off the strip", () => {
    assert.equal(
      stripMoveDumpLead("e5-d5. Open f7. Don't count the pawn."),
      "Open f7. Don't count the pawn.",
    );
    assert.equal(leadsWithSan("Open f7. Don't count the pawn."), false);
  });

  it("opens Analyze once when the book first ends", () => {
    assert.equal(shouldAutoOpenAnalyze(false, true, false), true);
    assert.equal(shouldAutoOpenAnalyze(true, true, false), false);
    assert.equal(shouldAutoOpenAnalyze(false, true, true), false);
    assert.equal(shouldAutoOpenAnalyze(false, false, false), false);
  });

  it("asks the problem, then two candidates, after a repeat miss", () => {
    const opening = lion();
    const player = createPlayerModel();
    const budget = createSpeechBudget();
    const fail = coachOnFail(opening, 5);
    decideCoachBrain({
      opening,
      afterPly: 5,
      kind: "fail",
      facts: factsFor(opening, 5, "fail"),
      soloText: fail.text,
      player,
      budget,
    });
    const second = decideCoachBrain({
      opening,
      afterPly: 5,
      kind: "fail",
      facts: factsFor(opening, 5, "fail"),
      soloText: fail.text,
      player,
      budget,
    });
    assert.equal(second.method, "question");
    assert.ok(second.content.ask);
    assert.ok(second.content.nextAsk);
    assert.match(second.content.ask?.prompt ?? "", /problem|job|idea|why/i);
    assert.match(second.content.nextAsk?.prompt ?? "", /candidate/i);
  });

  it("does not put Evans Aggressive SAN on the strip when the brain is on", () => {
    const evans = getOpening("evans-gambit");
    assert.ok(evans);
    const plan = coachOnPlan("aggressive", evans);
    const scene = dialogueForPly(evans, evans.moves.length - 1, {
      duo: "voss-draven",
      mode: "solo",
      kind: "plan",
      soloText: plan.text,
      brain: true,
      player: createPlayerModel(),
      budget: createSpeechBudget(),
    });
    const line = scene.beats[0]?.text ?? plan.text;
    assert.equal(leadsWithSan(line), false, line);
    assert.doesNotMatch(line, /e5-d5/i);
  });
});
