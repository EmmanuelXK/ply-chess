import Link from "next/link";
import { fullMoveCount, type Opening, type RepsMode } from "@/lib/openings";

export function OpeningTile({
  opening,
  reps = "spine",
}: {
  opening: Opening;
  reps?: RepsMode;
}) {
  const moves = fullMoveCount(opening);
  const href =
    reps === "spine"
      ? `/drill/${opening.id}`
      : `/drill/${opening.id}?reps=${reps}`;

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
      </p>
      <p className="dash-tile-chunk">{opening.chunks[0]?.name}</p>
    </Link>
  );
}
