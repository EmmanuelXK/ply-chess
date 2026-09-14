import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dialogueForPly, dialogueForStart } from "../dialogue";
import { COACH_SPEAKER } from "../tts/types";
import { coachAfterPly, shouldSpeakCoach } from "./coach";
import { explainLessonAt, getOpening, openings } from "./index";
import { isKeyPly, keyPlyReasons } from "./key-ply";
import { isUserPly } from "./helpers";

describe("isKeyPly", () => {
  it("marks Lion pins, story, history, and authored Why — not every develop ply", () => {
    const lion = getOpening("black-lion");
    assert.ok(lion);
    const keys = lion.moves
      .map((_, ply) => ply)
      .filter((ply) => isKeyPly(lion, ply));
    assert.ok(keys.length >= 4, `expected several key plies, got ${keys.length}`);
    assert.ok(
      keys.length <= Math.floor(lion.moves.length * 0.45),
      `too chatty: ${keys.length}/${lion.moves.length} plies`,
    );
    assert.ok(isKeyPly(lion, 7), "…e5 should be a key Lion ply");
    assert.equal(isKeyPly(lion, 2), false, "d4 is a developing move");
    assert.equal(isKeyPly(lion, 3), false, "…Nf6 is a developing move");
    assert.equal(isKeyPly(lion, 6), false, "Nf3 is a developing move, not a leaked history key");
    const quiet = lion.moves.findIndex((_, ply) => !isKeyPly(lion, ply));
    assert.ok(quiet >= 0, "Lion should have at least one silent develop ply");
    assert.ok(keyPlyReasons(lion, 7).length > 0);
  });

  it("keeps start / fail / hint speaking when the ply itself is not highlighted", () => {
    const london = getOpening("london");
    assert.ok(london);
    assert.equal(shouldSpeakCoach("start", london, -1), true);
    assert.equal(shouldSpeakCoach("fail", london, 2), true);
    assert.equal(shouldSpeakCoach("hint", london, 2), true);
    assert.equal(shouldSpeakCoach("ok", london, 2), isKeyPly(london, 2));
  });

  it("returns empty coach copy on ordinary plies", () => {
    const evans = getOpening("evans-gambit");
    assert.ok(evans);
    const quietPly = evans.moves.findIndex((_, ply) => !isKeyPly(evans, ply));
    assert.ok(quietPly >= 0);
    const quiet = coachAfterPly(evans, quietPly);
    assert.equal(quiet.text, "");
    assert.equal(quiet.kind, "ok");
    const scene = dialogueForPly(evans, quietPly, {
      duo: "voss-draven",
      mode: "solo",
    });
    assert.equal(scene.beats.length, 0);
  });

  it("still builds Why/Explain for a quiet developing move", () => {
    const lion = getOpening("black-lion");
    assert.ok(lion);
    const quietPly = lion.moves.findIndex((_, ply) => !isKeyPly(lion, ply));
    assert.ok(quietPly >= 0);
    const lesson = explainLessonAt(lion, quietPly + 1);
    assert.ok(lesson.intro.trim().length > 20, "Explain should have a real why");
    assert.ok(lesson.branch.length >= 1, "Explain should show a short branch");
  });
});

describe("male-only coach", () => {
  it("starts and teaches key plies as Aldric only", () => {
    const lion = getOpening("black-lion");
    assert.ok(lion);
    const start = dialogueForStart(lion, { duo: "voss-draven", mode: "solo" });
    assert.ok(start.beats.length >= 1);
    assert.ok(start.beats.every((beat) => beat.speaker === COACH_SPEAKER));

    const wake = dialogueForPly(lion, 7, { duo: "voss-draven", mode: "solo" });
    assert.ok(wake.beats.length >= 1);
    assert.ok(wake.beats.every((beat) => beat.speaker === COACH_SPEAKER));
    assert.equal(wake.beats.length, 1, "no quiz/ask on a key ply");
    assert.match(wake.beats[0].text, /e5|Lion|wake|d4|house/i);
    assert.doesNotMatch(
      wake.beats[0].text,
      /Hide, then bite|Grab the center|Coil, then strike|Develop with tempo|Wake the line up/,
    );
    const house = dialogueForPly(lion, 1, { duo: "voss-draven", mode: "solo" });
    assert.doesNotMatch(house.beats[0]?.text ?? "", /Hide, then bite|Coil, then strike/);
    const knight = dialogueForPly(lion, 5, { duo: "voss-draven", mode: "solo" });
    assert.doesNotMatch(knight.beats[0]?.text ?? "", /Hide, then bite|Coil, then strike/);
  });

    it("stays sparse across the repertoire", () => {
    for (const opening of openings) {
      const keys = opening.moves.filter((_, ply) => isKeyPly(opening, ply)).length;
      assert.ok(
        keys < opening.moves.length,
        `${opening.id} still teaches every ply`,
      );
    }
  });

  it("adds the five new weapons as sparse concept systems", () => {
    const ids = ["alapin", "english", "caro-kann", "queens-gambit", "slav"];
    for (const id of ids) {
      const opening = getOpening(id);
      assert.ok(opening, `missing ${id}`);
      const keys = opening.moves
        .map((_, ply) => ply)
        .filter((ply) => isKeyPly(opening, ply));
      assert.ok(keys.length >= 4, `${id} needs concept keys, got ${keys.length}`);
      assert.ok(
        keys.length <= Math.floor(opening.moves.length * 0.45),
        `${id} too chatty: ${keys.length}/${opening.moves.length}`,
      );
      assert.ok(opening.traps.length >= 3, `${id} needs a trap pack`);
    }
    assert.equal(getOpening("alapin")?.side, "white");
    assert.equal(getOpening("english")?.side, "white");
    assert.equal(getOpening("queens-gambit")?.side, "white");
    assert.equal(getOpening("caro-kann")?.side, "black");
    assert.equal(getOpening("slav")?.side, "black");
    assert.ok(isKeyPly(getOpening("alapin")!, 2), "c3 should be an Alapin key");
    assert.ok(isKeyPly(getOpening("english")!, 8), "e4 clamp should be an English key");
    assert.ok(isKeyPly(getOpening("caro-kann")!, 5), "…Bf5 should be a Caro key");
    assert.ok(isKeyPly(getOpening("queens-gambit")!, 20), "Rab1 should be a minority key");
    assert.ok(isKeyPly(getOpening("slav")!, 9), "…Bf5 should be a Slav key");
    assert.equal(getOpening("alapin")?.moves.length, 42);
    assert.equal(getOpening("english")?.moves.length, 42);
    assert.equal(getOpening("caro-kann")?.moves.length, 42);
    assert.equal(getOpening("alapin")?.moves.at(-1), "Qd7");
    assert.equal(getOpening("english")?.moves.at(-1), "Nc6");
    assert.equal(getOpening("caro-kann")?.moves.at(-1), "Bxa3");
    assert.equal(isUserPly("black", (getOpening("caro-kann")?.moves.length ?? 0) - 1), true);
  });
});
