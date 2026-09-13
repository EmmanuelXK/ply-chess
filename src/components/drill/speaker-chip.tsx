"use client";

import { PURPOSE_LABELS, type PurposeTag } from "@/lib/dialogue";

export function SpeakerChip({
  purpose,
}: {
  purpose?: PurposeTag;
  speaker?: string;
  duoId?: string;
}) {
  return (
    <span className="speaker-chip speaker-amber">
      <span className="speaker-dot speaker-amber" aria-hidden />
      {purpose ? PURPOSE_LABELS[purpose] : "Coach"}
    </span>
  );
}
