import { Chess, validateFen, type Move } from "chess.js";

import {
  START_FEN,
  emptyTree,
  fenAt,
  mainlineEnd,
  type AnalysisTree,
  type MoveNode,
} from "./tree";

const RESULTS = new Set(["1-0", "0-1", "1/2-1/2", "*"]);

export function exportPgn(tree: AnalysisTree): string {
  const headers = ['[Event "EDGES"]', '[Site "https://blitzbar.app"]', '[Result "*"]'];
  if (tree.startFen !== START_FEN) {
    headers.push('[SetUp "1"]', `[FEN "${tree.startFen}"]`);
  }
  const moves = writeChildren(tree.children, 0, false);
  return `${headers.join("\n")}\n\n${moves}${moves ? " " : ""}*`;
}

export function exportFen(tree: AnalysisTree): string {
  return fenAt(tree);
}

/** Paste a FEN or a PGN. Returns null when the text is neither. */
export function importNotation(text: string): AnalysisTree | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (!trimmed.includes("[") && validateFen(trimmed).ok) {
    const chess = new Chess();
    chess.load(trimmed);
    return emptyTree(chess.fen());
  }
  const { fen, movetext } = splitPgn(trimmed);
  const start = fen && validateFen(fen).ok ? fen : fen ? null : START_FEN;
  if (!start) return null;
  const chess = new Chess();
  try {
    chess.load(start);
  } catch {
    return null;
  }
  const startFen = chess.fen();
  const tokens = tokenize(movetext);
  const children: MoveNode[] = [];
  parseLine(children, tokens, 0, chess, "");
  if (!children.length && !fen) return null;
  return {
    startFen,
    rootCp: null,
    rootMate: null,
    children,
    path: mainlineEnd(children),
  };
}

function writeChildren(nodes: readonly MoveNode[], ply: number, numberBlack: boolean): string {
  if (!nodes.length) return "";
  const [main, ...alts] = nodes;
  if (!main) return "";
  const parts = [moveText(ply, main.san, numberBlack)];
  for (const alt of alts) {
    parts.push(`(${writeChildren([alt], ply, true)})`);
  }
  const rest = writeChildren(main.children, ply + 1, alts.length > 0);
  if (rest) parts.push(rest);
  return parts.join(" ");
}

function moveText(ply: number, san: string, numberBlack: boolean): string {
  const n = Math.floor(ply / 2) + 1;
  if (ply % 2 === 0) return `${n}. ${san}`;
  if (numberBlack) return `${n}... ${san}`;
  return san;
}

function splitPgn(text: string): { fen: string | null; movetext: string } {
  let fen: string | null = null;
  const movetext = text.replace(/\[([A-Za-z0-9_]+)\s+"([^"]*)"\]/g, (_, key: string, value: string) => {
    if (key.toLowerCase() === "fen") fen = value;
    return " ";
  });
  return { fen, movetext };
}

function tokenize(movetext: string): string[] {
  const clean = movetext.replace(/\{[^}]*\}/g, " ").replace(/;[^\n]*/g, " ");
  const tokens: string[] = [];
  for (const piece of clean.split(/\s+/)) {
    if (!piece) continue;
    const bits = piece.match(/[()]|[^()]+/g) ?? [];
    for (const bit of bits) {
      if (bit === "(" || bit === ")") {
        tokens.push(bit);
        continue;
      }
      if (/^\d+\.+$/.test(bit) || /^\$\d+$/.test(bit) || RESULTS.has(bit)) continue;
      const san = bit.replace(/[!?]+$/, "");
      if (san) tokens.push(san);
    }
  }
  return tokens;
}

function parseLine(
  siblings: MoveNode[],
  tokens: string[],
  index: number,
  chess: Chess,
  parentId: string,
): number {
  let current: MoveNode | null = null;
  let heldBy = siblings;
  let heldParent = parentId;
  let nextContainer = siblings;
  let nextParent = parentId;
  let cursor = index;

  while (cursor < tokens.length) {
    const token = tokens[cursor];
    if (!token || token === ")") return cursor;
    if (token === "(") {
      if (!current) {
        cursor += 1;
        continue;
      }
      const restore = chess.fen();
      chess.undo();
      cursor += 1;
      cursor = parseLine(heldBy, tokens, cursor, chess, heldParent);
      if (tokens[cursor] === ")") cursor += 1;
      chess.load(restore);
      continue;
    }
    const played = tryMove(chess, token);
    if (!played) return cursor;
    const node = nodeFrom(played, nextParent);
    nextContainer.push(node);
    current = node;
    heldBy = nextContainer;
    heldParent = nextParent;
    nextContainer = node.children;
    nextParent = node.id;
    cursor += 1;
  }
  return cursor;
}

function tryMove(chess: Chess, san: string): Move | null {
  const normalized = san.replace(/0-0-0/g, "O-O-O").replace(/0-0/g, "O-O");
  try {
    return chess.move(normalized);
  } catch {
    return null;
  }
}

function nodeFrom(move: Move, parentId: string): MoveNode {
  const uci = `${move.from}${move.to}${move.promotion ?? ""}`;
  return {
    id: parentId ? `${parentId}/${uci}` : uci,
    san: move.san,
    uci,
    fen: move.after,
    children: [],
    cp: null,
    mate: null,
  };
}
