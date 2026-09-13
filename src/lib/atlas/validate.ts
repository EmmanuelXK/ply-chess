import { Chess } from "chess.js";
import { getOpening } from "@/lib/openings";
import { ATLAS } from "./catalog";
import type { AtlasEntry } from "./types";

function playSan(label: string, san: string): string[] {
  const tokens = san
    .replace(/\d+\.(\.\.)?/g, " ")
    .replace(/[!?]+/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const chess = new Chess();
  const moves: string[] = [];
  for (const token of tokens) {
    try {
      const played = chess.move(token);
      if (!played) throw new Error("null");
      moves.push(played.san);
    } catch {
      throw new Error(`[atlas:${label}] illegal ${token}\n${chess.ascii()}`);
    }
  }
  return moves;
}

export function validateAtlas(entries: AtlasEntry[] = ATLAS) {
  const ids = new Set<string>();
  if (entries.length < 80 || entries.length > 120) {
    throw new Error(
      `atlas must have 80–120 openings, got ${entries.length}`,
    );
  }
  for (const entry of entries) {
    if (ids.has(entry.id)) throw new Error(`duplicate atlas id ${entry.id}`);
    ids.add(entry.id);
    if (!entry.routes.length) {
      throw new Error(`[${entry.id}] needs at least one key route`);
    }
    playSan(entry.id, entry.moves);
    for (const route of entry.routes) {
      playSan(`${entry.id}/${route.name}`, `${entry.moves} ${route.san}`);
    }
    if (entry.trainId && !getOpening(entry.trainId)) {
      throw new Error(`[${entry.id}] trainId ${entry.trainId} is not a drill`);
    }
    if (!entry.attacking.trim() || !entry.positional.trim()) {
      throw new Error(`[${entry.id}] missing 1250-friendly plans`);
    }
  }
}

export function atlasMoves(entry: AtlasEntry, routeSan = ""): string[] {
  return playSan(entry.id, `${entry.moves} ${routeSan}`.trim());
}
