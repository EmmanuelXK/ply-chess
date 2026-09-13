"use client";

import { useState } from "react";
import { TabBar } from "@/components/app/tab-bar";
import { OpeningTile } from "@/components/home/opening-tile";
import {
  openingsForSide,
  SIDE_META,
  STUDY_MODES,
  type Opening,
  type StudyMode,
} from "@/lib/openings";
import { useAuth } from "@/components/auth/auth-provider";
import { dueCount, progressFor } from "@/lib/reps/schedule";

export function RepertoireHome() {
  const [mode, setMode] = useState<StudyMode>("learn");
  const { profile } = useAuth();
  const white = openingsForSide("white");
  const black = openingsForSide("black");

  return (
    <div className="dash-shell dash-repertoire">
      <header className="dash-head">
        <p className="dash-kicker">Your Weapons</p>
        <h1>Opening Edge</h1>
        <p className="dash-sub">
          {white.length} White · {black.length} Black
          {profile?.displayName ? ` · ${profile.displayName}` : " · systems you actually train"}
        </p>
        <div className="mode-grid" role="tablist" aria-label="Study mode">
          {STUDY_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              className={mode === m.id ? "filter-chip filter-chip-on" : "filter-chip"}
              onClick={() => setMode(m.id)}
              title={m.blurb}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="dash-mode-blurb">
          {mode === "progress"
            ? "What stuck. Weak houses light up on the tiles."
            : STUDY_MODES.find((m) => m.id === mode)?.blurb}
        </p>
      </header>

      <div className="dash-scroll dash-scroll-split">
        <SidePane side="white" openings={white} mode={mode} />
        <SidePane side="black" openings={black} mode={mode} />
      </div>

      <TabBar active="home" />
    </div>
  );
}

function SidePane({
  side,
  openings,
  mode,
}: {
  side: "white" | "black";
  openings: Opening[];
  mode: StudyMode;
}) {
  const meta = SIDE_META[side];
  return (
    <section className={`dash-family dash-family-${side}`}>
      <header className="dash-family-head">
        <h2>{meta.title}</h2>
        <p>{openings.length}</p>
      </header>
      <p className="dash-family-blurb">{meta.blurb}</p>
      <div className="dash-grid">
        {openings.map((opening) => {
          const progress = progressFor(opening.id);
          const due = dueCount(opening.id);
          return (
            <OpeningTile
              key={opening.id}
              opening={opening}
              reps={mode}
              due={due}
              best={progress.best}
              showProgress={mode === "progress" || mode === "reps"}
            />
          );
        })}
      </div>
    </section>
  );
}
