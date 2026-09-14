import { chunkAt, firstSentence, looksLikeMoveList } from "./helpers";
import type { Chunk, Opening, Pin } from "./types";

/** One-image picture for a house. Never a dumped move list. */
export function housePicture(chunk?: Chunk): string {
  if (!chunk) return "One house. One job.";
  const job = (chunk.job ?? "").replace(/\s+/g, " ").trim();
  if (job && !looksLikeMoveList(job)) {
    const sentence = firstSentence(job);
    const sentenceWords = sentence.split(" ").filter(Boolean);
    if (sentenceWords.length >= 6) return sentence;
    const all = job.split(" ").filter(Boolean);
    if (all.length >= 6) return all.slice(0, 15).join(" ");
    if (sentenceWords.length >= 1) {
      const extra = (chunk.name && !looksLikeMoveList(chunk.name) ? chunk.name : "")
        .split(" ")
        .filter(Boolean);
      const mixed = [...sentenceWords, ...extra].slice(0, 15).join(" ");
      if (mixed.split(" ").filter(Boolean).length >= 6) return mixed;
    }
  }
  if (!looksLikeMoveList(chunk.name) && chunk.name.split(" ").filter(Boolean).length >= 6) {
    return chunk.name;
  }
  if (!looksLikeMoveList(chunk.name)) {
    return `${chunk.name}. One house, one job.`;
  }
  return "Coil the pieces. Then strike.";
}

export function housePictureAt(opening: Opening, ply: number): string {
  return housePicture(chunkAt(opening, Math.max(0, ply)));
}

/** Journey speech — landmarks, not ply numbers. */
export function pinSpeech(pin?: Pin): string {
  if (!pin?.label) return "Hold this landmark.";
  const label = pin.label.trim();
  if (/^at /i.test(label)) return label;
  return `at ${label}`;
}

export function storyLine(opening: Opening): string {
  return `${opening.story.cast} ${opening.story.conflict}`;
}

export function chunkIndexAt(opening: Opening, ply: number): number {
  const chunk = chunkAt(opening, Math.max(0, ply));
  if (!chunk) return 0;
  return Math.max(0, opening.chunks.indexOf(chunk));
}

export function visualLine(
  opening: Opening,
  afterPly: number,
  kind: "start" | "pin" | "house" | "ok",
): string {
  const chunk = chunkAt(opening, Math.max(0, afterPly));
  const picture = housePicture(chunk);
  if (kind === "start") {
    return firstSentence(opening.story.cast);
  }
  if (kind === "pin") {
    const pin = opening.pins.find((p) => p.afterPly === afterPly);
    return `${pinSpeech(pin)} ${picture}`.trim();
  }
  if (kind === "house") {
    return picture;
  }
  return picture;
}
