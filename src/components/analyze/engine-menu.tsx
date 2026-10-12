"use client";

import { X } from "lucide-react";

import { ENGINE_CHOICES } from "@/lib/engines/catalog";
import { ANALYZE_DEPTHS, ANALYZE_TIMES_MS } from "@/lib/engines/search";

export function EngineMenu({
  infinite,
  depth,
  movetimeMs,
  showArrow,
  onInfinite,
  onDepth,
  onTime,
  onArrow,
  onClose,
}: {
  infinite: boolean;
  depth: number;
  movetimeMs: number;
  showArrow: boolean;
  onInfinite: (next: boolean) => void;
  onDepth: (depth: number) => void;
  onTime: (ms: number) => void;
  onArrow: (next: boolean) => void;
  onClose: () => void;
}) {
  const stockfish = ENGINE_CHOICES[0];
  return (
    <div className="analyze-sheet" data-testid="engine-menu" role="dialog" aria-label="Engine">
      <header className="analyze-sheet-head">
        <div>
          <p className="analyze-kicker">Engine</p>
          <h2>Stockfish 17.1</h2>
        </div>
        <button type="button" className="analyze-text-btn" onClick={onClose}>
          <X />
          Close
        </button>
      </header>

      <article className="analyze-engine-card analyze-engine-on">
        <strong>{stockfish?.label ?? "Stockfish"}</strong>
        <span>17.1 lite · on this device · about 6.8 MB</span>
        <em>GPL-3.0. Three lines. Already loaded with the app.</em>
      </article>

      <p className="analyze-note">
        Extra engines stay off. Analyze does not download another engine, and Learn never does.
      </p>

      <h3>Search</h3>
      <div className="analyze-seg" role="group" aria-label="Search mode">
        <button
          type="button"
          className={infinite ? "analyze-seg-on" : ""}
          aria-pressed={infinite}
          onClick={() => onInfinite(true)}
        >
          Until stopped
        </button>
        <button
          type="button"
          className={!infinite ? "analyze-seg-on" : ""}
          aria-pressed={!infinite}
          onClick={() => onInfinite(false)}
        >
          Depth and time
        </button>
      </div>

      {infinite ? (
        <p className="analyze-note">Keeps searching the current position until you press Stop.</p>
      ) : (
        <>
          <h3>Depth</h3>
          <div className="analyze-chips" role="group" aria-label="Depth">
            {ANALYZE_DEPTHS.map((value) => (
              <button
                key={value}
                type="button"
                className={value === depth ? "analyze-chip analyze-chip-on" : "analyze-chip"}
                aria-pressed={value === depth}
                onClick={() => onDepth(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <h3>Time</h3>
          <div className="analyze-chips" role="group" aria-label="Time">
            {ANALYZE_TIMES_MS.map((value) => (
              <button
                key={value}
                type="button"
                className={value === movetimeMs ? "analyze-chip analyze-chip-on" : "analyze-chip"}
                aria-pressed={value === movetimeMs}
                onClick={() => onTime(value)}
              >
                {value % 1000 === 0 ? `${value / 1000}s` : `${value / 1000}s`}
              </button>
            ))}
          </div>
        </>
      )}

      <h3>Board</h3>
      <button
        type="button"
        className={showArrow ? "analyze-toggle analyze-toggle-on" : "analyze-toggle"}
        aria-pressed={showArrow}
        onClick={() => onArrow(!showArrow)}
      >
        <span>Best-move arrow</span>
        <strong>{showArrow ? "On" : "Off"}</strong>
      </button>
    </div>
  );
}
