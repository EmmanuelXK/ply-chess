"use client";

import { useEffect, useState } from "react";

import type { AnalysisEngineId, EngineDepth } from "@/lib/engines/catalog";
import { getEngineSession, type AnalysisPhase } from "@/lib/engines/session";
import { emptyAnalysis, reduceInfo, type AnalysisView } from "@/lib/engines/uci";

export function useAnalysis({
  fen,
  engineId,
  depth,
  run,
  nonce,
  enabled,
  owner,
  multipv = 3,
}: {
  fen: string;
  engineId: AnalysisEngineId;
  depth: EngineDepth;
  run: boolean;
  nonce: number;
  enabled: boolean;
  /** Keeps a second surface from stopping this engine when it releases. */
  owner?: string;
  multipv?: number;
}): { view: AnalysisView; phase: AnalysisPhase } {
  const [snap, setSnap] = useState<{ key: string; view: AnalysisView }>({
    key: "",
    view: emptyAnalysis(),
  });
  const [phase, setPhase] = useState<AnalysisPhase>("loading");
  const ownerId = owner ?? `analyze:${engineId}`;
  const expected = `${engineId}|${depth}|${multipv}|${nonce}|${fen}`;
  const view = snap.key === expected ? snap.view : emptyAnalysis();

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const session = getEngineSession(engineId);
    const unsubLine = session.subscribe((line, key) => {
      if (!alive || key !== expected) return;
      if (line.startsWith("info ") || line.startsWith("bestmove")) {
        setSnap((prev) => {
          const base = prev.key === expected ? prev.view : emptyAnalysis();
          return { key: expected, view: reduceInfo(base, line, fen) };
        });
      }
    });
    const unsubPhase = session.subscribePhase((next) => {
      if (alive) setPhase(next);
    });
    session.configure({ id: engineId, fen, run, depth, nonce, multipv }, ownerId);
    return () => {
      alive = false;
      unsubLine();
      unsubPhase();
      session.halt(ownerId);
    };
  }, [enabled, expected, fen, engineId, depth, run, nonce, ownerId, multipv]);

  return { view, phase };
}
