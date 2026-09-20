import { fullMoveCount, openingKind } from "./helpers";
import type { Opening } from "./types";
import { parseStudyMode } from "@/lib/reps/schedule";

/** Facts that used to crowd home tiles — shown when the player enters Learn. */
export function openingDossier(opening: Opening): string {
  const kind = openingKind(opening.id) === "system" ? "System" : "Semi";
  const side = opening.side === "white" ? "White" : "Black";
  const vs = opening.versus ? ` · ${opening.versus}` : "";
  return `${kind} · ${side}${vs} · ${fullMoveCount(opening)}m · ${opening.traps.length} traps`;
}

export function openingHouses(opening: Opening): string {
  return opening.chunks.map((chunk) => chunk.name).join(" · ");
}

export function studyHref(id: string, mode?: string | null): string {
  const resolved = parseStudyMode(mode);
  const drill = resolved === "progress" ? "reps" : resolved;
  return drill === "learn" ? `/drill/${id}` : `/drill/${id}?reps=${drill}`;
}
