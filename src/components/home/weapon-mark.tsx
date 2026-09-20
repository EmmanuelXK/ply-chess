import type { ReactNode } from "react";
import type { Opening } from "@/lib/openings/types";
import { WEAPON_MARK_IDS, type WeaponMarkId } from "@/lib/openings/mark-ids";

const CREAM = "#f3ebe0";
const AMBER = "#c26a1a";
const MUTED = "#8a7b6c";

function Frame({
  id,
  side,
  children,
}: {
  id: string;
  side: Opening["side"];
  children: ReactNode;
}) {
  const sheen = `wm-sheen-${id}`;
  const fill = side === "white" ? "#1c1916" : "#121110";
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={sheen} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="48%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="94"
        height="94"
        rx="22"
        fill={fill}
        stroke="#2c261e"
        strokeWidth="1"
      />
      <rect x="1" y="1" width="94" height="94" rx="22" fill={`url(#${sheen})`} />
      {children}
    </svg>
  );
}

const GLYPHS: Record<WeaponMarkId, ReactNode> = {
  "scotch-gambit": (
    <>
      <circle cx="40" cy="46" r="16" fill="none" stroke={CREAM} strokeWidth="3.2" />
      <circle cx="58" cy="46" r="16" fill="none" stroke={AMBER} strokeWidth="3.2" />
      <circle cx="49" cy="46" r="4.2" fill={CREAM} />
    </>
  ),
  "evans-gambit": (
    <>
      <path d="M48 22 L62 52 H34 Z" fill={CREAM} />
      <rect x="22" y="62" width="14" height="14" rx="2.5" fill={AMBER} />
    </>
  ),
  "italian-attack": (
    <>
      <path d="M30 70 L30 38 L48 24 L48 70 Z" fill={CREAM} />
      <path d="M48 70 L48 38 L66 24 L66 70 Z" fill={AMBER} opacity="0.92" />
    </>
  ),
  "vienna-gambit": (
    <>
      <path
        d="M24 28 L48 72 L72 28"
        fill="none"
        stroke={CREAM}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="22" r="5" fill={AMBER} />
    </>
  ),
  "kings-gambit": (
    <>
      <path
        d="M48 22 L54 34 H66 L56 44 L60 58 L48 50 L36 58 L40 44 L30 34 H42 Z"
        fill={CREAM}
      />
      <path d="M48 50 V76" stroke={AMBER} strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  "grand-prix": (
    <>
      <rect x="24" y="54" width="12" height="22" rx="2.5" fill={MUTED} />
      <rect x="42" y="40" width="12" height="36" rx="2.5" fill={CREAM} />
      <rect x="60" y="26" width="12" height="50" rx="2.5" fill={AMBER} />
    </>
  ),
  "smith-morra": (
    <>
      <path
        d="M28 64 L48 28 L68 64"
        fill="none"
        stroke={CREAM}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="68" cy="64" r="5.5" fill={AMBER} />
    </>
  ),
  "french-kia": (
    <>
      <path d="M48 20 L76 48 H64 V74 H32 V48 H20 Z" fill={CREAM} />
      <rect x="42" y="56" width="12" height="18" fill={AMBER} />
    </>
  ),
  "caro-fantasy": (
    <>
      <path d="M48 20 L56 40 L78 48 L56 56 L48 76 L40 56 L18 48 L40 40 Z" fill={CREAM} />
      <circle cx="48" cy="48" r="6" fill={AMBER} />
    </>
  ),
  london: (
    <>
      <path d="M48 22 L72 70 H24 Z" fill={CREAM} />
      <path d="M48 40 L62 68 H34 Z" fill="#1c1916" />
      <circle cx="48" cy="58" r="5" fill={AMBER} />
    </>
  ),
  "jobava-london": (
    <>
      <path d="M48 22 L56 46 L78 52 L56 58 L48 82 L40 58 L18 52 L40 46 Z" fill="none" stroke={CREAM} strokeWidth="3.4" />
      <circle cx="48" cy="52" r="7" fill={AMBER} />
    </>
  ),
  "black-lion": (
    <>
      <circle cx="48" cy="50" r="18" fill="none" stroke={CREAM} strokeWidth="4" />
      <path
        d="M48 24 L52 38 M62 28 L56 42 M74 40 L60 48 M74 60 L60 54 M62 74 L54 62 M48 80 L48 64 M34 74 L42 62 M22 60 L36 54 M22 40 L36 48 M34 28 L42 42"
        stroke={AMBER}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  ),
  pirc: (
    <>
      <path d="M48 18 L78 46 H68 V74 H28 V46 H18 Z" fill="none" stroke={CREAM} strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M48 34 L64 50 H58 V66 H38 V50 H32 Z" fill={AMBER} />
    </>
  ),
  dragon: (
    <>
      <path d="M22 74 L74 22" stroke={CREAM} strokeWidth="6" strokeLinecap="round" />
      <path d="M62 22 H74 V34" fill="none" stroke={AMBER} strokeWidth="5" strokeLinecap="round" />
      <circle cx="30" cy="66" r="6" fill={AMBER} />
    </>
  ),
  scandinavian: (
    <>
      <circle cx="44" cy="48" r="20" fill={CREAM} />
      <path d="M58 58 L74 74" stroke={AMBER} strokeWidth="6" strokeLinecap="round" />
      <circle cx="44" cy="48" r="8" fill="#121110" />
    </>
  ),
  alekhine: (
    <>
      <rect x="20" y="58" width="16" height="16" rx="3" fill={MUTED} />
      <rect x="40" y="40" width="16" height="16" rx="3" fill={CREAM} />
      <rect x="60" y="22" width="16" height="16" rx="3" fill={AMBER} />
    </>
  ),
  "kings-indian": (
    <>
      <path d="M32 34 H64 L60 44 H36 Z" fill={AMBER} />
      <rect x="38" y="44" width="20" height="8" fill={CREAM} />
      <path d="M48 52 L72 76 H24 Z" fill={CREAM} />
    </>
  ),
  "modern-benoni": (
    <>
      <path d="M24 28 H72 L48 78 Z" fill={CREAM} />
      <path d="M36 36 H60 L48 62 Z" fill="#121110" />
    </>
  ),
  benko: (
    <>
      <rect x="26" y="22" width="14" height="52" rx="3" fill={CREAM} />
      <rect x="56" y="22" width="14" height="52" rx="3" fill={CREAM} />
      <rect x="26" y="68" width="44" height="8" rx="2" fill={AMBER} />
    </>
  ),
  "dutch-leningrad": (
    <>
      <path d="M48 20 L70 44 H60 V72 H36 V44 H26 Z" fill={CREAM} />
      <circle cx="28" cy="70" r="8" fill={AMBER} />
    </>
  ),
  budapest: (
    <>
      <path
        d="M24 66 C24 36 72 36 72 28"
        fill="none"
        stroke={CREAM}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="72" cy="26" r="7" fill={AMBER} />
      <circle cx="24" cy="66" r="5" fill={CREAM} />
    </>
  ),
};

const FALLBACK = (
  <>
    <rect x="30" y="30" width="36" height="36" rx="8" fill={CREAM} />
    <rect x="42" y="42" width="12" height="12" rx="2" fill={AMBER} />
  </>
);

export { WEAPON_MARK_IDS };
export type { WeaponMarkId };

export function WeaponMark({ opening }: { opening: Opening }) {
  const glyph = GLYPHS[opening.id as WeaponMarkId] ?? FALLBACK;
  return (
    <Frame id={opening.id} side={opening.side}>
      {glyph}
    </Frame>
  );
}
