"use client";

import { chunkAt, chunkIndexAt, housePicture } from "@/lib/openings";
import type { Opening } from "@/lib/openings";

export function MemoryRail({
  opening,
  ply,
  weakFrom = -1,
  onJump,
}: {
  opening: Opening;
  ply: number;
  weakFrom?: number;
  onJump: (ply: number) => void;
}) {
  const here = Math.max(0, ply);
  const current = chunkAt(opening, Math.max(0, here - (here === 0 ? 0 : 1))) ??
    opening.chunks[0];
  const currentIndex = chunkIndexAt(opening, current?.fromPly ?? 0);
  const last = Math.max(1, opening.moves.length - 1);
  const you = Math.min(100, (here / last) * 100);

  return (
    <div className="mem-rail">
      <div className="mem-chunks" role="list" aria-label="Houses">
        {opening.chunks.map((chunk) => {
          const on = chunk === current;
          const done = here > chunk.toPly;
          const weak = weakFrom >= chunk.fromPly && weakFrom <= chunk.toPly;
          return (
            <button
              key={`${chunk.fromPly}-${chunk.name}`}
              type="button"
              role="listitem"
              className={`mem-chip${on ? " mem-chip-on" : ""}${
                done ? " mem-chip-done" : ""
              }${weak ? " mem-chip-weak" : ""}`}
              onClick={() => onJump(chunk.fromPly)}
              title={housePicture(chunk)}
            >
              {chunk.name}
            </button>
          );
        })}
        <span className="sr-only">
          House {currentIndex + 1} of {opening.chunks.length}: {current?.name}
        </span>
      </div>
      <div className="mem-journey" aria-label="Journey">
        <span className="mem-journey-line" aria-hidden />
        <span className="mem-you" style={{ left: `${you}%` }} aria-hidden />
        {opening.pins.map((pin) => (
          <button
            key={`${pin.afterPly}-${pin.label}`}
            type="button"
            className={`mem-pin${here >= pin.afterPly ? " mem-pin-hit" : ""}`}
            style={{ left: `${Math.min(100, (pin.afterPly / last) * 100)}%` }}
            title={pin.label}
            aria-label={pin.label}
            onClick={() => onJump(pin.afterPly)}
          />
        ))}
      </div>
    </div>
  );
}
