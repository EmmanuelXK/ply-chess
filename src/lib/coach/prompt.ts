export interface CoachPosition {
  fen: string;
  line: string;
  matchup: string;
  moves: string[];
  side: "white" | "black" | null;
  evalCp: number | null;
  evalMate: number | null;
  evalDepth: number | null;
  best: string | null;
  note: string | null;
}

export const COACH_SYSTEM = [
  "You are the opening coach inside EDGES, a personal chess notebook.",
  "Answer one short question about the position you are given.",
  "Ground every claim in the Stockfish evaluation, the Stockfish best move, the move list, and the teaching note in the user message.",
  "Do not invent variations, tactics, or move orders that are not in that data. If the player asks about a move the data does not cover, say the book and the engine data do not recommend it, then point at the stored best move and the note.",
  "Keep the answer to at most four short sentences.",
  "Reply in the language the user writes in. English and Sinhala both work. If the question is in Sinhala, answer in Sinhala. If it is in English, answer in English.",
  "No accounts, no quizzes, no streaks.",
  "Return one JSON object and nothing else: {\"text\":\"...\",\"arrows\":[\"f1c4\"],\"squares\":[\"f7\"]}.",
  "text is the spoken answer. arrows are UCI moves that are each legal from the given FEN. squares are board squares the answer mentions. Use empty arrays when you are not pointing at a move. Do not send a multi-move line, and do not invent an illegal move.",
].join(" ");

function formatEval(cp: number | null, mate: number | null): string {
  if (mate != null && mate !== 0) {
    return mate > 0 ? `White mates in ${mate}` : `Black mates in ${Math.abs(mate)}`;
  }
  if (cp == null || !Number.isFinite(cp)) return "not stored";
  const pawns = cp / 100;
  const text = Math.abs(pawns).toFixed(2);
  if (pawns > 0) return `+${text} from White's side`;
  if (pawns < 0) return `-${text} from White's side`;
  return "0.00";
}

export function formatMoveList(moves: readonly string[]): string {
  if (!moves.length) return "(starting position)";
  const parts: string[] = [];
  for (let index = 0; index < moves.length; index += 1) {
    const san = moves[index];
    if (!san) continue;
    if (index % 2 === 0) parts.push(`${index / 2 + 1}. ${san}`);
    else parts.push(san);
  }
  return parts.join(" ");
}

/** The user turn sent with every question. The system prompt stays fixed. */
export function coachUserPrompt(position: CoachPosition, question: string): string {
  const depth =
    position.evalDepth && position.evalDepth > 0 ? `depth ${position.evalDepth}` : "depth not stored";
  return [
    `Line: ${position.line || "Untitled"}`,
    `Matchup: ${position.matchup || "Not named"}`,
    `User side: ${position.side ?? "not set"}`,
    `Moves: ${formatMoveList(position.moves)}`,
    `FEN: ${position.fen}`,
    `Stockfish eval: ${formatEval(position.evalCp, position.evalMate)} (${depth})`,
    `Stockfish best move: ${position.best?.trim() || "not stored"}`,
    `Teaching note: ${position.note?.trim() || "none stored"}`,
    `Question: ${question.trim()}`,
  ].join("\n");
}
