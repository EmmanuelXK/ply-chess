"use client";

import type { LessonMode } from "@/lib/dialogue";

export function LessonSwitch({
  value,
  onChange,
}: {
  value: LessonMode;
  onChange: (mode: LessonMode) => void;
}) {
  return (
    <div className="mode-row" role="tablist" aria-label="Lesson mode">
      <button
        type="button"
        role="tab"
        aria-selected={value === "teach"}
        className={value === "teach" ? "filter-chip filter-chip-on" : "filter-chip"}
        onClick={() => onChange("teach")}
      >
        Teach
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "podcast"}
        className={
          value === "podcast" ? "filter-chip filter-chip-on" : "filter-chip"
        }
        onClick={() => onChange("podcast")}
      >
        Podcast
      </button>
    </div>
  );
}
