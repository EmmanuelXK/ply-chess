"use client";

import { useMemo, useState } from "react";
import { TabBar } from "@/components/app/tab-bar";
import { OpeningTile } from "@/components/home/opening-tile";
import {
  FAMILY_META,
  openingsInFamily,
  REPS_MODES,
  type Family,
  type RepsMode,
} from "@/lib/openings";

const FILTERS: { id: "all" | Family; label: string }[] = [
  { id: "all", label: "All 21" },
  { id: "white", label: "White" },
  { id: "black-e4", label: "vs 1.e4" },
  { id: "black-d4", label: "vs 1.d4" },
];

export function RepertoireHome() {
  const [filter, setFilter] = useState<"all" | Family>("all");
  const [reps, setReps] = useState<RepsMode>("spine");

  const white = openingsInFamily("white");
  const e4 = openingsInFamily("black-e4");
  const d4 = openingsInFamily("black-d4");

  const families = useMemo(() => {
    const all: Family[] = ["white", "black-e4", "black-d4"];
    if (filter === "all") return all;
    return [filter];
  }, [filter]);

  const byFamily = {
    white,
    "black-e4": e4,
    "black-d4": d4,
  };

  return (
    <div className="dash-shell">
      <header className="dash-head">
        <p className="dash-kicker">Repertoire</p>
        <h1>Opening Edge</h1>
        <p className="dash-sub">
          {white.length} White · {e4.length} vs 1.e4 · {d4.length} vs 1.d4
        </p>
        <div className="filter-row" role="tablist" aria-label="Repertoire filter">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={
                filter === f.id ? "filter-chip filter-chip-on" : "filter-chip"
              }
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="filter-row filter-row-tight" role="tablist" aria-label="Reps mode">
          {REPS_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={reps === m.id}
              className={reps === m.id ? "filter-chip filter-chip-on" : "filter-chip"}
              onClick={() => setReps(m.id)}
              title={m.blurb}
            >
              {m.label}
            </button>
          ))}
        </div>
      </header>

      <div className="dash-scroll">
        {families.map((family) => {
          const list = byFamily[family];
          const meta = FAMILY_META[family];
          return (
            <section key={family} className="dash-family">
              <header className="dash-family-head">
                <h2>{meta.title}</h2>
                <p>{list.length}</p>
              </header>
              <div className="dash-grid">
                {list.map((opening) => (
                  <OpeningTile key={opening.id} opening={opening} reps={reps} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <TabBar active="home" />
    </div>
  );
}
