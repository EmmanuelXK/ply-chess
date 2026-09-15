"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { NOTE_MAX } from "@/lib/journal/store";

export function PinSheet({
  summary,
  onPin,
  onClose,
  onOpenJournal,
}: {
  summary: string;
  onPin: (note: string) => void;
  onClose: () => void;
  onOpenJournal: () => void;
}) {
  const [note, setNote] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="splash-root"
      role="dialog"
      aria-modal="true"
      aria-label="Pin this moment"
      data-testid="pin-sheet"
    >
      <button type="button" className="splash-scrim" aria-label="Close pin" onClick={onClose} />
      <div className="splash-card splash-in journal-card">
        <header className="splash-head">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.16em] text-[var(--ember)] uppercase">
              Journal
            </p>
            <h2 className="truncate text-[17px] font-semibold tracking-tight">
              Pin this moment
            </h2>
          </div>
          <button type="button" className="study-close" onClick={onClose} aria-label="Close">
            <X className="size-3.5" />
            Close
          </button>
        </header>
        <p className="splash-copy journal-summary">{summary}</p>
        <label className="journal-note-label" htmlFor="journal-note">
          Little note
        </label>
        <textarea
          id="journal-note"
          className="journal-note"
          rows={3}
          maxLength={NOTE_MAX}
          placeholder="What you want to remember"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="coach-explain-toggle" role="group" aria-label="Save pin">
          <button
            type="button"
            className="explain-mode"
            data-testid="pin-sheet-journal"
            onClick={onOpenJournal}
          >
            Journal
          </button>
          <button
            type="button"
            className="explain-mode explain-mode-on"
            data-testid="pin-sheet-save"
            onClick={() => onPin(note)}
          >
            Pin
          </button>
        </div>
      </div>
    </div>
  );
}
