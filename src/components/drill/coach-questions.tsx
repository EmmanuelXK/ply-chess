"use client";

import type { DrillTriad } from "@/lib/openings";

export function CoachQuestions({
  plan,
  theyMoved,
  secondBest,
  triad,
  compact = false,
}: {
  plan: string;
  theyMoved: string;
  secondBest: string;
  triad?: DrillTriad;
  compact?: boolean;
}) {
  return (
    <div
      className={compact ? "coach-q coach-q-compact" : "coach-q"}
      data-testid="coach-questions"
    >
      <p>
        <span className="coach-q-kicker">Plan</span>
        {plan}
      </p>
      <p>
        <span className="coach-q-kicker">Their idea</span>
        {theyMoved}
      </p>
      <p>
        <span className="coach-q-kicker">If you miss</span>
        {secondBest}
      </p>
      {triad ? (
        <ul className="coach-triad" data-testid="coach-triad">
          <li>
            <span>Do</span>
            {triad.do}
          </li>
          <li>
            <span>Prevent</span>
            {triad.prevent}
          </li>
          <li>
            <span>Their reply</span>
            {triad.reply}
          </li>
        </ul>
      ) : null}
    </div>
  );
}
