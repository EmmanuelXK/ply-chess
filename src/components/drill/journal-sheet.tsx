"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import {
  isJournalGame,
  listGames,
  pinHref,
  pinLabel,
  removePin,
  type JournalPin,
} from "@/lib/journal/store";

export function JournalList({
  onReplay,
  onChange,
}: {
  onReplay?: (pin: JournalPin) => void;
  onChange?: () => void;
}) {
  const [pins, setPins] = useState<JournalPin[]>(() => listGames());

  const refresh = () => {
    setPins(listGames());
    onChange?.();
  };

  if (!pins.length) {
    return (
      <p className="journal-empty">
        Spar the coach from a line. When the game ends, pin it with a short note.
        It comes back as a memory the next time you study that line.
      </p>
    );
  }

  return (
    <ul className="journal-list">
      {pins.map((pin) => (
        <li key={pin.id} className="journal-row">
          <Link
            href={pinHref(pin)}
            className="journal-open"
            onClick={(event) => {
              if (!onReplay || !isJournalGame(pin)) return;
              event.preventDefault();
              onReplay(pin);
            }}
          >
            <strong>{pinLabel(pin)}</strong>
            {pin.note ? <span>{pin.note}</span> : null}
            {pin.pgn ? <em>{pin.pgn.split("\n").at(-1)}</em> : null}
          </Link>
          <button
            type="button"
            className="journal-drop"
            aria-label="Remove game"
            onClick={() => {
              removePin(pin.id);
              refresh();
            }}
          >
            <X className="size-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function JournalSheet({
  onClose,
  onReplay,
  onChange,
}: {
  onClose: () => void;
  onReplay?: (pin: JournalPin) => void;
  onChange?: () => void;
}) {
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
      aria-label="Journal"
      data-testid="journal-sheet"
    >
      <button type="button" className="splash-scrim" aria-label="Close journal" onClick={onClose} />
      <div className="splash-card splash-in journal-card">
        <header className="splash-head">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.16em] text-[var(--ember)] uppercase">
              Journal
            </p>
            <h2 className="truncate text-[17px] font-semibold tracking-tight">
              Pinned games
            </h2>
          </div>
          <button type="button" className="study-close" onClick={onClose} aria-label="Close">
            <X className="size-3.5" />
            Close
          </button>
        </header>
        <JournalList
          onReplay={(pin) => {
            onReplay?.(pin);
            onClose();
          }}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
