import type { Opening } from "@/lib/openings/types";
import { DUOS } from "./duos";
import { dialogueForPly, dialogueForStart } from "./generate";
import { wordCount } from "./short";
import { MAX_BEAT_WORDS } from "./types";

const BANNED =
  /\b(dumbledore|grindelwald|albus|gellert|carlsen|magnus|harmon|beth|raquel|tokyo|nairobi|bella ciao|voldemort|harry potter|queen'?s gambit)\b/i;

const LEAK =
  /\b(why this ages well|the plan has two layers|why:\s|next:\s|don't monologue it back)\b/i;

export function validateDialogue(openings: Opening[]): void {
  const samples = openings.filter(
    (o) => o.id === "black-lion" || o.id === "london" || o.id === "evans-gambit",
  );
  if (samples.length < 3) {
    throw new Error("dialogue needs Lion, London, and Evans in the repertoire");
  }

  for (const opening of samples) {
    for (const duo of DUOS) {
      const start = dialogueForStart(opening, { duo: duo.id, mode: "dual" });
      if (start.beats.length < 2) {
        throw new Error(
          `[${opening.id}/${duo.id}] start must have two teachers talking`,
        );
      }
      const speakers = new Set(start.beats.map((b) => b.speaker));
      if (speakers.size < 2) {
        throw new Error(`[${opening.id}/${duo.id}] start does not alternate`);
      }

      const plies = [-1, 0, 3, 7, 11, 15].filter((p) => p < opening.moves.length);
      for (const ply of plies) {
        const scene =
          ply < 0
            ? start
            : dialogueForPly(opening, ply, { duo: duo.id, mode: "dual" });
        if (!scene.beats.length) {
          throw new Error(`[${opening.id}/${duo.id}] empty scene at ply ${ply}`);
        }
        for (const beat of scene.beats) {
          const n = wordCount(beat.text);
          if (n > MAX_BEAT_WORDS) {
            throw new Error(
              `[${opening.id}/${duo.id}] ply ${ply} beat is ${n} words: "${beat.text}"`,
            );
          }
          if (LEAK.test(beat.text)) {
            throw new Error(
              `[${opening.id}/${duo.id}] professor leak at ply ${ply}: "${beat.text}"`,
            );
          }
        }
        const blob = scene.beats.map((b) => b.text).join(" ");
        if (BANNED.test(blob)) {
          throw new Error(
            `[${opening.id}/${duo.id}] banned likeness/name in dialogue`,
          );
        }
      }

      const fail = dialogueForPly(opening, 0, {
        duo: duo.id,
        mode: "dual",
        kind: "fail",
        misses: [{ ply: 0, san: opening.moves[0] ?? "e4", idea: "center" }],
      });
      if (!fail.beats.some((b) => wordCount(b.text) <= MAX_BEAT_WORDS)) {
        throw new Error(`[${opening.id}/${duo.id}] fail beats too long`);
      }

      const solo = dialogueForStart(opening, { duo: duo.id, mode: "solo" });
      if (solo.beats.length !== 1) {
        throw new Error(`[${opening.id}/${duo.id}] solo must be one speaker`);
      }
      if (wordCount(solo.beats[0].text) > MAX_BEAT_WORDS) {
        throw new Error(`[${opening.id}/${duo.id}] solo start is too long`);
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
        throw new Error(
          `[${opening.id}] ply 0 beat is ${wordCount(beat.text)} words: "${beat.text}"`,
        );
      }
    }
  }

  if (DUOS.some((d) => d.left.gender !== "male" || d.right.gender !== "female")) {
    throw new Error("each duo must be male + female");
  }
}
