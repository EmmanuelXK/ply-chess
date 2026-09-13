"use client";

import { useState } from "react";
import { TabBar } from "@/components/app/tab-bar";
import { AtlasSheet } from "@/components/theory/atlas-sheet";
import { OpeningTree, treeSummary } from "@/components/theory/opening-tree";
import { ATLAS, type AtlasEntry, type AtlasSide } from "@/lib/atlas";

const SIDES: { id: AtlasSide | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "white", label: "White" },
  { id: "black", label: "Black" },
];

export function TheoryAtlas() {
  const [query, setQuery] = useState("");
  const [side, setSide] = useState<AtlasSide | "all">("all");
  const [open, setOpen] = useState<AtlasEntry | null>(null);

  return (
    <div className="dash-shell theory-shell">
      <header className="dash-head">
        <p className="dash-kicker">The Map</p>
        <h1>Universal Openings</h1>
        <p className="dash-sub">
          {treeSummary() || ATLAS.length} cases · expand a branch · 1250-friendly plans
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
      </header>

      <div className="dash-scroll">
        <OpeningTree query={query} side={side} onOpen={setOpen} />
      </div>

      {open ? <AtlasSheet entry={open} onClose={() => setOpen(null)} /> : null}
      <TabBar active="theory" />
    </div>
  );
}
