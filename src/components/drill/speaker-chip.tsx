"use client";

import { getDuo, type DuoId } from "@/lib/dialogue";
import type { SpeakerId } from "@/lib/tts/types";

export function SpeakerChip({
  duoId,
  speaker,
}: {
  duoId: DuoId;
  speaker: SpeakerId;
}) {
  const duo = getDuo(duoId);
  const teacher = speaker === duo.right.id ? duo.right : duo.left;
  return (
    <span className={`speaker-chip speaker-${teacher.color} chip-${duoId}`}>
      <span className={`speaker-dot speaker-${teacher.color}`} aria-hidden />
      {teacher.short}
    </span>
  );
}
