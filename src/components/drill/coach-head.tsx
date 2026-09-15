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

/** Original EDGE gentleman mark — Lupin noir, not a likeness. */
function AldricMark() {
  const uid = useId().replace(/:/g, "");
  const clip = `coach-head-clip-${uid}`;
  const skin = `coach-head-skin-${uid}`;
  const coat = `coach-head-coat-${uid}`;
  return (
    <svg viewBox="0 0 80 80" width="44" height="44">
      <defs>
        <clipPath id={clip}>
          <circle cx="40" cy="40" r="38" />
        </clipPath>
        <linearGradient id={skin} x1="30" y1="22" x2="58" y2="70">
          <stop offset="0%" stopColor="#e6c7a4" />
          <stop offset="100%" stopColor="#c4966c" />
        </linearGradient>
        <linearGradient id={coat} x1="40" y1="52" x2="40" y2="80">
          <stop offset="0%" stopColor="#2a241c" />
          <stop offset="100%" stopColor="#12100c" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill="#0c0b0a" />
      <g clipPath={`url(#${clip})`}>
        <rect width="80" height="80" fill="#161310" />
        <ellipse cx="40" cy="86" rx="28" ry="18" fill={`url(#${coat})`} />
        <path
          d="M18 80 L26 58 Q40 50 54 58 L62 80 Z"
          fill={`url(#${coat})`}
        />
        <path
          d="M32 62 L40 80 L48 62 Q40 58 32 62 Z"
          fill="#d8c4a0"
          opacity="0.35"
        />
        <ellipse cx="40" cy="40" rx="16.5" ry="19" fill={`url(#${skin})`} />
        <path
          d="M22 38 Q24 16 40 14 Q56 16 58 38 Q57 22 40 20 Q23 22 22 38 Z"
          fill="#1a1410"
        />
        <path
          d="M24 36 Q28 28 34 26 L32 38 Q26 40 24 36 Z"
          fill="#241c16"
        />
        <path
          d="M23 52 Q40 64 57 52 Q54 72 40 74 Q26 72 23 52 Z"
          fill="#2a2118"
        />
        <path
          d="M28 48 Q40 54 52 48 Q50 52 40 53.5 Q30 52 28 48 Z"
          fill="#1c1612"
        />
        <circle cx="33.5" cy="38.5" r="1.35" fill="#1a1410" />
        <circle cx="46.5" cy="38.5" r="1.35" fill="#1a1410" />
        <path
          d="M36 43.5 Q40 45.5 44 43.5"
          fill="none"
          stroke="#a56b48"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </g>
      <circle
        cx="40"
        cy="40"
        r="38"
        fill="none"
        stroke="#3d3428"
        strokeWidth="1.5"
      />
      <path
        d="M12 58 L22 48"
        fill="none"
        stroke="#ea7a14"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
