"use client";

import { useId, useLayoutEffect, useState } from "react";

import {
  coachHeadPresence,
  type CoachHeadPresence,
} from "@/lib/tts/coach-head";

const INSET = 8;

export function CoachHead({
  sessionOpen,
  speaking,
}: {
  sessionOpen: boolean;
  speaking: boolean;
}) {
  const presence = coachHeadPresence({ sessionOpen, speaking });
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    if (presence === "hidden") return;
    const frame = document.querySelector(
      ".board-with-history .board-frame",
    );
    if (!(frame instanceof HTMLElement)) return;

    const sync = () => {
      const box = frame.getBoundingClientRect();
      setAnchor({ top: box.top + INSET, left: box.left + INSET });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(frame);
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [presence]);

  if (presence === "hidden" || !anchor) return null;

  return (
    <div
      className="coach-head"
      style={{ top: anchor.top, left: anchor.left }}
      data-testid="coach-head"
      data-motion={presence}
      role="img"
      aria-label={
        presence === "speak" ? "Aldric speaking" : "Aldric"
      }
    >
      <span className="coach-head-disc" aria-hidden>
        <AldricMark />
      </span>
      <SpeakWave motion={presence} />
    </div>
  );
}

function SpeakWave({ motion }: { motion: Exclude<CoachHeadPresence, "hidden"> }) {
  return (
    <span className="coach-head-wave" data-motion={motion} aria-hidden>
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

/** Original EDGE gentleman mark — Lupin noir, not a likeness. Drawn for 44px. */
function AldricMark() {
  const uid = useId().replace(/:/g, "");
  const clip = `coach-head-clip-${uid}`;
  return (
    <svg viewBox="0 0 80 80" width="48" height="48">
      <defs>
        <clipPath id={clip}>
          <circle cx="40" cy="40" r="38" />
        </clipPath>
      </defs>
      <circle cx="40" cy="40" r="40" fill="#0c0b0a" />
      <g clipPath={`url(#${clip})`}>
        <rect width="80" height="80" fill="#14110e" />
        <path d="M8 80 L18 54 Q40 46 62 54 L72 80 Z" fill="#1a1612" />
        <path d="M22 58 L30 80 L40 68 L50 80 L58 58 Q40 52 22 58 Z" fill="#2c241c" />
        <path d="M30 62 L40 80 L50 62 Q40 58 30 62 Z" fill="#d9c4a4" opacity="0.4" />
        <ellipse cx="40" cy="42" rx="15" ry="17" fill="#d7b48a" />
        <path
          d="M20 40 Q22 12 40 10 Q58 12 60 40 L58 28 Q40 18 22 28 Z"
          fill="#1a1410"
        />
        <path d="M24 36 Q28 24 40 22 Q44 30 40 38 Q30 40 24 36 Z" fill="#241c16" />
        <path
          d="M25 54 Q40 70 55 54 Q52 76 40 78 Q28 76 25 54 Z"
          fill="#1a1410"
        />
        <path
          d="M27 49 Q40 57 53 49 Q51 54 40 55.5 Q29 54 27 49 Z"
          fill="#120e0c"
        />
        <circle cx="33" cy="40" r="1.7" fill="#120e0c" />
        <circle cx="47" cy="40" r="1.7" fill="#120e0c" />
        <path
          d="M36 44.5 Q40 46 44 44.5"
          fill="none"
          stroke="#a56b48"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
      <circle
        cx="40"
        cy="40"
        r="38"
        fill="none"
        stroke="#3d3428"
        strokeWidth="1.6"
      />
      <path
        d="M11 57 L22 46"
        fill="none"
        stroke="#ea7a14"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
