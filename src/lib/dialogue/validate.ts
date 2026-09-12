import type { Opening } from "@/lib/openings/types";
import { ACTIVE_COACH } from "./coach";
import { dialogueForPly, dialogueForStart } from "./generate";
import { PURPOSE_LABELS } from "./purpose";
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
    const start = dialogueForStart(opening, { duo: ACTIVE_COACH, mode: "solo" });
    if (start.beats.length < 1) {
      throw new Error(`[${opening.id}] start must have a coach beat`);
    }
    if (start.beats.length > 2) {
      throw new Error(`[${opening.id}] start should be one coach, not a duo`);
    }

    const plies = [-1, 0, 3, 7, 11, 15].filter((p) => p < opening.moves.length);
    const seen = new Set<string>();
    for (const ply of plies) {
      const scene =
        ply < 0
          ? start
          : dialogueForPly(opening, ply, { duo: ACTIVE_COACH, mode: "solo" });
      if (!scene.beats.length) {
        throw new Error(`[${opening.id}] empty scene at ply ${ply}`);
      }
      if (scene.beats.length > 2) {
        throw new Error(`[${opening.id}] ply ${ply} has duo-length beats`);
      }
      for (const beat of scene.beats) {
        const n = wordCount(beat.text);
        if (n > MAX_BEAT_WORDS) {
          throw new Error(
            `[${opening.id}] ply ${ply} beat is ${n} words: "${beat.text}"`,
          );
        }
        if (beat.kind !== "quiz" && n < 6) {
          throw new Error(
            `[${opening.id}] ply ${ply} beat is too thin (${n}w): "${beat.text}"`,
          );
        }
        if (LEAK.test(beat.text)) {
          throw new Error(`[${opening.id}] professor leak at ply ${ply}: "${beat.text}"`);
        }
        if (!beat.purpose || !PURPOSE_LABELS[beat.purpose]) {
          throw new Error(`[${opening.id}] ply ${ply} missing purpose tag`);
        }
      }
      const line = scene.beats[0]?.text ?? "";
      if (seen.has(line)) {
        throw new Error(`[${opening.id}] repeated identical line "${line}"`);
      }
      seen.add(line);
      if (BANNED.test(scene.beats.map((b) => b.text).join(" "))) {
        throw new Error(`[${opening.id}] banned likeness/name in dialogue`);
      }
    }

    const fail = dialogueForPly(opening, 0, {
      duo: ACTIVE_COACH,
      mode: "solo",
      kind: "fail",
      misses: [{ ply: 0, san: opening.moves[0] ?? "e4", idea: "center" }],
    });
    if (!fail.beats.some((b) => wordCount(b.text) <= MAX_BEAT_WORDS)) {
      throw new Error(`[${opening.id}] fail beats too long`);
    }
    if (!fail.beats[0]?.purpose) {
      throw new Error(`[${opening.id}] fail missing purpose`);
    }
  }

  for (const opening of openings) {
    const scene = dialogueForPly(opening, 0, {
      duo: ACTIVE_COACH,
      mode: "solo",
    });
    if (!scene.beats.length) {
      throw new Error(`[${opening.id}] coach scene empty at ply 0`);
    }
    for (const beat of scene.beats) {
      if (wordCount(beat.text) > MAX_BEAT_WORDS) {
        throw new Error(
          `[${opening.id}] ply 0 beat is ${wordCount(beat.text)} words: "${beat.text}"`,
        );
      }
      if (beat.kind !== "quiz" && !beat.purpose) {
        throw new Error(`[${opening.id}] ply 0 missing purpose`);
      }
    }
  }
}
