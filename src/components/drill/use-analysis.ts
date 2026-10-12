"use client";

import { useEffect, useRef, useState } from "react";

import type { AnalysisEngineId } from "@/lib/engines/catalog";
import { getEngineSession, type AnalysisPhase } from "@/lib/engines/session";
import { LIVE_LIMIT, analysisKey, type AnalysisLimit } from "@/lib/engines/search";
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
  limit: limitProp,
  onView,
}: {
  fen: string;
  engineId: AnalysisEngineId;
  depth: number;
  run: boolean;
  nonce: number;
  enabled: boolean;
  /** Keeps a second surface from stopping this engine when it releases. */
  owner?: string;
  multipv?: number;
  /** Defaults to Learn's short live search. Analyze passes infinite or a depth and time. */
  limit?: AnalysisLimit;
  /** Called from the engine stream, after a line is folded in. */
  onView?: (view: AnalysisView, fen: string) => void;
}): { view: AnalysisView; phase: AnalysisPhase } {
  const [snap, setSnap] = useState<{ key: string; view: AnalysisView }>({
    key: "",
    view: emptyAnalysis(),
  });
  const [phase, setPhase] = useState<AnalysisPhase>("loading");
  const ownerId = owner ?? `analyze:${engineId}`;
  const limit = limitProp ?? LIVE_LIMIT;
  const expected = analysisKey({ id: engineId, limit, multipv, nonce, fen });
  const view = snap.key === expected ? snap.view : emptyAnalysis();
  const onViewRef = useRef(onView);
  const foldedRef = useRef(snap);

  useEffect(() => {
    onViewRef.current = onView;
    if (!enabled) return;
    let alive = true;
    foldedRef.current = { key: "", view: emptyAnalysis() };
    const session = getEngineSession(engineId);
    const unsubLine = session.subscribe((line, key) => {
      if (!alive || key !== expected) return;
      if (line.startsWith("info ") || line.startsWith("bestmove")) {
        const base = foldedRef.current.key === expected ? foldedRef.current.view : emptyAnalysis();
        const next = reduceInfo(base, line, fen);
        const folded = { key: expected, view: next };
        foldedRef.current = folded;
        setSnap(folded);
        onViewRef.current?.(next, fen);
      }
    });
    const unsubPhase = session.subscribePhase((next) => {
      if (alive) setPhase(next);
    });
    session.configure({ id: engineId, fen, run, depth, nonce, multipv, limit }, ownerId);
    return () => {
      alive = false;
      unsubLine();
      unsubPhase();
      session.halt(ownerId);
    };
  }, [enabled, expected, fen, engineId, depth, run, nonce, ownerId, multipv, limit, onView]);

  return { view, phase };
}
