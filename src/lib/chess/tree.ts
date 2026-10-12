import { Chess, type Move } from "chess.js";

export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export interface MoveNode {
  id: string;
  san: string;
  uci: string;
  /** Position after this move. */
  fen: string;
  children: MoveNode[];
  /** White's point of view, when known. */
  cp: number | null;
  mate: number | null;
  /** Stockfish's best move from the position after this move. */
  bestFrom: string | null;
}

export interface AnalysisTree {
  startFen: string;
  rootCp: number | null;
  rootMate: number | null;
  /** Stockfish's best move from the starting position. */
  rootBest: string | null;
  children: MoveNode[];
  /** Child indexes from the root to the cursor. Empty is the start position. */
  path: number[];
}

export interface ScoreMark {
  cp: number | null;
  mate: number | null;
  /** Best move from this position, when the book or a search stored one. */
  best?: string | null;
}

export interface SanBranch {
  san: string;
  children: SanBranch[];
}

export interface GraphPoint {
  path: number[];
  san: string | null;
  cp: number | null;
  mate: number | null;
}

export interface TreeCursor {
  fen: string;
  san: string | null;
  uci: string | null;
  lastMove: [string, string] | null;
  check: boolean;
  turn: "w" | "b";
}

export function emptyTree(startFen = START_FEN): AnalysisTree {
  return {
    startFen,
    rootCp: null,
    rootMate: null,
    rootBest: null,
    children: [],
    path: [],
  };
}

export function treeFromSans(
  startFen: string,
  sans: readonly string[],
  ply = sans.length,
  scores?: readonly ScoreMark[],
): AnalysisTree {
  const chess = new Chess(startFen);
  const tree = emptyTree(chess.fen());
  const root = scores?.[0];
  if (root) {
    tree.rootCp = root.cp;
    tree.rootMate = root.mate;
    tree.rootBest = root.best ?? null;
  }
  let parent: MoveNode | null = null;
  const path: number[] = [];
  for (let i = 0; i < sans.length; i++) {
    const move = trySan(chess, sans[i]);
    if (!move) break;
    const node = makeNode(move, parent?.id ?? "");
    const score = scores?.[i + 1];
    if (score) {
      node.cp = score.cp;
      node.mate = score.mate;
      node.bestFrom = score.best ?? null;
    }
    if (parent) parent.children.push(node);
    else tree.children.push(node);
    if (i < ply) path.push(0);
    parent = node;
  }
  tree.path = path.slice(0, Math.max(0, Math.min(ply, path.length)));
  return tree;
}

export function nodeAt(tree: AnalysisTree, path: readonly number[] = tree.path): MoveNode | null {
  let nodes = tree.children;
  let node: MoveNode | null = null;
  for (const index of path) {
    node = nodes[index] ?? null;
    if (!node) return null;
    nodes = node.children;
  }
  return node;
}

export function fenAt(tree: AnalysisTree, path: readonly number[] = tree.path): string {
  return nodeAt(tree, path)?.fen ?? tree.startFen;
}

export function sansAlong(tree: AnalysisTree, path: readonly number[] = tree.path): string[] {
  const sans: string[] = [];
  let nodes = tree.children;
  for (const index of path) {
    const node = nodes[index];
    if (!node) break;
    sans.push(node.san);
    nodes = node.children;
  }
  return sans;
}

export function sanTree(nodes: readonly MoveNode[]): SanBranch[] {
  return nodes.map((node) => ({ san: node.san, children: sanTree(node.children) }));
}

export function pathsEqual(left: readonly number[], right: readonly number[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function canStepBack(tree: AnalysisTree): boolean {
  return tree.path.length > 0;
}

export function canStepForward(tree: AnalysisTree): boolean {
  return cursorChildren(tree).length > 0;
}

export function canPromote(tree: AnalysisTree, path: readonly number[] = tree.path): boolean {
  return path.length > 0 && path.some((index) => index !== 0);
}

export function canDelete(tree: AnalysisTree, path: readonly number[] = tree.path): boolean {
  return path.length > 0 && nodeAt(tree, path) != null;
}

export function stepBack(tree: AnalysisTree): AnalysisTree {
  if (!tree.path.length) return tree;
  return { ...tree, path: tree.path.slice(0, -1) };
}

export function stepForward(tree: AnalysisTree): AnalysisTree {
  if (!cursorChildren(tree).length) return tree;
  return { ...tree, path: [...tree.path, 0] };
}

export function jumpTo(tree: AnalysisTree, path: readonly number[]): AnalysisTree {
  if (!nodeAt(tree, path) && path.length) return tree;
  if (pathsEqual(tree.path, path)) return tree;
  return { ...tree, path: [...path] };
}

export function playSan(tree: AnalysisTree, san: string): AnalysisTree {
  const chess = new Chess(fenAt(tree));
  const move = trySan(chess, san);
  if (!move) return tree;
  return commitMove(tree, move);
}

export function playUci(tree: AnalysisTree, uci: string): AnalysisTree {
  if (uci.length < 4) return tree;
  const chess = new Chess(fenAt(tree));
  const promotion = uci[4] as "q" | "r" | "b" | "n" | undefined;
  try {
    const move = chess.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: promotion || undefined,
    });
    if (!move) return tree;
    return commitMove(tree, move);
  } catch {
    return tree;
  }
}

export function playUcis(tree: AnalysisTree, ucis: readonly string[]): AnalysisTree {
  return ucis.reduce((next, uci) => playUci(next, uci), tree);
}

export function deleteNode(tree: AnalysisTree, path: readonly number[]): AnalysisTree {
  if (!path.length || !nodeAt(tree, path)) return tree;
  const parentPath = path.slice(0, -1);
  const index = path[path.length - 1] ?? 0;
  const children = editSiblings(tree.children, parentPath, (nodes) =>
    nodes.filter((_, item) => item !== index),
  );
  let nextPath = tree.path;
  if (startsWith(tree.path, path)) {
    nextPath = [...parentPath];
  } else if (startsWith(tree.path, parentPath) && (tree.path[parentPath.length] ?? -1) > index) {
    nextPath = tree.path.slice();
    nextPath[parentPath.length] = (nextPath[parentPath.length] ?? 1) - 1;
  }
  const next = { ...tree, children, path: nextPath };
  if (nextPath.length && !nodeAt(next)) {
    return { ...next, path: [...parentPath] };
  }
  return next;
}

/** Make this node, and each ancestor, the first child so the line becomes the mainline. */
export function promoteNode(tree: AnalysisTree, path: readonly number[]): AnalysisTree {
  if (!canPromote(tree, path) || !nodeAt(tree, path)) return tree;
  return {
    ...tree,
    children: promoteAlong(tree.children, path),
    path: path.map(() => 0),
  };
}

export function recordScore(
  tree: AnalysisTree,
  cp: number | null,
  mate: number | null,
  best?: string | null,
): AnalysisTree {
  if (!tree.path.length) {
    const rootBest = best === undefined ? tree.rootBest : best;
    if (tree.rootCp === cp && tree.rootMate === mate && tree.rootBest === rootBest) return tree;
    return { ...tree, rootCp: cp, rootMate: mate, rootBest };
  }
  let changed = false;
  const children = mapNode(tree.children, tree.path, (node) => {
    const bestFrom = best === undefined ? node.bestFrom : best;
    if (node.cp === cp && node.mate === mate && node.bestFrom === bestFrom) return node;
    changed = true;
    return { ...node, cp, mate, bestFrom };
  });
  if (!changed) return tree;
  return { ...tree, children };
}

/** Cursor, then the main continuation, for the eval graph. */
export function graphPoints(tree: AnalysisTree): GraphPoint[] {
  const points: GraphPoint[] = [
    { path: [], san: null, cp: tree.rootCp, mate: tree.rootMate },
  ];
  let nodes = tree.children;
  const walked: number[] = [];
  for (const index of tree.path) {
    const node = nodes[index];
    if (!node) return points;
    walked.push(index);
    points.push({ path: [...walked], san: node.san, cp: node.cp, mate: node.mate });
    nodes = node.children;
  }
  while (nodes[0]) {
    const node = nodes[0];
    walked.push(0);
    points.push({ path: [...walked], san: node.san, cp: node.cp, mate: node.mate });
    nodes = node.children;
  }
  return points;
}

export function cursorOf(tree: AnalysisTree): TreeCursor {
  const node = nodeAt(tree);
  const fen = node?.fen ?? tree.startFen;
  const chess = new Chess(fen);
  const uci = node?.uci ?? null;
  const lastMove =
    uci && uci.length >= 4
      ? ([uci.slice(0, 2), uci.slice(2, 4)] as [string, string])
      : null;
  return {
    fen,
    san: node?.san ?? null,
    uci,
    lastMove,
    check: chess.inCheck(),
    turn: chess.turn(),
  };
}

export function mainlineEnd(children: readonly MoveNode[]): number[] {
  const path: number[] = [];
  let nodes = children;
  while (nodes[0]) {
    path.push(0);
    nodes = nodes[0].children;
  }
  return path;
}

function cursorChildren(tree: AnalysisTree): MoveNode[] {
  return nodeAt(tree)?.children ?? tree.children;
}

function commitMove(tree: AnalysisTree, move: Move): AnalysisTree {
  const uci = uciOf(move);
  const siblings = cursorChildren(tree);
  const existing = siblings.findIndex((node) => node.uci === uci);
  if (existing >= 0) return { ...tree, path: [...tree.path, existing] };
  const parent = nodeAt(tree);
  const node = makeNode(move, parent?.id ?? "");
  const children = editSiblings(tree.children, tree.path, (nodes) => [...nodes, node]);
  return { ...tree, children, path: [...tree.path, siblings.length] };
}

function makeNode(move: Move, parentId: string): MoveNode {
  const uci = uciOf(move);
  return {
    id: parentId ? `${parentId}/${uci}` : uci,
    san: move.san,
    uci,
    fen: move.after,
    children: [],
    cp: null,
    mate: null,
    bestFrom: null,
  };
}

function uciOf(move: Move): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

function trySan(chess: Chess, san: string): Move | null {
  const normalized = san.replace(/0-0-0/g, "O-O-O").replace(/0-0/g, "O-O").replace(/[!?]+$/, "");
  try {
    return chess.move(normalized);
  } catch {
    return null;
  }
}

function editSiblings(
  nodes: MoveNode[],
  parentPath: readonly number[],
  fn: (nodes: MoveNode[]) => MoveNode[],
): MoveNode[] {
  if (!parentPath.length) return fn(nodes);
  const [head, ...rest] = parentPath;
  return nodes.map((node, index) => {
    if (index !== head) return node;
    return { ...node, children: editSiblings(node.children, rest, fn) };
  });
}

function mapNode(
  nodes: MoveNode[],
  path: readonly number[],
  fn: (node: MoveNode) => MoveNode,
): MoveNode[] {
  if (!path.length) return nodes;
  const [head, ...rest] = path;
  return nodes.map((node, index) => {
    if (index !== head) return node;
    if (!rest.length) return fn(node);
    return { ...node, children: mapNode(node.children, rest, fn) };
  });
}

function promoteAlong(nodes: MoveNode[], path: readonly number[]): MoveNode[] {
  if (!path.length) return nodes;
  const [head, ...rest] = path;
  if (head == null || head < 0 || head >= nodes.length) return nodes;
  const chosen = nodes[head];
  if (!chosen) return nodes;
  const reordered = [chosen, ...nodes.filter((_, index) => index !== head)];
  if (!rest.length) return reordered;
  return reordered.map((node, index) =>
    index === 0 ? { ...node, children: promoteAlong(node.children, rest) } : node,
  );
}

function startsWith(path: readonly number[], prefix: readonly number[]): boolean {
  return prefix.every((value, index) => path[index] === value);
}
