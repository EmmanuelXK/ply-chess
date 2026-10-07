"use client";

import { useEffect } from "react";
import {
  openingDossier,
  PILLAR_LABELS,
  type Opening,
} from "@/lib/openings";

export function StudySheet({
  opening,
  trapId,
  onClose,
  onSpine,
  onLine,
}: {
  opening: Opening;
  trapId: string | null;
  onClose: () => void;
  onSpine: () => void;
  onLine: (lineId: string) => void;
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
          <p className="sheet-kicker">Six pillars</p>
          <h2 className="sheet-title">{opening.shortName}</h2>
        </div>
        <button type="button" className="study-close" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="study-dossier">{openingDossier(opening)}</p>
      <p className="study-note">{opening.story.plan}</p>
      <div className="pillar-list">
        {PILLAR_LABELS.map(([key, label]) => (
          <div key={key}>
            <h3 className="sheet-label">{label}</h3>
            <p className="sheet-copy">{opening.pillars[key]}</p>
          </div>
        ))}
      </div>
      <div className="trap-block">
        <h3>Lines</h3>
        {opening.lines.map((line, index) => {
          const id = index === 0 ? null : line.id;
          const on = (trapId ?? null) === id;
          return (
            <button
              key={line.id}
              type="button"
              className={on ? "trap-chip trap-chip-on" : "trap-chip"}
              onClick={() => (id ? onLine(id) : onSpine())}
            >
              {index === 0 ? opening.shortName : line.label}
              <span className="trap-blurb">{line.eco.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
