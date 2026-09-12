"use client";

import { DUOS, type DuoId, type DuoPack } from "@/lib/dialogue";

export function DuoPicker({
  value,
  onChange,
  compact = false,
}: {
  value: DuoId;
  onChange: (id: DuoId) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "duo-grid duo-grid-compact" : "duo-grid"}>
      {DUOS.map((duo) => (
        <DuoCard
          key={duo.id}
          duo={duo}
          selected={value === duo.id}
          onSelect={() => onChange(duo.id)}
        />
      ))}
    </div>
  );
}

function DuoCard({
  duo,
  selected,
  onSelect,
}: {
  duo: DuoPack;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`${selected ? "duo-card duo-card-on" : "duo-card"} duo-${duo.id}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <p className="duo-card-kicker">Headphone duo</p>
      <h3>{duo.title}</h3>
      <p className="duo-card-blurb">{duo.blurb}</p>
      <p className="duo-card-names">
        <span className={`speaker-dot speaker-${duo.left.color}`} />
        {duo.left.short} {duo.left.gender === "male" ? "♂" : "♀"}
        <span className="duo-card-amp">·</span>
        <span className={`speaker-dot speaker-${duo.right.color}`} />
        {duo.right.short} {duo.right.gender === "male" ? "♂" : "♀"}
      </p>
    </button>
  );
}
