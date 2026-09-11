"use client";

import type { HybridAdvice } from "@/lib/engines/types";

export function HumanPlan({ advice }: { advice: HybridAdvice | null }) {
  if (!advice) {
    return <p className="human-copy">Reading the position…</p>;
  }

  return (
    <div className="human-panel">
      <p className="human-kicker">{advice.headline}</p>
      <p className="human-copy">{advice.detail}</p>
      <ul className="engine-votes">
        {advice.votes.map((vote) => (
          <li key={vote.id}>
            <span>{vote.label}</span>
            <strong>{vote.move?.san ?? "—"}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
