import Link from "next/link";
import {
  fullMoveCount,
  openingKind,
  parseStudyMode,
  type Opening,
  type RepsMode,
} from "@/lib/openings";

export function OpeningTile({
  opening,
  reps = "learn",
  due = 0,
  best = 0,
  showProgress = false,
}: {
  opening: Opening;
  reps?: RepsMode;
  due?: number;
  best?: number;
  showProgress?: boolean;
}) {
  const moves = fullMoveCount(opening);
  const kind = openingKind(opening.id);
  const mode = parseStudyMode(typeof reps === "string" ? reps : "learn");
  const href =
    mode === "learn"
      ? `/drill/${opening.id}`
      : `/drill/${opening.id}?reps=${mode}`;

  return (
    <Link
      href={href}
      className={`dash-tile dash-tile-${opening.family}`}
      aria-label={`${opening.name}. You play ${opening.side === "white" ? "White" : "Black"}. ${moves} moves.`}
    >
      <p className="dash-tile-kicker">
        {opening.side === "white" ? "White" : "Black"}
        {opening.versus ? ` · ${opening.versus}` : ""}
      </p>
      <h3>{opening.shortName}</h3>
      <p className="dash-tile-meta">
        {moves}m · {opening.traps.length} traps
        {showProgress && best > 0 ? ` · ply ${best}` : ""}
        {showProgress && due > 0 ? ` · ${due} due` : ""}
      </p>
      <p className="dash-tile-chunk">
        <span className="dash-tile-kind">{kind === "system" ? "System" : "Semi"}</span>
        {opening.chunks[0]?.name ? ` · ${opening.chunks[0].name}` : ""}
      </p>
    </Link>
  );
}
