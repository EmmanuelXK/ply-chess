"use client";

import { useMemo, useState } from "react";
import { TabBar } from "@/components/app/tab-bar";
import { AtlasSheet } from "@/components/theory/atlas-sheet";
import {
  ATLAS,
  ATLAS_FAMILY_META,
  filterAtlas,
  groupAtlas,
  type AtlasEntry,
  type AtlasFamily,
  type AtlasSide,
} from "@/lib/atlas";

const SIDES: { id: AtlasSide | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "white", label: "White" },
  { id: "black", label: "Black" },
];

const FAMILIES: { id: AtlasFamily | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "semi-open", label: "Semi-open" },
  { id: "closed", label: "Closed" },
  { id: "indian", label: "Indian" },
  { id: "flank", label: "Flank" },
  { id: "irregular", label: "Irregular" },
];

export function TheoryAtlas() {
  const [query, setQuery] = useState("");
  const [side, setSide] = useState<AtlasSide | "all">("all");
  const [family, setFamily] = useState<AtlasFamily | "all">("all");
  const [open, setOpen] = useState<AtlasEntry | null>(null);

  const shown = useMemo(
    () => filterAtlas({ query, side, family }),
    [query, side, family],
  );
  const groups = useMemo(() => groupAtlas(shown), [shown]);

  return (
    <div className="dash-shell theory-shell">
      <header className="dash-head">
        <p className="dash-kicker">Atlas</p>
        <h1>Theory</h1>
        <p className="dash-sub">
          {ATLAS.length} openings · key routes · 1250-friendly plans
        </p>
        <label className="atlas-search">
          <span className="sr-only">Search openings</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Najdorf, London, ECO…"
            enterKeyHint="search"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </label>
        <div className="mode-grid atlas-side-grid" role="tablist" aria-label="Side">
          {SIDES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={side === item.id}
              className={side === item.id ? "filter-chip filter-chip-on" : "filter-chip"}
              onClick={() => setSide(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="filter-row filter-row-tight" role="tablist" aria-label="Family">
          {FAMILIES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={family === item.id}
              className={family === item.id ? "filter-chip filter-chip-on" : "filter-chip"}
              onClick={() => setFamily(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="dash-scroll">
        {groups.length === 0 ? (
          <p className="atlas-empty">No cases in the atlas. Try another search.</p>
        ) : (
          groups.map((group) => (
            <section key={group.family} className="dash-family">
              <header className="dash-family-head">
                <h2>{ATLAS_FAMILY_META[group.family].title}</h2>
                <p>{group.entries.length}</p>
              </header>
              <p className="atlas-family-blurb">
                {ATLAS_FAMILY_META[group.family].blurb}
              </p>
              <div className="dash-grid atlas-grid">
                {group.entries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className="dash-tile atlas-tile"
                    onClick={() => setOpen(entry)}
                  >
                    <p className="dash-tile-kicker">
                      {entry.eco}
                      {" · "}
                      {entry.sides.map((s) => (s === "white" ? "White" : "Black")).join(" / ")}
                    </p>
                    <h3>{entry.name}</h3>
                    <p className="dash-tile-meta">{entry.moves}</p>
                    <p className="dash-tile-chunk">
                      {entry.kind === "system" ? "System" : "Semi"}
                      {entry.trainId ? " · Train" : ""}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {open ? <AtlasSheet entry={open} onClose={() => setOpen(null)} /> : null}
      <TabBar active="theory" />
    </div>
  );
}
