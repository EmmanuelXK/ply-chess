"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import {
  listPins,
  pinHref,
  pinLabel,
  removePin,
  type JournalPin,
} from "@/lib/journal/store";

export function JournalList({
  onOpen,
  onChange,
}: {
  onOpen?: (pin: JournalPin) => void;
  onChange?: () => void;
}) {
  const [pins, setPins] = useState<JournalPin[]>(() => listPins());

  const refresh = () => {
    setPins(listPins());
    onChange?.();
  };

  if (!pins.length) {
    return (
      <p className="journal-empty">
        Pin a position from the board. A line for later — not a feed.
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
            onClick={() => onOpen?.(pin)}
          >
            <strong>{pinLabel(pin)}</strong>
            {pin.note ? <span>{pin.note}</span> : pin.coachText ? <span>{pin.coachText}</span> : null}
            {pin.pgn ? <em>{pin.pgn}</em> : null}
          </Link>
          <button
            type="button"
            className="journal-drop"
            aria-label="Remove pin"
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
}: {
  onClose: () => void;
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
              Pinned moments
            </h2>
          </div>
          <button type="button" className="study-close" onClick={onClose} aria-label="Close">
            <X className="size-3.5" />
            Close
          </button>
        </header>
        <JournalList onOpen={onClose} />
      </div>
    </div>
  );
}
