"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { NOTE_MAX } from "@/lib/journal/store";

export function PinSheet({
  result,
  summary,
  onPin,
  onSkip,
}: {
  result: string;
  summary: string;
  onPin: (note: string) => void;
  onSkip: () => void;
}) {
  const [note, setNote] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSkip]);

  return (
    <div
      className="splash-root"
      role="dialog"
      aria-modal="true"
      aria-label="Pin this game"
      data-testid="save-game-sheet"
    >
      <button type="button" className="splash-scrim" aria-label="Skip pin" onClick={onSkip} />
      <div className="splash-card splash-in journal-card">
        <header className="splash-head">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.16em] text-[var(--ember)] uppercase">
              Journal
            </p>
            <h2 className="truncate text-[17px] font-semibold tracking-tight">
              Pin this game
            </h2>
          </div>
          <button type="button" className="study-close" onClick={onSkip} aria-label="Skip">
            <X className="size-3.5" />
            Skip
          </button>
        </header>
        <p className="splash-copy journal-summary">
          {result} · {summary}
        </p>
        <label className="journal-note-label" htmlFor="journal-note">
          Little note
        </label>
        <textarea
          id="journal-note"
          className="journal-note"
          rows={3}
          maxLength={NOTE_MAX}
          placeholder="What you were thinking"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="coach-explain-toggle" role="group" aria-label="Save game">
          <button
            type="button"
            className="explain-mode"
            data-testid="save-game-skip"
            onClick={onSkip}
          >
            Skip
          </button>
          <button
            type="button"
            className="explain-mode explain-mode-on"
            data-testid="save-game-pin"
            onClick={() => onPin(note)}
          >
            Pin
          </button>
        </div>
      </div>
    </div>
  );
}
