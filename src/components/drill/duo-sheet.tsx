"use client";

import { X } from "lucide-react";
import { DuoPicker } from "@/components/home/duo-picker";
import type { DialogueMode, DuoId } from "@/lib/dialogue";

export function DuoSheet({
  duo,
  mode,
  onDuo,
  onMode,
  onClose,
}: {
  duo: DuoId;
  mode: DialogueMode;
  onDuo: (id: DuoId) => void;
  onMode: (mode: DialogueMode) => void;
  onClose: () => void;
}) {
  return (
    <div className="splash-root" role="dialog" aria-modal="true" aria-label="Teachers">
      <button type="button" className="splash-scrim" aria-label="Close teachers" onClick={onClose} />
      <div className="splash-card splash-in">
        <header className="splash-head">
          <div>
            <p className="text-[11px] font-medium tracking-[0.16em] text-amber-200/80 uppercase">
              Settings
            </p>
            <h2 className="text-[17px] font-semibold tracking-tight">
              Dual masters
            </h2>
          </div>
          <button type="button" className="study-close" onClick={onClose} aria-label="Close">
            <X className="size-3.5" />
            Close
          </button>
        </header>
        <p className="splash-copy">
          Two original teachers. They argue, quiz you, and land one takeaway.
          Solo is the older single-mentor script.
        </p>
        <div className="mode-row" role="tablist" aria-label="Dialogue mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "dual"}
            className={mode === "dual" ? "filter-chip filter-chip-on" : "filter-chip"}
            onClick={() => onMode("dual")}
          >
            Dual masters
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "solo"}
            className={mode === "solo" ? "filter-chip filter-chip-on" : "filter-chip"}
            onClick={() => onMode("solo")}
          >
            Solo mentor
          </button>
        </div>
        <DuoPicker value={duo} onChange={onDuo} compact />
      </div>
    </div>
  );
}
