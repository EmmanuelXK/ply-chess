"use client";

import { useEffect } from "react";
import { PILLAR_LABELS, type Opening, type Trap } from "@/lib/openings";

export function StudySheet({
  opening,
  trapId,
  onClose,
  onSpine,
  onTrap,
}: {
  opening: Opening;
  trapId: string | null;
  onClose: () => void;
  onSpine: () => void;
  onTrap: (trap: Trap) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="study-sheet splash-in" role="dialog" aria-label="Book">
      <div className="study-sheet-top">
        <div>
          <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
            Six pillars
          </p>
          <h2 className="text-[18px] font-semibold tracking-tight">{opening.shortName}</h2>
        </div>
        <button type="button" className="study-close" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="study-note">{opening.story.plan}</p>
      <div className="pillar-list">
        {PILLAR_LABELS.map(([key, label]) => (
          <div key={key}>
            <h3 className="text-[11px] font-semibold tracking-[0.1em] text-amber-200 uppercase">
              {label}
            </h3>
            <p className="mt-1 text-[13px] leading-snug text-zinc-300">
              {opening.pillars[key]}
            </p>
          </div>
        ))}
      </div>
      <div className="trap-block">
        <h3>Traps</h3>
        <button
          type="button"
          className={!trapId ? "trap-chip trap-chip-on" : "trap-chip"}
          onClick={onSpine}
        >
          Spine
          <span className="trap-blurb">Main line to move 21. Then plan.</span>
        </button>
        {opening.traps.map((trap) => (
          <button
            key={trap.id}
            type="button"
            className={trapId === trap.id ? "trap-chip trap-chip-on" : "trap-chip"}
            onClick={() => onTrap(trap)}
          >
            {trap.name}
            <span className="trap-blurb">{trap.blurb}</span>
          </button>
        ))}
      </div>
      {opening.depthNote ? (
        <p className="study-depth">{opening.depthNote}</p>
      ) : null}
    </div>
  );
}
