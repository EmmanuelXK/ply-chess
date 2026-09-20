import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { leadsWithSan } from "../dialogue";
import { coachOnAsk, coachAfterPly, coachAtStart } from "./coach";
import { explainLessonAt, getOpening, isKeyPly, openings } from "./index";
import { theoryAt, theoryHasReason } from "./theory-reason";

describe("theory reason", () => {
  it("gives every system an idea plus a reason at start", () => {
    for (const opening of openings) {
      const point = theoryAt(opening, -1);
      assert.ok(point.idea.trim(), `${opening.id} missing idea`);
      assert.equal(leadsWithSan(point.idea), false, `${opening.id} idea SAN-led: ${point.idea}`);
      assert.ok(
        theoryHasReason(point),
        `${opening.id} missing reason: "${point.reason}"`,
      );
      assert.equal(leadsWithSan(point.reason), false, `${opening.id} reason SAN-led`);
      assert.match(point.intro, /\./, `${opening.id} intro should keep idea and reason`);
    }
  });

  it("keeps Why/Explain intros as idea+reason, not a SAN dump", () => {
    for (const opening of openings) {
      for (const ply of [0, 1, 3, 7, 12]) {
        if (ply > opening.moves.length) continue;
        const lesson = explainLessonAt(opening, ply);
        assert.ok(lesson.intro.trim().length > 12, `${opening.id} ply ${ply} thin Why`);
        assert.equal(
          leadsWithSan(lesson.intro),
          false,
          `${opening.id} ply ${ply} Why SAN-led: "${lesson.intro}"`,
        );
        const point = theoryAt(opening, Math.max(-1, ply - 1));
        assert.ok(theoryHasReason(point), `${opening.id} ply ${ply} no reason`);
      }
    }
  });

  it("puts the reason on the key-ply strip and on Ask Coach", () => {
    const london = getOpening("london");
    assert.ok(london);
    const start = coachAtStart(london);
    assert.ok(start.detail, start.text);
    assert.equal(leadsWithSan(start.text), false, start.text);

    const key = london.moves.findIndex((_, ply) => isKeyPly(london, ply));
    assert.ok(key >= 0);
    const strip = coachAfterPly(london, key);
    assert.ok(strip.text.trim());
    assert.ok(strip.detail?.trim(), `London ply ${key} strip missing reason`);
    assert.equal(leadsWithSan(strip.detail ?? ""), false);

    const quiet = london.moves.findIndex((_, ply) => !isKeyPly(london, ply));
    assert.ok(quiet >= 0);
    const asked = coachOnAsk(london, quiet, "", "");
    assert.equal(asked.kind, "why");
    assert.ok(asked.text.trim());
    assert.ok(asked.detail?.trim(), "Ask Coach on a quiet ply should still state the reason");
    assert.equal(leadsWithSan(asked.text), false, asked.text);
    assert.equal(leadsWithSan(asked.detail ?? ""), false, asked.detail);
  });

  it("teaches London Why as bishop-breathes, not a Bf4 dump", () => {
    const london = getOpening("london");
    assert.ok(london);
    const lesson = explainLessonAt(london, 3);
    assert.match(`${lesson.intro} ${lesson.title}`, /bishop|breathe|chain|house|triangle/i);
    assert.equal(leadsWithSan(lesson.intro), false, lesson.intro);
    assert.match(lesson.branch.map((b) => b.san).join(" "), /e3|Nf6|Bf4|c5/i);
  });
});
