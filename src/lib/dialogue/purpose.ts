import type { SpeakerId } from "@/lib/tts/types";
import { looksLikeMoveList } from "@/lib/openings/helpers";
import { hookAt } from "./hooks";
import { limitWords, nugget, wordCount } from "./short";
import type { DialogueAsk, DialogueBeat, LessonFacts, PurposeTag } from "./types";

export type { PurposeTag };

export const PURPOSE_LABELS: Record<PurposeTag, string> = {
  "grab-center": "Grab center",
  "stabilize-center": "Stabilize center",
  "break-center": "Break center",
  "attack-weak-square": "Attack weak square",
  "notice-the-pin": "Notice the pin",
  "free-piece": "Free piece",
  "stop-opponent-plan": "Stop opponent plan",
  "develop-with-tempo": "Develop with tempo",
  "castle-and-connect": "Castle and connect",
  "open-the-file": "Open the file",
  "fix-pawn-chain": "Fix pawn chain",
  "provoke-weakness": "Provoke weakness",
  "coil-then-strike": "Coil then strike",
  "hold-the-square": "Hold the square",
  "wake-the-line": "Wake the line",
};

const PURPOSE_PHRASE: Record<PurposeTag, string[]> = {
  "grab-center": ["Grab the center", "Take the middle", "Own the middle"],
  "stabilize-center": ["Stabilize the center", "Lock the middle", "Keep the center solid"],
  "break-center": ["Break the center", "Crack the middle", "Blow the center open"],
  "attack-weak-square": ["Attack the weak square", "Hit the soft square", "Punish that hole"],
  "notice-the-pin": ["Notice the pin", "Feel that pin", "The pin is the job"],
  "free-piece": ["Free the piece", "Unpin and breathe", "Get that piece out"],
  "stop-opponent-plan": ["Stop their plan", "Don't let that idea land", "Kill their plan first"],
  "develop-with-tempo": ["Develop with tempo", "Develop and kick", "Come out with a punch"],
  "castle-and-connect": ["Castle and connect", "Tuck the king, link the rooks", "Get safe, then connect"],
  "open-the-file": ["Open the file", "Crack that file", "Give the rook a road"],
  "fix-pawn-chain": ["Fix the pawn chain", "Hold the chain", "Don't break your pawns cheap"],
  "provoke-weakness": ["Provoke a weakness", "Make them create a hole", "Ask a question they hate"],
  "coil-then-strike": ["Coil, then strike", "Hide, then bite", "Wait one more coil"],
  "hold-the-square": ["Hold that square", "Sit on the square", "Don't hop off that post"],
  "wake-the-line": ["Wake the line up", "That's the system waking", "Now the line has teeth"],
};

function hashSeed(facts: LessonFacts, extra = 0): number {
  const key = `${facts.openingId}:${facts.ply}:${facts.kind}:${facts.san ?? ""}:${extra}`;
  let n = extra >>> 0;
  for (let i = 0; i < key.length; i++) n = (n * 33 + key.charCodeAt(i)) >>> 0;
  return n;
}

function blob(facts: LessonFacts): string {
  return [
    facts.concept,
    facts.why,
    facts.plan,
    facts.chunkName,
    facts.chunkJob,
    facts.san,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function inferPurpose(facts: LessonFacts): PurposeTag {
  const text = blob(facts);
  const lion = facts.openingId === "black-lion";
  const san = (facts.san ?? "").toLowerCase();

  if (facts.kind === "pin" || /\bpin\b/.test(text)) return "notice-the-pin";
  if (/\bunpin|free the|trapped|get .* out/.test(text)) return "free-piece";

  if (lion) {
    if (san === "e5" || facts.ply === 7) return "wake-the-line";
    if (facts.ply <= 6 || /\bcoil|house|philidor|hide\b/.test(text)) {
      return "coil-then-strike";
    }
    if (/\be5|wake|yawn|bite\b/.test(text)) return "wake-the-line";
  }

  if (/\b(O-O-O|O-O)\b/.test(facts.san ?? "") || /\bcastl(e|ing) now|connect the rooks\b/.test(text)) {
    return "castle-and-connect";
  }
  if (/\b(file|semi-open|rook road)\b/.test(text)) return "open-the-file";
  if (/\b(f7|h7|weak square|outpost|hole|soft square)\b/.test(text)) {
    return "attack-weak-square";
  }
  if (/\b(stop|prevent|don't let|deny|kill their)\b/.test(text)) {
    return "stop-opponent-plan";
  }
  if (/\b(tempo|develop|kick|harass)\b/.test(text)) return "develop-with-tempo";
  if (/\b(pawn chain|triangle|c3|e3 chain)\b/.test(text)) return "fix-pawn-chain";
  if (/\b(provoke|weaken)\b/.test(text)) return "provoke-weakness";
  if (/\b(break|crack|blow)\b/.test(text) || san === "e5" || san === "d5" || san === "c5") {
    return "break-center";
  }
  if (/\b(grab|take|own|seize).{0,12}cent|\bcent(er|re).{0,12}(grab|take|own)\b/.test(text)) {
    return "grab-center";
  }
  if (/\b(hold|clamp|sit|outpost|don't hop)\b/.test(text)) return "hold-the-square";
  if (/\b(solid|stabilize|lock|rock)\b/.test(text)) return "stabilize-center";
  if (/\bcent(er|re)\b/.test(text)) {
    return facts.ply < 8 ? "grab-center" : "stabilize-center";
  }
  return facts.ply < 6 ? "develop-with-tempo" : "hold-the-square";
}

function pickSpeaker(facts: LessonFacts, purpose: PurposeTag): SpeakerId {
  const punch: PurposeTag[] = [
    "break-center",
    "attack-weak-square",
    "provoke-weakness",
    "wake-the-line",
    "stop-opponent-plan",
  ];
  if (facts.kind === "fail" || facts.kind === "hint") return "aldric";
  if (punch.includes(purpose) || facts.romantic) return "kael";
  return hashSeed(facts) % 5 === 0 ? "kael" : "aldric";
}

function phrase(purpose: PurposeTag, seed: number): string {
  const options = PURPOSE_PHRASE[purpose];
  return options[seed % options.length];
}

function askFromFacts(
  facts: LessonFacts,
  speaker: SpeakerId,
): DialogueAsk | undefined {
  if (!facts.quizPrompt || !facts.quizChoices?.length) return undefined;
  if (facts.kind === "fail" || facts.kind === "hint" || facts.kind === "history") {
    return undefined;
  }
  if (facts.kind !== "start" && hashSeed(facts) % 4 !== 0) return undefined;
  return {
    prompt: facts.quizPrompt,
    choices: facts.quizChoices,
    onCorrect: { speaker, text: "Yes. That's the job — not a tactic." },
    onWrong: { speaker, text: "Not that. Stay with the square." },
  };
}

function withFloor(text: string, purpose: PurposeTag): string {
  let line = limitWords(text);
  if (wordCount(line) < 6) {
    line = limitWords(`${line} ${phrase(purpose, 1)}.`);
  }
  return line;
}

function ideaOf(...parts: Array<string | undefined>): string {
  for (const part of parts) {
    if (!part) continue;
    if (looksLikeMoveList(part)) continue;
    const bit = nugget(part, 7);
    if (bit && !looksLikeMoveList(bit)) return bit;
  }
  return "";
}

function composeBody(facts: LessonFacts, purpose: PurposeTag, seed: number): string {
  const tag = phrase(purpose, seed);
  const authored = hookAt(facts);
  const idea = ideaOf(facts.why, facts.concept, facts.chunkJob);
  const san = facts.san;

  if (facts.kind === "fail") {
    const variants = [
      `Not that. ${tag} — play ${san ?? "the book move"}.`,
      `Walk it back. ${tag}. ${san ?? "The book move"} is the job.`,
      `Easy. ${ideaOf(facts.concept) || tag}. Play ${san ?? "the book"}.`,
    ];
    return variants[seed % variants.length];
  }
  if (facts.kind === "hint") {
    return `Play ${san ?? "the book move"}. ${tag} — ${idea || "that's the idea"}.`;
  }
  if (facts.kind === "history") {
    return `${facts.historyYear ?? "Here"}. ${nugget(facts.historyTitle, 5)}. ${tag}.`;
  }
  if (facts.kind === "start" || facts.ply < 0) {
    const hook = authored ? limitWords(authored.hook, 9) : ideaOf(facts.concept, facts.chunkName);
    return hook ? `${tag}. ${hook}` : tag;
  }

  if (authored && facts.ply === authored.ply) {
    const line = seed % 2 === 0 ? authored.hook : authored.punch;
    return `${tag}. ${limitWords(line, 9)}`;
  }

  const variants = [
    san ? `${san}. ${tag} — ${idea || "that's the job"}.` : `${tag}. ${idea}`,
    authored
      ? `${tag}. ${nugget(seed % 2 === 0 ? authored.hook : authored.punch, 8)}`
      : `${tag}. ${idea || facts.shortName}`,
    san ? `${tag} with ${san}. ${idea || "One square, one job."}` : `${tag}. ${idea}`,
  ].filter((line) => line.trim() && !looksLikeMoveList(line));
  return variants[seed % variants.length] || `${tag}. ${idea || facts.shortName}`;
}

function previousLine(facts: LessonFacts): string | undefined {
  if (facts.ply < 0) return undefined;
  const prior: LessonFacts = { ...facts, ply: facts.ply - 1, san: undefined };
  const purpose = inferPurpose(prior);
  return limitWords(composeBody(prior, purpose, hashSeed(prior)));
}

export function purposeBeats(facts: LessonFacts, soloText?: string): DialogueBeat[] {
  const purpose = inferPurpose(facts);
  const speaker = pickSpeaker(facts, purpose);
  let seed = hashSeed(facts);
  let text = composeBody(facts, purpose, seed);

  if (soloText?.trim() && facts.kind !== "ok" && facts.kind !== "start") {
    text = `${phrase(purpose, seed)}. ${nugget(soloText, 8)}`;
  }

  const prior = previousLine(facts);
  let guard = 0;
  while (prior && limitWords(text) === prior && guard < 4) {
    seed += 17;
    text = composeBody(facts, purpose, seed);
    guard += 1;
  }

  const beat: DialogueBeat = {
    speaker,
    text: withFloor(text, purpose),
    kind:
      facts.kind === "fail"
        ? "fail"
        : facts.kind === "hint"
          ? "hint"
          : facts.kind === "history"
            ? "history"
            : "teach",
    purpose,
  };

  const ask = askFromFacts(facts, speaker);
  if (ask) {
    return [
      beat,
      {
        speaker,
        text: limitWords("Quiz — what's the job here, not the name?"),
        kind: "quiz",
        ask,
        purpose,
      },
    ];
  }
  return [beat];
}
