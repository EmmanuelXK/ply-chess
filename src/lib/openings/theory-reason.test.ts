import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { leadsWithSan } from "../dialogue";
import { coachOnAsk, coachAfterPly, coachAtStart } from "./coach";
import { explainLessonAt, getOpening, isKeyPly, openings } from "./index";
import { theoryAt, theoryHasQuestions, theoryHasReason } from "./theory-reason";

const CA_MARKETING =
  /chessatlas|pick–learn–drill|pick-learn-drill|recognition is the goal|the idea is…|what does my move do/i;

function assertCoachCopy(label: string, text: string) {
  assert.ok(text.trim(), `${label} empty`);
  assert.equal(leadsWithSan(text), false, `${label} SAN-led: "${text}"`);
  assert.equal(CA_MARKETING.test(text), false, `${label} copied marketing: "${text}"`);
}

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
        assert.ok(
          theoryHasQuestions(point),
          `${opening.id} ply ${ply} missing question set: plan="${point.plan}" they="${point.theyMoved}" miss="${point.secondBest}"`,
        );
        assertCoachCopy(`${opening.id} ply ${ply} plan`, point.plan);
        assertCoachCopy(`${opening.id} ply ${ply} they`, point.theyMoved);
        assertCoachCopy(`${opening.id} ply ${ply} miss`, point.secondBest);
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
    assert.ok(strip.triad, `London ply ${key} should surface do/prevent/reply`);
    assertCoachCopy("London key do", strip.triad.do);
    assertCoachCopy("London key prevent", strip.triad.prevent);
    assertCoachCopy("London key reply", strip.triad.reply);

    const quiet = london.moves.findIndex((_, ply) => !isKeyPly(london, ply));
    assert.ok(quiet >= 0);
    const asked = coachOnAsk(london, quiet, "", "");
    assert.equal(asked.kind, "why");
    assert.ok(asked.text.trim());
    assert.ok(asked.detail?.trim(), "Ask Coach on a quiet ply should still state the reason");
    assert.equal(leadsWithSan(asked.text), false, asked.text);
    assert.equal(leadsWithSan(asked.detail ?? ""), false, asked.detail);
    assert.ok(asked.plan && asked.theyMoved && asked.secondBest);
    assertCoachCopy("Ask Coach plan", asked.plan);
    assertCoachCopy("Ask Coach they", asked.theyMoved);
    assertCoachCopy("Ask Coach miss", asked.secondBest);
    assert.equal(asked.triad, undefined, "quiet ply Ask Coach should not invent a triad");
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

describe("coach question set", () => {
  it("plants plan / their idea / near-miss on every system", () => {
    for (const opening of openings) {
      const point = theoryAt(opening, -1);
      assert.ok(theoryHasQuestions(point), `${opening.id} start missing questions`);
      assert.match(point.theyMoved, /\b(they|their|them|black|white|hunt)\b/i);
      assert.match(
        point.secondBest,
        /\b(miss|near-miss|cheap|don't|do not|without|if you|dies|steal|bill|other move|skip)\b/i,
        `${opening.id} second-best has no cost: "${point.secondBest}"`,
      );
    }
  });

  it("makes London Ask Coach / Why name the plan, their hunt, and the cheap bishop", () => {
    const london = getOpening("london");
    assert.ok(london);
    const point = theoryAt(london, 2);
    assert.ok(theoryHasReason(point));
    assert.ok(theoryHasQuestions(point));
    assert.match(point.idea, /bishop|breathe|wall/i);
    assert.match(point.plan, /triangle|bishop|clamp|Ne5|squeeze|keep/i);
    assert.match(point.theyMoved, /they|wall|bishop|hunt|pawn/i);
    assert.match(point.secondBest, /bishop|cheap|queen'?s pawn|jobava|near-miss|miss/i);
    assert.ok(point.triad);
    assert.match(point.triad.do, /bishop|breathe|air|keep|triangle/i);
    assert.match(`${point.triad.prevent} ${point.triad.reply}`, /they|stop|don't|hunt|wall|chip|develop/i);

    const asked = coachOnAsk(london, 2, "", "");
    assert.equal(asked.kind, "why");
    assert.equal(asked.plan, point.plan);
    assert.equal(asked.theyMoved, point.theyMoved);
    assert.equal(asked.secondBest, point.secondBest);
    assert.ok(asked.triad);

    const why = explainLessonAt(london, 3);
    assert.equal(leadsWithSan(why.intro), false);
    assert.match(
      `${why.intro} ${why.title} ${point.idea} ${point.plan}`,
      /bishop|breathe|wall|rock|triangle|diagonal/i,
    );
  });

  it("keeps SAN on the move list for London Why, not as the sentence lead", () => {
    const london = getOpening("london");
    assert.ok(london);
    const lesson = explainLessonAt(london, 3);
    const point = theoryAt(london, 2);
    for (const line of [
      lesson.intro,
      point.idea,
      point.reason,
      point.plan,
      point.theyMoved,
      point.secondBest,
      point.triad?.do ?? "",
      point.triad?.prevent ?? "",
      point.triad?.reply ?? "",
    ]) {
      assert.equal(leadsWithSan(line), false, line);
    }
    assert.match(lesson.branch.map((row) => row.san).join(" "), /Nf6|e3/);
  });
});
