import type { Opening } from "@/lib/openings/types";
import { SPEAKER_GENDER } from "@/lib/tts/catalog";
import { DUOS } from "./duos";
import { dialogueForPly, dialogueForStart } from "./generate";
import { MAX_BEAT_WORDS, wordCount } from "./short";

const BANNED =
  /\b(dumbledore|grindelwald|albus|gellert|carlsen|magnus|harmon|beth|raquel|tokyo|nairobi|bella ciao|voldemort|harry potter|queen'?s gambit)\b/i;

export function validateDialogue(openings: Opening[]): void {
  for (const duo of DUOS) {
    if (duo.left.gender === duo.right.gender) {
      throw new Error(`[${duo.id}] duo must be one male + one female voice`);
    }
    if (SPEAKER_GENDER[duo.left.id] !== duo.left.gender) {
      throw new Error(`[${duo.id}] ${duo.left.short} gender mismatch`);
    }
    if (SPEAKER_GENDER[duo.right.id] !== duo.right.gender) {
      throw new Error(`[${duo.id}] ${duo.right.short} gender mismatch`);
    }
  }

  const samples = openings.filter(
    (o) => o.id === "black-lion" || o.id === "london",
  );
  if (samples.length < 2) {
    throw new Error("dialogue needs Lion and London in the repertoire");
  }

  for (const opening of samples) {
    for (const duo of DUOS) {
      const start = dialogueForStart(opening, {
        duo: duo.id,
        mode: "dual",
        lesson: "teach",
      });
      if (start.beats.length < 2) {
        throw new Error(
          `[${opening.id}/${duo.id}] start must have two teachers talking`,
        );
      }
      const speakers = new Set(start.beats.map((b) => b.speaker));
      if (speakers.size < 2) {
        throw new Error(`[${opening.id}/${duo.id}] start does not alternate`);
      }
      if (!start.beats.some((b) => b.kind === "takeaway")) {
        throw new Error(`[${opening.id}/${duo.id}] start needs a landing plan`);
      }
      if (!start.beats.some((b) => b.ask)) {
        throw new Error(
          `[${opening.id}/${duo.id}] start should quiz the student`,
        );
      }

      let argued = 0;
      let agreed = 0;
      for (let ply = 0; ply < opening.moves.length; ply += 1) {
        const scene = dialogueForPly(opening, ply, {
          duo: duo.id,
          mode: "dual",
          lesson: "teach",
        });
        if (!scene.beats.length) {
          throw new Error(`[${opening.id}/${duo.id}] empty scene at ply ${ply}`);
        }
        if (scene.beats.length > 4) {
          throw new Error(
            `[${opening.id}/${duo.id}] too many beats at ply ${ply}`,
          );
        }
        for (const beat of scene.beats) {
          const n = wordCount(beat.text);
          if (n > MAX_BEAT_WORDS) {
            throw new Error(
              `[${opening.id}/${duo.id}] ply ${ply} beat too long (${n}w): ${beat.text}`,
            );
          }
        }
        if (scene.beats.some((b) => b.kind === "challenge")) argued += 1;
        if (scene.beats.some((b) => b.kind === "agree")) agreed += 1;
        const blob = scene.beats.map((b) => b.text).join(" ");
        if (BANNED.test(blob)) {
          throw new Error(
            `[${opening.id}/${duo.id}] banned likeness/name in dialogue`,
          );
        }
      }
      if (argued === 0) {
        throw new Error(`[${opening.id}/${duo.id}] never argues`);
      }
      if (agreed === 0) {
        throw new Error(`[${opening.id}/${duo.id}] never agrees`);
      }

      const solo = dialogueForStart(opening, { duo: duo.id, mode: "solo" });
      if (solo.beats.length !== 1) {
        throw new Error(`[${opening.id}/${duo.id}] solo must be one speaker`);
      }
      if (wordCount(solo.beats[0].text) > MAX_BEAT_WORDS) {
        throw new Error(`[${opening.id}/${duo.id}] solo line too long`);
      }
    }
  }

  for (const opening of openings) {
    const scene = dialogueForPly(opening, 0, {
      duo: "voss-draven",
      mode: "dual",
    });
    if (!scene.beats.length) {
      throw new Error(`[${opening.id}] dual scene empty at ply 0`);
    }
    for (const beat of scene.beats) {
      if (wordCount(beat.text) > MAX_BEAT_WORDS) {
        throw new Error(`[${opening.id}] ply 0 beat too long: ${beat.text}`);
      }
    }
  }
}
