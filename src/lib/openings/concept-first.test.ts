import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dialogueForPly, dialogueForStart, leadsWithSan } from "../dialogue";
import { SHORT_HOOKS } from "../dialogue/hooks";
import { looksLikeMoveList } from "./helpers";
import { coachAfterPly } from "./coach";
import { getOpening, openings, isKeyPly, explainLessonAt } from "./index";

const THIN = 6;

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
    assert.doesNotMatch(strip, /\bBf4\b/);
    assert.doesNotMatch(strip, /d4 Bf4 e3/);
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

  it("keeps Why/Explain able to name the move", () => {
    const london = getOpening("london");
    assert.ok(london);
    const lesson = explainLessonAt(london, 3);
    assert.match(`${lesson.intro} ${lesson.branch.map((b) => b.san).join(" ")}`, /e3|Nf6|Bf4|bishop/i);
    assert.ok(lesson.branch.length >= 1);
  });
});
