"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { SplashBoard } from "@/components/drill/splash-board";
import { playLine } from "@/lib/chess/line";
import { speakProfessor } from "@/lib/chess/speak";
import {
  HISTORY_OPENER,
  historyFen,
  type HistoryMilestone,
  type Opening,
} from "@/lib/openings";

const GLYPH_LABEL: Record<HistoryMilestone["glyph"], string> = {
  paper: "Archive",
  immortal: "Immortal",
  evergreen: "Evergreen",
  debut: "Debut",
  revival: "Revival",
};

export function HistorySplash({
  opening,
  milestones,
  orientation,
  onClose,
}: {
  opening: Opening;
  milestones: HistoryMilestone[];
  orientation: "white" | "black";
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const milestone = milestones[Math.min(idx, milestones.length - 1)];

  const pos = useMemo(() => {
    if (!milestone) return playLine(opening.moves, 0);
    if (typeof milestone.plyOrFen === "number") {
      return playLine(opening.moves, milestone.plyOrFen);
    }
    const fen = historyFen(opening, milestone);
    return {
      fen,
      lastMove: null,
      check: false,
      turnColor: (fen.includes(" w ") ? "white" : "black") as "white" | "black",
    };
  }, [milestone, opening]);

  useEffect(() => {
    if (!milestone) return;
    const handle = speakProfessor(
      `${HISTORY_OPENER} ${milestone.summary} ${milestone.whyItMattersHere}`,
    );
    return () => handle.stop();
  }, [milestone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!milestone) return null;

  return (
    <div className="splash-root" role="dialog" aria-modal="true" aria-label="History">
      <button type="button" className="splash-scrim" aria-label="Close history" onClick={onClose} />
      <div className="splash-card splash-in history-card">
        <header className="splash-head">
          <div className="min-w-0">
            <p className="history-kicker">
              {GLYPH_LABEL[milestone.glyph]} · {milestone.era} · {milestone.year}
            </p>
            <h2 className="truncate text-[17px] font-semibold tracking-tight">
              {milestone.title}
            </h2>
          </div>
          <button type="button" className="study-close" onClick={onClose} aria-label="Close">
            <X className="size-3.5" />
            Close
          </button>
        </header>

        {milestones.length > 1 ? (
          <div className="history-tabs" role="tablist" aria-label="Milestones">
            {milestones.map((row, i) => (
              <button
                key={row.id}
                type="button"
                role="tab"
                aria-selected={i === idx}
                className={i === idx ? "history-tab history-tab-on" : "history-tab"}
                onClick={() => setIdx(i)}
              >
                {row.year}
              </button>
            ))}
          </div>
        ) : null}

        <p className="history-opener">{HISTORY_OPENER}</p>
        <p className="splash-copy">{milestone.summary}</p>
        <p className="history-here">{milestone.whyItMattersHere}</p>

        <div className="splash-board history-board">
          <SplashBoard
            fen={pos.fen}
            lastMove={pos.lastMove}
            orientation={orientation}
            turnColor={pos.turnColor}
            check={pos.check}
            animationMs={140}
          />
        </div>

        {milestone.famousGame ? (
          <p className="history-game">
            {milestone.famousGame.white} – {milestone.famousGame.black},{" "}
            {milestone.famousGame.year}
            {milestone.famousGame.eco ? ` · ${milestone.famousGame.eco}` : ""}
            {milestone.famousGame.result ? ` · ${milestone.famousGame.result}` : ""}
          </p>
        ) : null}

        <ul className="history-sources">
          {milestone.sources.map((src) => (
            <li key={src.url}>
              <a href={src.url} target="_blank" rel="noopener noreferrer">
                {src.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
