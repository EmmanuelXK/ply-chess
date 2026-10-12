"use client";

export function PracticeMiss({
  played,
  book,
  reason,
}: {
  played: string;
  book: string;
  reason: string;
}) {
  return (
    <article className="practice-miss" data-testid="practice-miss" aria-live="polite">
      <div className="practice-side practice-passive">
        <span className="practice-mark" aria-hidden>
          ✕
        </span>
        <span className="practice-label">Passive</span>
        <strong>{played}</strong>
      </div>
      <div className="practice-side practice-active">
        <span className="practice-mark" aria-hidden>
          👍
        </span>
        <span className="practice-label">Active</span>
        <strong>{book}</strong>
      </div>
      <p className="practice-reason">{reason}</p>
    </article>
  );
}
