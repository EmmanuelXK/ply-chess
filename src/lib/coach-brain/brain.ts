import { shouldSpeakCoach, type CoachKind } from "@/lib/openings/coach";
import { isKeyPly } from "@/lib/openings/key-ply";
import { chunkAt } from "@/lib/openings/helpers";
import { compressBeforeCalculate } from "./compress";
import { selectContent } from "./content";
import { conceptIdFor } from "./player";
import type {
  CoachBrainDecision,
  CoachBrainInput,
  TeachMethod,
  TeachingIntent,
} from "./types";

function firstKeyInChunk(opening: CoachBrainInput["opening"], afterPly: number): boolean {
  const chunk = chunkAt(opening, Math.max(0, afterPly));
  if (!chunk) return afterPly <= 0;
  for (let ply = chunk.fromPly; ply <= afterPly; ply++) {
    if (!isKeyPly(opening, ply)) continue;
    return ply === afterPly;
  }
  return chunk.fromPly === afterPly;
}

function intentFor(input: CoachBrainInput, method: TeachMethod): TeachingIntent {
  const { opening, afterPly, kind } = input;
  if (!shouldSpeakCoach(kind, opening, afterPly)) return "SILENCE";

  if (kind === "fail") return "CORRECT";
  if (kind === "hint" || kind === "why") return "EXPLAIN";
  if (kind === "quiz") return "RECALL";
  if (kind === "pin") return "CELEBRATE";
  if (kind === "plan") return "CELEBRATE";
  if (kind === "history") return "CONNECT";
  if (kind === "start") return "INTRODUCE";

  if (method === "question" && kind === "ok") return "PREDICT";
  if (method === "contrast" && kind === "ok") return "CONTRAST";

  const concept = conceptIdFor(opening.id, chunkAt(opening, Math.max(0, afterPly))?.name);
  const last = input.player.lastConcept();
  if (last && last !== concept && firstKeyInChunk(opening, afterPly)) return "TRANSFER";
  if (firstKeyInChunk(opening, afterPly)) return "INTRODUCE";
  return "REINFORCE";
}

/** Decide TeachingIntent, then pick authored content. No LLM chess truth. */
export function decideCoachBrain(input: CoachBrainInput): CoachBrainDecision {
  const { opening, afterPly, kind, facts, fen, soloText, player, budget } = input;
  const concept = conceptIdFor(opening.id, facts.chunkName ?? chunkAt(opening, Math.max(0, afterPly))?.name);
  const gated = shouldSpeakCoach(kind, opening, afterPly);

  let method: TeachMethod = player.methodFor(concept);
  if (kind === "fail") {
    method = player.recordFail(concept);
  }

  if (!gated) {
    return {
      intent: "SILENCE",
      content: { intent: "SILENCE", text: "", source: "silence", method },
      compress: null,
      speak: false,
      method,
    };
  }

  if (!budget.canSpeak(kind, afterPly)) {
    return {
      intent: "SILENCE",
      content: { intent: "SILENCE", text: "", source: "silence", method },
      compress: null,
      speak: false,
      method,
    };
  }

  const compress = compressBeforeCalculate({ opening, afterPly, facts, fen });
  const intent = intentFor(input, method);

  const content = selectContent({
    opening,
    afterPly,
    facts,
    intent,
    method,
    compress,
    soloText,
  });

  const speak = intent !== "SILENCE" && Boolean(content.text.trim() || content.ask);
  if (speak) {
    budget.noteSpoken(kind, afterPly);
    player.noteConcept(concept);
    if (kind === "ok" || kind === "start" || kind === "pin") {
      player.recordSuccess(concept);
    }
  }

  return { intent, content, compress, speak, method };
}

export type { CoachKind };
