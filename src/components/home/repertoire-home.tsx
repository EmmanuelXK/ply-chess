"use client";

import { useRef, useState } from "react";
import { TabBar } from "@/components/app/tab-bar";
import { OpeningTile } from "@/components/home/opening-tile";
import { useTileArranger } from "@/components/home/use-tile-arranger";
import {
  openingsForSide,
  SIDE_META,
  STUDY_MODES,
  type Opening,
  type StudyMode,
} from "@/lib/openings";
import type { TileLayout } from "@/lib/openings/arranger";
import { useAuth } from "@/components/auth/auth-provider";
import { dueCount, progressFor } from "@/lib/reps/schedule";

export function RepertoireHome() {
  const [mode, setMode] = useState<StudyMode>("learn");
  const { profile } = useAuth();
  const stageRef = useRef<HTMLDivElement>(null);
  const layout = useTileArranger(stageRef);
  const white = openingsForSide("white");
  const black = openingsForSide("black");

  return (
    <div className="dash-shell dash-repertoire">
      <header className="dash-head">
        <p className="dash-kicker">Your Weapons</p>
        <h1>Opening Edge</h1>
        <p className="dash-sub">
          {white.length} White · {black.length} Black
          {profile?.displayName ? ` · ${profile.displayName}` : ""}
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
            ? "What stuck. Due counts sit on the mark."
            : STUDY_MODES.find((m) => m.id === mode)?.blurb}
        </p>
      </header>

      <div className="dash-scroll dash-weapons-scroll">
        <div ref={stageRef} className="weapons-stage">
          <SidePane side="white" openings={white} mode={mode} layout={layout} />
          <SidePane side="black" openings={black} mode={mode} layout={layout} />
        </div>
      </div>

      <TabBar active="home" />
    </div>
  );
}

function SidePane({
  side,
  openings,
  mode,
  layout,
}: {
  side: "white" | "black";
  openings: Opening[];
  mode: StudyMode;
  layout: TileLayout | null;
}) {
  const meta = SIDE_META[side];
  return (
    <section className={`dash-family dash-family-${side}`}>
      <header className="dash-family-head">
        <h2>{meta.title}</h2>
        <p>{openings.length}</p>
      </header>
      <div
        className="weapon-grid"
        data-arranged={layout ? "true" : undefined}
        style={
          layout
            ? {
                ["--weapon-cols" as string]: String(layout.cols),
                ["--weapon-tile" as string]: `${layout.tile}px`,
                ["--weapon-gap" as string]: `${layout.gap}px`,
              }
            : undefined
        }
      >
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
