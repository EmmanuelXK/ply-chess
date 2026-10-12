import type { LinePlan } from "@/lib/openings/line-plan";

export function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: LinePlan;
  selected: number;
  onSelect: (index: number) => void;
}) {
  const game = plan.game;
  return (
    <article className="plan-card" data-testid="plan-card">
      <header>Your plan now</header>
      <ol>
        {plan.steps.map((step, index) => (
          <li key={step.text}>
            <button
              type="button"
              aria-pressed={index === selected}
              onClick={() => onSelect(index)}
            >
              {step.text}
            </button>
          </li>
        ))}
      </ol>
      {game ? (
        <p className="plan-game" data-testid="plan-game">
          {game.white}–{game.black}, {game.event} {game.year}
        </p>
      ) : null}
    </article>
  );
}
