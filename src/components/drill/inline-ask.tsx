"use client";

import type { DialogueAsk } from "@/lib/dialogue";

export function InlineAsk({
  ask,
  picked,
  onPick,
}: {
  ask: DialogueAsk;
  picked: string | null;
  onPick: (id: string) => void;
}) {
  return (
    <div className="inline-ask" role="group" aria-label={ask.prompt}>
      {ask.choices.map((choice) => {
        const state =
          picked == null
            ? ""
            : choice.correct
              ? " inline-ask-right"
              : choice.id === picked
                ? " inline-ask-wrong"
                : "";
        return (
          <button
            key={choice.id}
            type="button"
            className={`inline-ask-btn${state}`}
            disabled={picked != null}
            onClick={() => onPick(choice.id)}
          >
            {choice.text}
          </button>
        );
      })}
    </div>
  );
}
