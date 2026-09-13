"use client";

import { useEffect, useState } from "react";
import { speakDialogue } from "@/lib/chess/speak";
import { SpeakerChip } from "@/components/drill/speaker-chip";
import {
  dialogueForQuizReaction,
  getDuo,
  type DialogueMode,
  type DuoId,
} from "@/lib/dialogue";
import type { Opening, PositionalQuiz } from "@/lib/openings";

export function QuizSheet({
  quiz,
  opening,
  duo,
  mode,
  onClose,
}: {
  quiz: PositionalQuiz;
  opening: Opening;
  duo: DuoId;
  mode: DialogueMode;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const chosen = quiz.choices.find((c) => c.id === picked);
  const pack = getDuo(duo);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="splash-root" role="dialog" aria-modal="true" aria-label="Quiz">
      <button type="button" className="splash-scrim" aria-label="Close quiz" onClick={onClose} />
      <div className="splash-card splash-in">
        <header className="splash-head">
          <div>
            <p className="text-[11px] font-medium tracking-[0.16em] text-emerald-200/80 uppercase">
              Quiz
            </p>
            <h2 className="text-[17px] font-semibold tracking-tight">
              Positional, not trivia
            </h2>
          </div>
          <button type="button" className="study-close" onClick={onClose}>
            Close
          </button>
        </header>
        <p className="splash-copy">
          <SpeakerChip duoId={duo} speaker={pack.right.id} /> {quiz.prompt}
        </p>
        <div className="quiz-choices">
          {quiz.choices.map((choice) => {
            const state =
              picked == null
                ? ""
                : choice.correct
                  ? " quiz-right"
                  : choice.id === picked
                    ? " quiz-wrong"
                    : "";
            return (
              <button
                key={choice.id}
                type="button"
                className={`quiz-choice${state}`}
                onClick={() => {
                  if (picked) return;
                  setPicked(choice.id);
                  const scene = dialogueForQuizReaction(
                    opening,
                    choice.reaction,
                    choice.correct,
                    { duo, mode },
                  );
                  speakDialogue(scene.beats, { premium: mode === "dual" });
                }}
              >
                {choice.text}
              </button>
            );
          })}
        </div>
        {chosen ? (
          <p className={`quiz-react ${chosen.correct ? "quiz-react-ok" : "quiz-react-no"}`}>
            <SpeakerChip
              duoId={duo}
              speaker={chosen.correct ? pack.left.id : pack.right.id}
            />{" "}
            {chosen.reaction}
          </p>
        ) : null}
      </div>
    </div>
  );
}
