import { firstSentence } from "@/lib/openings/helpers";
import { MAX_BEAT_WORDS } from "./types";

const PROFESSOR_LEAK =
  /\b(why this ages well|the plan has two layers|why:\s|next:\s|i'm watching the soft move|don't monologue it back|that's the positional job|not a random tactic|in this opening that square-job)\b/gi;

const SAN_LEAD = /^(?:[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8][+#]?|O-O-O|O-O|…[a-h1-8NBRQKO×x-]+)\s*[—–-]\s*/;

export function wordsOf(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

export function wordCount(text: string): number {
  return wordsOf(text).length;
}

export function stripProfessor(text: string): string {
  return text
    .replace(PROFESSOR_LEAK, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Hard cap. Keeps a few short sentences if they still fit; never trailing ellipsis. */
export function limitWords(text: string, max = MAX_BEAT_WORDS): string {
  const cleaned = stripProfessor(text.replace(/\s+/g, " ").trim());
  if (!cleaned) return "";
  const all = wordsOf(cleaned);
  if (all.length <= max) return cleaned;
  const sentence = firstSentence(cleaned);
  const sentenceWords = wordsOf(sentence);
  if (sentenceWords.length >= 6 && sentenceWords.length <= max) {
    return sentence;
  }
  return all.slice(0, max).join(" ").replace(/[—,;:]+$/, "");
}

/** Core positional idea only — never a dumped SAN list or professor paragraph. */
export function nugget(text: string | undefined, max = 8): string {
  if (!text) return "";
  const stripped = stripProfessor(text).replace(SAN_LEAD, "");
  const sentence = firstSentence(stripped);
  const clause = sentence.split(/[.;:]/)[0] ?? sentence;
  return limitWords(clause, max);
}

export function withSan(san: string | undefined, body: string, max = MAX_BEAT_WORDS): string {
  const idea = nugget(body, san ? max - 1 : max);
  if (!san) return idea;
  if (!idea) return limitWords(san, max);
  if (idea.toLowerCase().startsWith(san.toLowerCase())) return limitWords(idea, max);
  return limitWords(`${san}. ${idea}`, max);
}
