"use client";

import { useEffect, useMemo, useState } from "react";
import { hybridAdvice, instantEval } from "@/lib/engines/hybrid";
import type { EvalTick, HybridAdvice } from "@/lib/engines/types";

export function useEngineTick(fen: string): {
  tick: EvalTick;
  advice: HybridAdvice | null;
} {
  const instant = useMemo(() => instantEval(fen), [fen]);
  const [engine, setEngine] = useState<{
    fen: string;
    tick: EvalTick;
    advice: HybridAdvice | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const target = fen;
    void (async () => {
      try {
        const advice = await hybridAdvice(target);
        if (cancelled) return;
        const sf = advice.votes.find((v) => v.id === "stockfish")?.move;
        const fallback = instantEval(target);
        setEngine({
          fen: target,
          tick: {
            cp: sf?.scoreCp ?? fallback.cp,
            mate: sf?.mate ?? null,
            depth: sf ? 11 : 0,
            best: sf?.uci,
          },
          advice,
        });
      } catch {
        if (!cancelled) {
          setEngine({ fen: target, tick: instantEval(target), advice: null });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fen]);

  const tick = engine?.fen === fen ? engine.tick : instant;
  const advice = engine?.fen === fen ? engine.advice : null;
  return { tick, advice };
}
