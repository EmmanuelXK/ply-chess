"use client";

import type { EvalTick } from "@/lib/engines/types";

function fillFromEval(tick: EvalTick): number {
  if (tick.mate != null && tick.mate !== 0) {
    return tick.mate > 0 ? 1 : 0;
  }
  const cp = tick.cp ?? 0;
  const t = Math.tanh(cp / 380);
  return 0.5 + t / 2;
}

function label(tick: EvalTick): string {
  if (tick.mate != null && tick.mate !== 0) {
    return tick.mate > 0 ? `M${tick.mate}` : `-M${Math.abs(tick.mate)}`;
  }
  const cp = tick.cp ?? 0;
  const pawns = (cp / 100).toFixed(1);
  return cp > 0 ? `+${pawns}` : pawns;
}

export function EvalBar({
  tick,
  orientation = "white",
  layout = "vertical",
}: {
  tick: EvalTick;
  orientation?: "white" | "black";
  layout?: "vertical" | "horizontal";
}) {
  const whiteFill = fillFromEval(tick);
  const bottomIsWhite = orientation === "white";
  const whitePct = `${Math.round(whiteFill * 1000) / 10}%`;
  const text = label(tick);
  const whiteWinning = (tick.mate ?? 0) > 0 || (tick.cp ?? 0) > 20;
  const blackWinning = (tick.mate ?? 0) < 0 || (tick.cp ?? 0) < -20;

  if (layout === "horizontal") {
    return (
      <div className="eval-bar eval-bar-h" aria-label={`Evaluation ${text}`}>
        <div
          className="eval-fill-black"
          style={{ width: bottomIsWhite ? `calc(100% - ${whitePct})` : whitePct }}
        />
        <div
          className="eval-fill-white"
          style={{ width: bottomIsWhite ? whitePct : `calc(100% - ${whitePct})` }}
        />
        <span
          className={`eval-label ${whiteWinning ? "eval-label-w" : blackWinning ? "eval-label-b" : ""}`}
        >
          {text}
        </span>
      </div>
    );
  }

  return (
    <div className="eval-bar eval-bar-v" aria-label={`Evaluation ${text}`}>
      <div
        className={bottomIsWhite ? "eval-fill-black" : "eval-fill-white"}
        style={{
          height: bottomIsWhite ? `calc(100% - ${whitePct})` : whitePct,
        }}
      />
      <div
        className={bottomIsWhite ? "eval-fill-white" : "eval-fill-black"}
        style={{ height: bottomIsWhite ? whitePct : `calc(100% - ${whitePct})` }}
      />
      <span
        className={`eval-label ${whiteWinning ? "eval-label-w" : blackWinning ? "eval-label-b" : ""}`}
      >
        {text}
      </span>
    </div>
  );
}
