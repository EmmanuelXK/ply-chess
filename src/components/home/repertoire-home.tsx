"use client";

import { useRef } from "react";
import { TabBar } from "@/components/app/tab-bar";
import { OpeningTile } from "@/components/home/opening-tile";
import { useTileArranger } from "@/components/home/use-tile-arranger";
import { useAuth } from "@/components/auth/auth-provider";
import { openings, weaponRacks, type Opening, type WeaponRack } from "@/lib/openings";
import type { TileLayout } from "@/lib/openings/arranger";
import { ownerLabel } from "@/lib/owner";
import { STUDY_MODES } from "@/lib/reps/schedule";
import { useLocalOwner } from "@/lib/use-local-owner";

export function RepertoireHome() {
  const stageRef = useRef<HTMLDivElement>(null);
  const layout = useTileArranger(stageRef);
  const { profile } = useAuth();
  const local = useLocalOwner();
  const racks = weaponRacks(openings);
  const trained = racks.reduce((sum, rack) => sum + rack.openings.length, 0);
  const name = ownerLabel(local?.displayName, profile?.displayName);
  const blurb = STUDY_MODES[0]?.blurb ?? "One move at a time, with the book note.";

  return (
    <div className="dash-shell dash-repertoire">
      <header className="dash-head">
        <p className="dash-kicker">Your Weapons</p>
        <h1>Opening Edge</h1>
        <p className="dash-sub">
          {trained} systems · {name}
        </p>
        <p className="dash-mode-blurb">{blurb}</p>
      </header>

      <div className="dash-scroll dash-weapons-scroll">
        <div ref={stageRef} className="weapons-stage">
          {racks.map((rack) => (
            <RackPane key={rack.id} rack={rack} layout={layout} />
          ))}
        </div>
      </div>

      <TabBar active="home" />
    </div>
  );
}

function RackPane({
  rack,
  layout,
}: {
  rack: WeaponRack<Opening>;
  layout: TileLayout | null;
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
          <OpeningTile key={opening.id} opening={opening} />
        ))}
      </div>
    </section>
  );
}
