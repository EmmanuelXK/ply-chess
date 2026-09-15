/**
 * Memory-palace focus beds — one distinct soundscape per system.
 *
 * Each bed is a Web Audio recipe (drone + fifth + filtered noise + slow LFO),
 * not a bundled MP3. Short, lyric-free, Lupin-noir. The texture is the room:
 * gambits feel warmer and slightly pulsed; systems sit still; Black e4 coils
 * lower; Black d4 is earthier. Recall pins to the journey by ear.
 *
 * Duck under Ask Coach / TTS (see focus-player). Mute separately from voice.
 */
export interface FocusBed {
  id: string;
  /** Memory-palace room name — spoken never, used for mapping rationale. */
  room: string;
  droneHz: number;
  fifthHz: number;
  filterHz: number;
  lfoHz: number;
  noise: number;
  pulseHz: number;
  q: number;
  why: string;
}

export const FOCUS_DUCK_RATIO = 0.14;

/** Mix: loud enough for phone speakers, still a calm room (not a blast). */
export const FOCUS_MASTER_GAIN = 0.28;
export const FOCUS_DRONE_GAIN = 0.14;
export const FOCUS_FIFTH_GAIN = 0.048;
export const FOCUS_PULSE_DEPTH = 0.036;
export const FOCUS_NOISE_SCALE = 0.42;
export const FOCUS_FADE_IN_SEC = 0.55;

export const FOCUS_BEDS: Record<string, FocusBed> = {
  "scotch-gambit": {
    id: "scotch-gambit",
    room: "Open stone hall",
    droneHz: 62,
    fifthHz: 93,
    filterHz: 880,
    lfoHz: 0.05,
    noise: 0.1,
    pulseHz: 0.06,
    q: 0.7,
    why: "Airier hall — the center opens, not a closed study.",
  },
  "evans-gambit": {
    id: "evans-gambit",
    room: "Italian chapel",
    droneHz: 55,
    fifthHz: 82.5,
    filterHz: 430,
    lfoHz: 0.04,
    noise: 0.08,
    pulseHz: 0.05,
    q: 0.85,
    why: "Warm low brass. The pawn is a ticket, not a shout.",
  },
  "vienna-gambit": {
    id: "vienna-gambit",
    room: "Clock tower",
    droneHz: 68,
    fifthHz: 102,
    filterHz: 640,
    lfoHz: 0.09,
    noise: 0.07,
    pulseHz: 0.11,
    q: 1.1,
    why: "A faint tick. Vienna is a timing weapon.",
  },
  "kings-gambit": {
    id: "kings-gambit",
    room: "Storm cellar",
    droneHz: 46,
    fifthHz: 69,
    filterHz: 280,
    lfoHz: 0.07,
    noise: 0.16,
    pulseHz: 0.08,
    q: 0.55,
    why: "More weather in the noise. The f-pawn is a gale.",
  },
  "smith-morra": {
    id: "smith-morra",
    room: "Dock warehouse",
    droneHz: 49,
    fifthHz: 73.5,
    filterHz: 510,
    lfoHz: 0.055,
    noise: 0.11,
    pulseHz: 0.07,
    q: 0.75,
    why: "Hollow wood. c-file crates, not a chapel.",
  },
  "grand-prix": {
    id: "grand-prix",
    room: "Furnace room",
    droneHz: 73,
    fifthHz: 110,
    filterHz: 720,
    lfoHz: 0.08,
    noise: 0.09,
    pulseHz: 0.1,
    q: 0.95,
    why: "Hotter fifth. The kingside attack sits in the heat.",
  },
  london: {
    id: "london",
    room: "Triangle study",
    droneHz: 58,
    fifthHz: 87,
    filterHz: 390,
    lfoHz: 0.03,
    noise: 0.05,
    pulseHz: 0.03,
    q: 0.6,
    why: "Still water. The London does not hurry.",
  },
  "jobava-london": {
    id: "jobava-london",
    room: "Armoury",
    droneHz: 65,
    fifthHz: 97.5,
    filterHz: 560,
    lfoHz: 0.06,
    noise: 0.08,
    pulseHz: 0.075,
    q: 0.9,
    why: "A harder edge than the classical London — Nc3 in the room.",
  },
  "italian-attack": {
    id: "italian-attack",
    room: "Nave",
    droneHz: 52,
    fifthHz: 78,
    filterHz: 980,
    lfoHz: 0.045,
    noise: 0.06,
    pulseHz: 0.055,
    q: 0.65,
    why: "High sheen. Max Lange wants open air above the pews.",
  },
  "french-kia": {
    id: "french-kia",
    room: "Garden path",
    droneHz: 44,
    fifthHz: 66,
    filterHz: 470,
    lfoHz: 0.035,
    noise: 0.13,
    pulseHz: 0.04,
    q: 0.5,
    why: "Soft rain on leaves. The KIA walks, then storms.",
  },
  "caro-fantasy": {
    id: "caro-fantasy",
    room: "Glass corridor",
    droneHz: 70,
    fifthHz: 105,
    filterHz: 820,
    lfoHz: 0.065,
    noise: 0.07,
    pulseHz: 0.085,
    q: 1.05,
    why: "Thin, bright. Fantasy is a knife, not a wall.",
  },
  alapin: {
    id: "alapin",
    room: "Queen's balcony",
    droneHz: 61,
    fifthHz: 91.5,
    filterHz: 600,
    lfoHz: 0.048,
    noise: 0.06,
    pulseHz: 0.05,
    q: 0.8,
    why: "Centered, slightly regal. The queen sits in the middle.",
  },
  english: {
    id: "english",
    room: "Clamp hall",
    droneHz: 40,
    fifthHz: 60,
    filterHz: 320,
    lfoHz: 0.028,
    noise: 0.09,
    pulseHz: 0.035,
    q: 0.7,
    why: "Dark and held. Botvinnik clamp — the f-pawn still sleeps.",
  },
  "queens-gambit": {
    id: "queens-gambit",
    room: "Minority gallery",
    droneHz: 54,
    fifthHz: 81,
    filterHz: 450,
    lfoHz: 0.042,
    noise: 0.07,
    pulseHz: 0.06,
    q: 0.72,
    why: "A slow left-to-right sway. The minority walks the queenside.",
  },
  "black-lion": {
    id: "black-lion",
    room: "Coiled den",
    droneHz: 38,
    fifthHz: 57,
    filterHz: 250,
    lfoHz: 0.032,
    noise: 0.12,
    pulseHz: 0.045,
    q: 0.9,
    why: "Lowest growl. Hide, then bite — the room waits.",
  },
  pirc: {
    id: "pirc",
    room: "Long bishop hall",
    droneHz: 47,
    fifthHz: 70.5,
    filterHz: 360,
    lfoHz: 0.038,
    noise: 0.08,
    pulseHz: 0.05,
    q: 0.62,
    why: "A long dark diagonal. The bishop stares down the hall.",
  },
  dragon: {
    id: "dragon",
    room: "Opposite loft",
    droneHz: 78,
    fifthHz: 117,
    filterHz: 760,
    lfoHz: 0.1,
    noise: 0.1,
    pulseHz: 0.12,
    q: 1.15,
    why: "Highest pulse. Opposite-side race — the loft is awake.",
  },
  scandinavian: {
    id: "scandinavian",
    room: "Queen swing",
    droneHz: 67,
    fifthHz: 100.5,
    filterHz: 690,
    lfoHz: 0.07,
    noise: 0.08,
    pulseHz: 0.09,
    q: 0.88,
    why: "A sideways lilt. …Qa5 is the room's hinge.",
  },
  alekhine: {
    id: "alekhine",
    room: "Four-pawn kiln",
    droneHz: 50,
    fifthHz: 75,
    filterHz: 540,
    lfoHz: 0.06,
    noise: 0.14,
    pulseHz: 0.07,
    q: 0.58,
    why: "Heat shimmer in the noise. They pushed four pawns; the kiln glows.",
  },
  "caro-kann": {
    id: "caro-kann",
    room: "Wall room",
    droneHz: 43,
    fifthHz: 64.5,
    filterHz: 340,
    lfoHz: 0.025,
    noise: 0.05,
    pulseHz: 0.028,
    q: 0.52,
    why: "The stillest bed. The Caro wall does not fidget.",
  },
  "kings-indian": {
    id: "kings-indian",
    room: "Storm wing",
    droneHz: 56,
    fifthHz: 84,
    filterHz: 480,
    lfoHz: 0.085,
    noise: 0.12,
    pulseHz: 0.095,
    q: 0.78,
    why: "A gathering wind. Mar del Plata lives in the weather wing.",
  },
  "modern-benoni": {
    id: "modern-benoni",
    room: "Benoni alley",
    droneHz: 63,
    fifthHz: 94.5,
    filterHz: 610,
    lfoHz: 0.072,
    noise: 0.1,
    pulseHz: 0.08,
    q: 0.84,
    why: "Narrow brick. The Benoni fights in a tight street.",
  },
  benko: {
    id: "benko",
    room: "File balcony",
    droneHz: 48,
    fifthHz: 72,
    filterHz: 400,
    lfoHz: 0.05,
    noise: 0.09,
    pulseHz: 0.065,
    q: 0.68,
    why: "Open a- and b-file air. You gave a pawn for the balcony.",
  },
  "dutch-leningrad": {
    id: "dutch-leningrad",
    room: "G-file attic",
    droneHz: 71,
    fifthHz: 106.5,
    filterHz: 850,
    lfoHz: 0.078,
    noise: 0.11,
    pulseHz: 0.088,
    q: 0.92,
    why: "High wooden attic. The Leningrad looks down the g-file.",
  },
  budapest: {
    id: "budapest",
    room: "Romantic stair",
    droneHz: 59,
    fifthHz: 88.5,
    filterHz: 580,
    lfoHz: 0.058,
    noise: 0.07,
    pulseHz: 0.07,
    q: 0.77,
    why: "A slight waltz in the pulse. Romantic, not a grind.",
  },
  slav: {
    id: "slav",
    room: "Bishop-out chapel",
    droneHz: 45,
    fifthHz: 67.5,
    filterHz: 370,
    lfoHz: 0.033,
    noise: 0.06,
    pulseHz: 0.04,
    q: 0.64,
    why: "Cool stone, bishop already developed. Endings are welcome here.",
  },
};

const FALLBACK: FocusBed = {
  id: "fallback",
  room: "Quiet corridor",
  droneHz: 52,
  fifthHz: 78,
  filterHz: 440,
  lfoHz: 0.04,
  noise: 0.08,
  pulseHz: 0.05,
  q: 0.7,
  why: "Neutral corridor when a system is missing a bed.",
};

export function focusBedFor(systemId: string): FocusBed {
  return FOCUS_BEDS[systemId] ?? FALLBACK;
}

export function focusBedSignature(bed: FocusBed): string {
  return [bed.droneHz, bed.fifthHz, bed.filterHz, bed.lfoHz, bed.pulseHz, bed.noise]
    .map((n) => n.toFixed(3))
    .join(":");
}
