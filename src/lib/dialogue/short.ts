import { firstSentence } from "@/lib/openings/helpers";

export const MAX_BEAT_WORDS = 15;

export function wordCount(text: string): number {
  return text
    .replace(/[—–]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/** First clause, hard-capped so listening stays faster than memorizing. */
export function capWords(text: string, max = MAX_BEAT_WORDS): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact) return "";
  const all = compact.split(/\s+/).filter(Boolean);
  if (all.length <= max) return compact;
  const sentence = firstSentence(compact);
  const words = sentence.split(/\s+/).filter(Boolean);
  if (words.length <= max) return words.join(" ");
  return `${words.slice(0, max).join(" ").replace(/[,:;]+$/, "")}.`;
}

export function hashKey(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Argue about 1 in 4–5 normal plies. Fails always push back. */
export function shouldArgue(
  openingId: string,
  ply: number,
  kind: string,
): boolean {
  if (kind === "fail") return true;
  if (kind === "hint" || kind === "quiz") return false;
  return hashKey(`${openingId}:${ply}:${kind}`) % 5 === 0;
}
