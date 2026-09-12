import type { Opening } from "@/lib/openings/types";
import { DUOS } from "./duos";
import { dialogueForPly, dialogueForStart } from "./generate";

const BANNED =
  /\b(dumbledore|grindelwald|albus|gellert|carlsen|magnus|harmon|beth|raquel|tokyo|nairobi|bella ciao|voldemort|harry potter|queen'?s gambit)\b/i;

export function validateDialogue(openings: Opening[]): void {
  const samples = openings.filter(
    (o) => o.id === "black-lion" || o.id === "london",
  );
  if (samples.length < 2) {
    throw new Error("dialogue needs Lion and London in the repertoire");
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
      if (!start.beats.some((b) => b.ask)) {
        throw new Error(
          `[${opening.id}/${duo.id}] start should quiz the student`,
        );
      }

      for (const ply of [0, 7, 15]) {
        const scene = dialogueForPly(opening, ply, {
          duo: duo.id,
          mode: "dual",
        });
        if (!scene.beats.length) {
          throw new Error(`[${opening.id}/${duo.id}] empty scene at ply ${ply}`);
        }
        const blob = scene.beats.map((b) => b.text).join(" ");
        if (BANNED.test(blob)) {
          throw new Error(
            `[${opening.id}/${duo.id}] banned likeness/name in dialogue`,
          );
        }
      }

      const solo = dialogueForStart(opening, { duo: duo.id, mode: "solo" });
      if (solo.beats.length !== 1) {
        throw new Error(`[${opening.id}/${duo.id}] solo must be one speaker`);
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
  }
}
