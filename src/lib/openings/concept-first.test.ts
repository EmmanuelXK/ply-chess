import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dialogueForPly,
  dialogueForStart,
  leadsWithCoordinateDump,
  leadsWithSan,
  spokenHook,
  twoBeatLine,
  wordCount,
} from "../dialogue";
import { SHORT_HOOKS } from "../dialogue/hooks";
import { looksLikeMoveList } from "./helpers";
import { coachAfterPly, coachOnHint, coachOnPlan } from "./coach";
import { getOpening, openings, isKeyPly, explainLessonAt } from "./index";

const THIN = 6;
const THEY = /\b(they|their|them)\b/i;

describe("concept-first Memory OS", () => {
  it("authors a hook pack for every system", () => {
    for (const opening of openings) {
      const hooks = SHORT_HOOKS[opening.id];
      assert.ok(hooks?.length, `${opening.id} missing concept hooks`);
      const theory = hooks.filter((row) => row.ply >= 0);
      assert.ok(
        theory.length >= 4,
        `${opening.id} needs at least four theory beats, got ${theory.length}`,
      );
    }
  });

  it("plants why-they and how-we on every authored hook", () => {
    for (const opening of openings) {
      for (const row of SHORT_HOOKS[opening.id]) {
        assert.match(
          row.they,
          THEY,
          `${opening.id} ply ${row.ply} they-line is not opponent-aware: "${row.they}"`,
        );
        assert.ok(row.we.trim(), `${opening.id} ply ${row.ply} missing our answer`);
        assert.equal(
          leadsWithSan(row.they),
          false,
          `${opening.id} ply ${row.ply} they SAN-led: "${row.they}"`,
        );
        assert.equal(
          leadsWithSan(row.we),
          false,
          `${opening.id} ply ${row.ply} we SAN-led: "${row.we}"`,
        );
        const spoken = spokenHook(row);
        const n = wordCount(spoken);
        assert.ok(
          n >= THIN && n <= 15,
          `${opening.id} ply ${row.ply} is ${n} words: "${spoken}"`,
        );
        assert.match(
          spoken,
          THEY,
          `${opening.id} ply ${row.ply} strip dropped their idea: "${spoken}"`,
        );
        assert.ok(
          spoken.includes(".") || spoken.includes("—"),
          `${opening.id} ply ${row.ply} should keep two pictures: "${spoken}"`,
        );
      }
    }
  });

  it("keeps both pictures when the they-line is already six words", () => {
    const line = twoBeatLine(
      "They want the bishop dead now.",
      "Keep its air. You said no.",
    );
    assert.match(line, /bishop dead/i);
    assert.match(line, /air/i);
    assert.ok(wordCount(line) <= 15);
  });

  it("keeps default strip as a picture, not a SAN lead or move dump", () => {
    for (const opening of openings) {
      const start = dialogueForStart(opening, { duo: "voss-draven", mode: "solo" });
      const startLine = start.beats[0]?.text ?? "";
      assert.ok(
        startLine.split(" ").filter(Boolean).length >= THIN,
        `${opening.id} start thin: "${startLine}"`,
      );
      assert.equal(leadsWithSan(startLine), false, `${opening.id} start: ${startLine}`);
      assert.equal(looksLikeMoveList(startLine), false, `${opening.id} start: ${startLine}`);
      assert.match(startLine, THEY, `${opening.id} start not opponent-aware: "${startLine}"`);

      for (let ply = 0; ply < opening.moves.length; ply++) {
        if (!isKeyPly(opening, ply)) continue;
        const scene = dialogueForPly(opening, ply, {
          duo: "voss-draven",
          mode: "solo",
        });
        const line = scene.beats[0]?.text ?? coachAfterPly(opening, ply).text;
        assert.ok(line.trim(), `${opening.id} ply ${ply} empty`);
        assert.ok(
          line.split(" ").filter(Boolean).length >= THIN,
          `${opening.id} ply ${ply} thin: "${line}"`,
        );
        assert.equal(
          leadsWithSan(line),
          false,
          `${opening.id} ply ${ply} SAN-led: "${line}"`,
        );
        assert.equal(
          looksLikeMoveList(line),
          false,
          `${opening.id} ply ${ply} move dump: "${line}"`,
        );
        const row = SHORT_HOOKS[opening.id]?.find((h) => h.ply === ply);
        if (!row) continue;
        assert.match(
          line,
          THEY,
          `${opening.id} ply ${ply} key strip is not opponent-aware: "${line}"`,
        );
      }
    }
  });

  it("makes highlighted pins opponent-aware — why they moved, how we treat it", () => {
    for (const opening of openings) {
      for (const pin of opening.pins) {
        const row = SHORT_HOOKS[opening.id]?.find((h) => h.ply === pin.afterPly);
        assert.ok(
          row,
          `${opening.id} pin ${pin.afterPly} (${pin.label}) missing they/we`,
        );
        const line =
          dialogueForPly(opening, pin.afterPly, {
            duo: "voss-draven",
            mode: "solo",
          }).beats[0]?.text ?? "";
        assert.match(
          line,
          THEY,
          `${opening.id} pin ${pin.afterPly} not opponent-aware: "${line}"`,
        );
        assert.equal(leadsWithSan(line), false, `${opening.id} pin: ${line}`);
      }
    }
  });

  it("teaches London as bishop-breathes, not Bf4 drill", () => {
    const london = getOpening("london");
    assert.ok(london);
    const strip = dialogueForPly(london, 2, {
      duo: "voss-draven",
      mode: "solo",
    }).beats[0]?.text ?? "";
    assert.match(strip, /breathe/i);
    assert.match(strip, /they|wall|stake/i);
    assert.doesNotMatch(strip, /\bBf4\b/);
    assert.doesNotMatch(strip, /d4 Bf4 e3/);

    const challenged =
      dialogueForPly(london, 12, {
        duo: "voss-draven",
        mode: "solo",
      }).beats[0]?.text ?? "";
    assert.match(challenged, THEY);
    assert.match(challenged, /air|bishop|keep/i);
    assert.doesNotMatch(challenged, /\bBf4\b/);
  });

  it("teaches Lion as house and coil, not a knight-move dump", () => {
    const lion = getOpening("black-lion");
    assert.ok(lion);
    const hide = dialogueForPly(lion, 5, {
      duo: "voss-draven",
      mode: "solo",
    }).beats[0]?.text ?? "";
    assert.match(hide, /hide|coil|house|pawn/i);
    assert.doesNotMatch(hide, /Nbd7/);
    const wake = dialogueForPly(lion, 7, {
      duo: "voss-draven",
      mode: "solo",
    }).beats[0]?.text ?? "";
    assert.match(wake, /Lion|wake|dark/i);
    assert.doesNotMatch(wake, /^…e5/);
  });

  it("teaches Alapin d4 as a queen-in-the-middle stake, not a c-file recapture", () => {
    const alapin = getOpening("alapin");
    assert.ok(alapin);
    const d4 =
      dialogueForPly(alapin, 6, { duo: "voss-draven", mode: "solo" }).beats[0]
        ?.text ?? "";
    assert.match(d4, /queen|centre|center|stake/i);
    assert.doesNotMatch(d4, /c-file/);
    const recapture =
      dialogueForPly(alapin, 14, { duo: "voss-draven", mode: "solo" }).beats[0]
        ?.text ?? "";
    assert.match(recapture, /c-file|recapture|pawn/i);
  });

  it("teaches the Queen's Gambit exchange as our take, not their recapture", () => {
    const qg = getOpening("queens-gambit");
    assert.ok(qg);
    const take =
      dialogueForPly(qg, 6, { duo: "voss-draven", mode: "solo" }).beats[0]
        ?.text ?? "";
    assert.match(take, /knight|centre|center|minority/i);
    assert.doesNotMatch(take, /they recapture/i);
  });

  it("keeps hints concept-first — SAN lives in the detail, not the strip", () => {
    const london = getOpening("london");
    assert.ok(london);
    const hint = coachOnHint(london, 2);
    assert.equal(leadsWithSan(hint.text), false, hint.text);
    assert.match(hint.detail ?? "", /Bf4|Play/);
  });

  it("keeps Why/Explain able to name the move", () => {
    const london = getOpening("london");
    assert.ok(london);
    const lesson = explainLessonAt(london, 3);
    assert.match(`${lesson.intro} ${lesson.branch.map((b) => b.san).join(" ")}`, /e3|Nf6|Bf4|bishop/i);
    assert.ok(lesson.branch.length >= 1);
  });

  it("keeps Plan / Aggressive as they-we pictures — SAN stays in detail", () => {
    const evans = getOpening("evans-gambit");
    assert.ok(evans);
    const strip = coachOnPlan("aggressive", evans);
    assert.equal(leadsWithSan(strip.text), false, strip.text);
    assert.equal(looksLikeMoveList(strip.text), false, strip.text);
    assert.doesNotMatch(strip.text, /e5-d5/i);
    assert.doesNotMatch(strip.text, /Open f7/i);
    assert.match(strip.text, THEY);
    assert.match(strip.detail ?? "", /e5|d5|f7|pawn/i);

    for (const opening of openings) {
      for (const voice of ["steady", "creative", "aggressive"] as const) {
        const line = coachOnPlan(voice, opening).text;
        assert.equal(
          leadsWithSan(line),
          false,
          `${opening.id} ${voice} SAN-led: "${line}"`,
        );
        assert.equal(
          leadsWithCoordinateDump(line),
          false,
          `${opening.id} ${voice} square dump: "${line}"`,
        );
        assert.equal(
          looksLikeMoveList(line),
          false,
          `${opening.id} ${voice} move dump: "${line}"`,
        );
        assert.ok(
          line.split(" ").filter(Boolean).length >= THIN,
          `${opening.id} ${voice} thin: "${line}"`,
        );
      }
    }
  });
});
