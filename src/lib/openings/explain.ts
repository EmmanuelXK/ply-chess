import { Chess, type Move, type Square } from "chess.js";
import type { Opening } from "./types";

const PIECE: Record<string, string> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

function who(color: "w" | "b"): string {
  return color === "w" ? "White" : "Black";
}

function other(color: "w" | "b"): "w" | "b" {
  return color === "w" ? "b" : "w";
}

function attacks(chess: Chess, square: Square): string[] {
  let verbose: Move[] = [];
  try {
    verbose = chess.moves({ square, verbose: true });
  } catch {
    return [];
  }
  const hits: string[] = [];
  for (const move of verbose) {
    if (!move.captured) continue;
    hits.push(`the ${PIECE[move.captured]} on ${move.to}`);
    if (hits.length === 2) break;
  }
  return hits;
}

function sentence(move: Move, after: Chess): string[] {
  const side = who(move.color);
  const piece = PIECE[move.piece];
  const lines: string[] = [];

  if (move.flags.includes("k")) {
    lines.push(`${side} castles kingside.`);
    lines.push("The king steps off the center and the rook enters on the f-file.");
  } else if (move.flags.includes("q")) {
    lines.push(`${side} castles queenside.`);
    lines.push("The king leaves the center and the rook takes a central file.");
  } else if (move.captured) {
    const victim = PIECE[move.captured];
    const passant = move.flags.includes("e") ? " en passant" : "";
    const promo = move.promotion ? ` and promotes to a ${PIECE[move.promotion]}` : "";
    lines.push(
      `${side} plays ${move.san}, the ${piece} from ${move.from} capturing the ${victim} on ${move.to}${passant}${promo}.`,
    );
    if (move.piece === "p" || move.captured === "p") {
      lines.push(`That capture changes the pawn on the ${move.to[0]}-file.`);
    }
  } else if (move.piece === "p") {
    const promo = move.promotion ? ` and promotes to a ${PIECE[move.promotion]}` : "";
    lines.push(`${side} advances the pawn from ${move.from} to ${move.to}${promo}.`);
    if ("de".includes(move.to[0]) && "45".includes(move.to[1])) {
      lines.push("The pawn takes space in the center.");
    } else {
      lines.push(`The new pawn on ${move.to} changes which pieces can step forward.`);
    }
  } else {
    lines.push(`${side} moves the ${piece} from ${move.from} to ${move.to}.`);
    const hits = attacks(after, move.to);
    if (hits.length) {
      lines.push(`From ${move.to} it attacks ${hits.join(" and ")}.`);
    } else {
      lines.push(`The ${piece} is developed and is no longer on ${move.from}.`);
    }
  }

  if (move.san.includes("#")) {
    lines.push("That is checkmate.");
  } else if (after.inCheck()) {
    lines.push(`${who(other(move.color))} is in check and has to answer.`);
  }

  return lines;
}

/** One plain explanation for the position after `ply` book moves. */
export function explainPly(opening: Opening, ply: number): string {
  if (ply <= 0) {
    return `${opening.name}. Starting position. White moves first, and this notebook follows the main line one move at a time.`;
  }
  const index = Math.min(ply, opening.moves.length) - 1;
  const chess = new Chess();
  for (let i = 0; i < index; i++) {
    const played = chess.move(opening.moves[i]);
    if (!played) return `${opening.name}. This ply is not a legal book move.`;
  }
  const move = chess.move(opening.moves[index]);
  if (!move) return `${opening.name}. This ply is not a legal book move.`;
  return sentence(move, chess).join(" ");
}
