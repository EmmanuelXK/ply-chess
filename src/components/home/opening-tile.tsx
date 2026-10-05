import Link from "next/link";
import { WeaponMark } from "@/components/home/weapon-mark";
import { openingKind, studyHref, type Opening } from "@/lib/openings";

export function OpeningTile({ opening }: { opening: Opening }) {
  const href = studyHref(opening.id, "learn");
  const kind = openingKind(opening.id) === "system" ? "System" : "Semi";

  return (
    <Link
      href={href}
      className="weapon-tile"
      data-opening={opening.id}
      aria-label={`${opening.shortName}. ${kind}. Learn.`}
    >
      <span className="weapon-mark-wrap">
        <WeaponMark opening={opening} />
      </span>
      <span className="weapon-name">{opening.shortName}</span>
      <span className="weapon-kind">{kind}</span>
    </Link>
  );
}
