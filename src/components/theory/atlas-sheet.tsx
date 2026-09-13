"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { playLine } from "@/lib/chess/line";
import type { AtlasEntry } from "@/lib/atlas";
import { SplashBoard } from "@/components/drill/splash-board";

export function AtlasSheet({
  entry,
  onClose,
}: {
  entry: AtlasEntry;
  onClose: () => void;
}) {
  const [routeIndex, setRouteIndex] = useState(0);
  const [ply, setPly] = useState(() => entry.moves.trim().split(/\s+/).length);

  const moves = useMemo(() => {
    const start = entry.moves.trim().split(/\s+/).filter(Boolean);
    const extra = (entry.routes[routeIndex]?.san ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return [...start, ...extra];
  }, [entry, routeIndex]);

  const stem = entry.moves.trim().split(/\s+/).filter(Boolean).length;
  const pos = playLine(moves, ply);
  const orientation = entry.sides.includes("black") && !entry.sides.includes("white")
    ? "black"
    : "white";

  return (
    <div
      className="splash-root atlas-overlay"
      role="dialog"
      aria-modal
      aria-label={entry.name}
    >
      <button type="button" className="splash-scrim" onClick={onClose} />
      <div className="splash-card splash-in atlas-sheet">
        <header className="splash-head">
          <div>
            <p className="dash-kicker">
              {entry.eco} · {entry.kind === "system" ? "System" : "Semi"}
            </p>
            <h2 className="atlas-sheet-title">{entry.name}</h2>
          </div>
          <button type="button" className="study-close" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="atlas-board">
          <SplashBoard
            fen={pos.fen}
            lastMove={pos.lastMove}
            orientation={orientation}
            turnColor={pos.turnColor}
            check={pos.check}
          />
        </div>

        <div className="ply-nav">
          <button
            type="button"
            className="ply-btn"
            disabled={ply <= 0}
            onClick={() => setPly((n) => Math.max(0, n - 1))}
          >
            Back
          </button>
          <button
            type="button"
            className="ply-btn ply-btn-fwd"
            disabled={ply >= moves.length}
            onClick={() => setPly((n) => Math.min(moves.length, n + 1))}
          >
            Forward
          </button>
        </div>

        <div className="atlas-routes" role="tablist" aria-label="Key routes">
          {entry.routes.map((route, i) => (
            <button
              key={route.name}
              type="button"
              role="tab"
              aria-selected={i === routeIndex}
              className={i === routeIndex ? "filter-chip filter-chip-on" : "filter-chip"}
              onClick={() => {
                setRouteIndex(i);
                setPly(stem + route.san.trim().split(/\s+/).filter(Boolean).length);
              }}
            >
              {route.name}
            </button>
          ))}
        </div>
        <p className="atlas-route-note">{entry.routes[routeIndex]?.note}</p>

        <section className="atlas-plans">
          <article>
            <h3>Attacking</h3>
            <p>{entry.attacking}</p>
          </article>
          <article>
            <h3>Positional</h3>
            <p>{entry.positional}</p>
          </article>
        </section>

        {entry.trainId ? (
          <Link href={`/drill/${entry.trainId}`} className="atlas-train">
            Train this line
          </Link>
        ) : (
          <p className="atlas-train-miss">No drill mapped yet — atlas only.</p>
        )}
      </div>
    </div>
  );
}
