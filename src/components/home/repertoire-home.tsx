"use client";

import { useMemo, useState } from "react";
import { OpeningCard } from "@/components/home/opening-card";
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
    <div className="home-shell">
      <header className="home-sticky">
        <div className="home-hero">
          <p className="text-[11px] font-medium tracking-[0.18em] text-zinc-500 uppercase">
            Repertoire · Professor pack
          </p>
          <h1 className="mt-1 text-[28px] leading-none font-semibold tracking-tight text-zinc-50">
            Opening Edge
          </h1>
          <p className="mt-3 max-w-[22rem] text-[14px] leading-snug text-zinc-400">
            Twenty-one attacking systems. Spine to move 21, traps, six pillars —
            then plan. Professor voice on Why.
          </p>
          <p className="home-count">
            {white.length} White · {e4.length} vs 1.e4 · {d4.length} vs 1.d4
          </p>
        </div>
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
        <div className="filter-row" role="tablist" aria-label="Reps mode">
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

      {families.map((family) => {
        const list = byFamily[family];
        const meta = FAMILY_META[family];
        return (
          <section key={family} className="family-block">
            <header className="family-head">
              <h2>{meta.title}</h2>
              <p>
                {meta.blurb} · {list.length} systems
              </p>
            </header>
            <div className="flex flex-col gap-3">
              {list.map((opening) => (
                <OpeningCard
                  key={opening.id}
                  opening={opening}
                  reps={reps}
                />
              ))}
            </div>
          </section>
        );
      })}

      <footer className="home-foot">
        <p>
          Book icon on the drill for pillars and traps. Why auto-plays the
          branch. After the spine, Plan mode — aggressive is the default voice.
        </p>
      </footer>
    </div>
  );
}
