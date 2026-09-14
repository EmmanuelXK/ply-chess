import Link from "next/link";
import { WeaponMark } from "@/components/home/weapon-mark";
import {
  openingKind,
  parseStudyMode,
  studyHref,
  type Opening,
  type RepsMode,
} from "@/lib/openings";
import { STUDY_MODES } from "@/lib/reps/schedule";

export function OpeningTile({
  opening,
  reps = "learn",
  due = 0,
  showProgress = false,
}: {
  opening: Opening;
  reps?: RepsMode;
  due?: number;
  best?: number;
  showProgress?: boolean;
}) {
  const mode = parseStudyMode(typeof reps === "string" ? reps : "learn");
  const href = studyHref(opening.id, mode);
  const modeLabel =
    STUDY_MODES.find((item) => item.id === mode)?.label ?? "Learn";
  const kind = openingKind(opening.id) === "system" ? "System" : "Semi";
  const dueNote = showProgress && due > 0 ? ` ${due} due.` : "";

  return (
    <Link
      href={href}
      className="weapon-tile"
      data-opening={opening.id}
      aria-label={`${opening.shortName}. ${kind}. ${modeLabel}.${dueNote}`}
    >
      <span className="weapon-mark-wrap">
        <WeaponMark opening={opening} />
        {showProgress && due > 0 ? (
          <span className="weapon-due">{due}</span>
        ) : null}
      </span>
      <span className="weapon-name">{opening.shortName}</span>
      <span className="weapon-kind">{kind}</span>
    </Link>
  );
}
