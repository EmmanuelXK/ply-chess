"use client";

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: "learn" | "practice";
  onChange: (mode: "learn" | "practice") => void;
}) {
  return (
    <div className="mode-toggle" role="group" aria-label="Learn or Practice" data-testid="mode-toggle">
      <button type="button" aria-pressed={mode === "learn"} onClick={() => onChange("learn")}>
        Learn
      </button>
      <button
        type="button"
        aria-pressed={mode === "practice"}
        onClick={() => onChange("practice")}
      >
        Practice
      </button>
    </div>
  );
}
