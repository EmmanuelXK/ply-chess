"use client";

import { useMemo, useRef, useState } from "react";
import { TabBar } from "@/components/app/tab-bar";
import { DueQueue, visibleDue } from "@/components/home/due-queue";
import { OpeningTile } from "@/components/home/opening-tile";
import { useProgressStore } from "@/components/home/use-progress-store";
import { useTileArranger } from "@/components/home/use-tile-arranger";
import {
  STUDY_MODES,
  openings,
  weaponRacks,
  type Opening,
  type StudyMode,
  type WeaponRack,
} from "@/lib/openings";
import type { TileLayout } from "@/lib/openings/arranger";
import { useAuth } from "@/components/auth/auth-provider";
import { dueCount } from "@/lib/reps/schedule";

export function RepertoireHome() {
  const [mode, setMode] = useState<StudyMode>("learn");
  const stored = useProgressStore();
  const { profile } = useAuth();
  const stageRef = useRef<HTMLDivElement>(null);
  const layout = useTileArranger(stageRef);
  const racks = weaponRacks(openings);
  const trained = racks.reduce((sum, rack) => sum + rack.openings.length, 0);
  const dueById = useMemo(() => {
    const map = new Map<string, number>();
    if (!stored) return map;
    for (const opening of openings) map.set(opening.id, dueCount(opening.id));
    return map;
  }, [stored]);
  const dueTotal = useMemo(() => {
    if (!stored) return 0;
    return visibleDue(openings).length;
  }, [stored]);

  return (
    <div className="dash-shell dash-repertoire">
      <header className="dash-head">
        <p className="dash-kicker">Your Weapons</p>
        <h1>Opening Edge</h1>
        <p className="dash-sub">
          {trained} systems
          {dueTotal > 0 ? ` · ${dueTotal} due` : ""}
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
        <p className="dash-mode-blurb">{STUDY_MODES.find((item) => item.id === mode)?.blurb}</p>
      </header>

      <div className="dash-scroll dash-weapons-scroll">
        <DueQueue openings={openings} />
        <div ref={stageRef} className="weapons-stage">
          {racks.map((rack) => (
            <RackPane key={rack.id} rack={rack} mode={mode} layout={layout} dueById={dueById} />
          ))}
        </div>
      </div>

      <TabBar active="home" />
    </div>
  );
}

function RackPane({
  rack,
  mode,
  layout,
  dueById,
}: {
  rack: WeaponRack<Opening>;
  mode: StudyMode;
  layout: TileLayout | null;
  dueById: Map<string, number>;
}) {
  return (
    <section
      className={`dash-family dash-rack dash-rack-${rack.id}`}
      data-rack={rack.id}
      aria-label={rack.title}
    >
      <header className="dash-family-head">
        <h2>{rack.title}</h2>
        <p>{rack.openings.length}</p>
      </header>
      <p className="dash-family-blurb">{rack.blurb}</p>
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
        {rack.openings.map((opening) => (
          <OpeningTile
            key={opening.id}
            opening={opening}
            reps={mode}
            due={dueById.get(opening.id) ?? 0}
          />
        ))}
      </div>
    </section>
  );
}
