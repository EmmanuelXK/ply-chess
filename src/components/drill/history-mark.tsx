"use client";

export function HistoryMark({
  glyph = "paper",
  onClick,
  label = "History",
}: {
  glyph?: "paper" | "immortal" | "evergreen" | "debut" | "revival";
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={`history-mark history-${glyph}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span className="history-mark-sheet" aria-hidden />
    </button>
  );
}
