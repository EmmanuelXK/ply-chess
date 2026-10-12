import { Chess } from "chess.js";

import { userDrop, DROP_CP } from "@/lib/openings/audit";
import { isGambitSacrifice, moveIsAcceptedOffbeat, notesForLine } from "@/lib/openings/book";
import { firstSentence } from "@/lib/openings/helpers";
import type { BookLine, Opening, Side } from "@/lib/openings/types";

export interface StoredReply {
  san: string;
  lineId: string;
}

export interface UserMoveVerdict {
  ok: boolean;
  bookSan: string;
  lineId: string;
  /** One sentence from the book note, when the line has one. */
  reason: string;
}

function linesFrom(opening: Opening, prefix: readonly string[]): BookLine[] {
  return opening.lines.filter(
    (line) =>
      line.moves.length > prefix.length &&
      prefix.every((san, index) => line.moves[index] === san),
  );
}

function fenAfter(moves: readonly string[]): string {
  const chess = new Chess();
  for (const san of moves) {
    const played = chess.move(san);
    if (!played) break;
  }
  return chess.fen();
}

function sameMove(fen: string, left: string, right: string): boolean {
  if (left === right) return true;
  const uci = (san: string) => {
    try {
      const played = new Chess(fen).move(san);
      return played ? `${played.from}${played.to}${played.promotion ?? ""}` : null;
    } catch {
      return null;
    }
  };
  const played = uci(left);
  return played != null && played === uci(right);
}

function exempt(line: BookLine, ply: number): boolean {
  if (moveIsAcceptedOffbeat(line, ply)) return true;
  const san = line.moves[ply];
  return line.flaggedDrops.some(
    (mark) =>
      (mark.ply == null || mark.ply === ply) &&
      (mark.san == null || mark.san === san) &&
      isGambitSacrifice(mark),
  );
}

/** Centipawn loss for the repertoire side. Missing evals do not fail the rule. */
export function bookDrop(line: BookLine, ply: number, side: Side): number | null {
  const before = line.evals[ply];
  const after = line.evals[ply + 1];
  if (!before || !after) return null;
  return userDrop(before, after, side);
}

export function passesPawnRule(line: BookLine, ply: number, side: Side): boolean {
  const drop = bookDrop(line, ply, side);
  if (drop == null) return true;
  if (drop < DROP_CP) return true;
  return exempt(line, ply);
}

function noteReason(opening: Opening, line: BookLine, ply: number, san: string): string {
  const main = opening.lines[0] ?? line;
  const notes = notesForLine(line, main);
  const text = notes.find((note) => note.ply === ply && note.san === san)?.text?.trim();
  if (!text) return "Book move.";
  const sentence = firstSentence(text);
  return sentence.length > 160 ? `${sentence.slice(0, 157).trim()}…` : sentence;
}

/** Distinct stored replies at this position, mainline first. */
export function storedReplies(opening: Opening, prefix: readonly string[]): StoredReply[] {
  const seen = new Set<string>();
  const replies: StoredReply[] = [];
  for (const line of linesFrom(opening, prefix)) {
    const san = line.moves[prefix.length];
    if (!san || seen.has(san)) continue;
    seen.add(san);
    replies.push({ san, lineId: line.id });
  }
  return replies;
}

export function pickReply(
  replies: readonly StoredReply[],
  random: () => number = Math.random,
): StoredReply | null {
  if (!replies.length) return null;
  const index = Math.min(replies.length - 1, Math.floor(random() * replies.length));
  return replies[index] ?? null;
}

/**
 * The user plays their side. A move is accepted when a stored line continues
 * with it and that continuation is inside the 0.8-pawn rule (or a marked sacrifice).
 */
export function judgeUserMove(
  opening: Opening,
  side: Side,
  prefix: readonly string[],
  playedSan: string,
  currentLineId: string | null,
): UserMoveVerdict {
  const matches = linesFrom(opening, prefix);
  const current =
    matches.find((line) => line.id === currentLineId) ??
    opening.lines.find((line) => line.id === currentLineId) ??
    matches[0] ??
    opening.lines[0];
  const bookSan = current && current.moves.length > prefix.length ? current.moves[prefix.length] : "";
  const fen = fenAfter(prefix);
  const playedLine = matches.find((line) => sameMove(fen, line.moves[prefix.length] ?? "", playedSan));
  const ok = !!playedLine && passesPawnRule(playedLine, prefix.length, side);
  const reasonLine = (ok ? playedLine : current) ?? playedLine;
  return {
    ok,
    bookSan: bookSan || playedLine?.moves[prefix.length] || playedSan,
    lineId: (ok ? playedLine?.id : current?.id) ?? currentLineId ?? "",
    reason: reasonLine ? noteReason(opening, reasonLine, prefix.length, ok ? playedSan : bookSan) : "Book move.",
  };
}
