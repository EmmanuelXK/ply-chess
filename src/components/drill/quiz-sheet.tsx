"use client";

import { useEffect, useState } from "react";
import { speakProfessor } from "@/lib/chess/speak";
import type { PositionalQuiz } from "@/lib/openings";

export function QuizSheet({
  quiz,
  onClose,
}: {
  quiz: PositionalQuiz;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const chosen = quiz.choices.find((c) => c.id === picked);

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
        <p className="splash-copy">{quiz.prompt}</p>
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
                  speakProfessor(choice.reaction);
                }}
              >
                {choice.text}
              </button>
            );
          })}
        </div>
        {chosen ? (
          <p className={`quiz-react ${chosen.correct ? "quiz-react-ok" : "quiz-react-no"}`}>
            {chosen.reaction}
          </p>
        ) : null}
      </div>
    </div>
  );
}
