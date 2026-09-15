"use client";

import { useEffect, useMemo, useState } from "react";
import { collectFacts } from "@/lib/dialogue";
import { compressBeforeCalculate, verifyWithEngines } from "@/lib/coach-brain";
import type { EngineConsensus } from "@/lib/coach-brain";
import type { Opening } from "@/lib/openings";

export function TeachLayer({
  opening,
  fen,
  afterPly,
}: {
  opening: Opening;
  fen: string;
  afterPly: number;
}) {
  const facts = useMemo(
    () => collectFacts({ opening, ply: afterPly, kind: "plan", fen }),
    [opening, afterPly, fen],
  );
  const compress = useMemo(
    () => compressBeforeCalculate({ opening, afterPly, facts, fen }),
    [opening, afterPly, facts, fen],
  );
  const [consensus, setConsensus] = useState<EngineConsensus | null>(null);

  useEffect(() => {
    let cancelled = false;
    void verifyWithEngines({
      fen,
      candidates: compress.compressed,
      depth: compress.depth,
      lookaheadSans: compress.lookahead.map((row) => row.san),
    }).then((next) => {
      if (!cancelled) setConsensus(next);
    });
    return () => {
      cancelled = true;
    };
  }, [fen, compress]);

  return (
    <div className="human-panel" data-testid="teach-layer">
      <p className="human-kicker">What</p>
      <p className="human-copy">{compress.human.what}</p>
      <p className="human-kicker">Why</p>
      <p className="human-copy">{compress.human.why}</p>
      <p className="human-kicker">Candidates</p>
      <ul className="engine-votes">
        {compress.compressed.slice(0, 5).map((row) => (
          <li key={`${row.san}-${row.classification}`}>
            <span>{row.classification}</span>
            <strong>{row.san}</strong>
          </li>
        ))}
      </ul>
      {compress.human.ideaToRemember ? (
        <p className="human-copy">{compress.human.ideaToRemember}</p>
      ) : null}
      {consensus?.disagreement ? (
        <p className="human-copy">{consensus.disagreement}</p>
      ) : null}
    </div>
  );
}
