import type { SpeakerId } from "./types";

export type VoiceGender = "male" | "female";

export interface VoiceChoice {
  id: string;
  label: string;
  gender: VoiceGender;
}

/** Warm conversational neurals — not newsreader defaults. */
export const EDGE_VOICE_POOL: VoiceChoice[] = [
  { id: "en-GB-RyanNeural", label: "GB Ryan · warm, older male", gender: "male" },
  { id: "en-GB-ThomasNeural", label: "GB Thomas · lighter male", gender: "male" },
  { id: "en-GB-AlfieNeural", label: "GB Alfie · younger male", gender: "male" },
  { id: "en-GB-NoahNeural", label: "GB Noah · even male", gender: "male" },
  { id: "en-US-DavisNeural", label: "US Davis · low conversational", gender: "male" },
  { id: "en-US-AndrewNeural", label: "US Andrew · warm male", gender: "male" },
  { id: "en-US-JasonNeural", label: "US Jason · dry male", gender: "male" },
  { id: "en-US-GuyNeural", label: "US Guy · punchy male", gender: "male" },
  { id: "en-US-ChristopherNeural", label: "US Christopher · darker male", gender: "male" },
  { id: "en-US-JennyNeural", label: "US Jenny · bright, sharp female", gender: "female" },
  { id: "en-US-AvaNeural", label: "US Ava · warm female", gender: "female" },
  { id: "en-US-AriaNeural", label: "US Aria · clear female", gender: "female" },
  { id: "en-IE-EmilyNeural", label: "Irish Emily · warm female", gender: "female" },
  { id: "en-AU-NatashaNeural", label: "AU Natasha · bright female", gender: "female" },
  { id: "en-GB-SoniaNeural", label: "GB Sonia · soft female", gender: "female" },
  { id: "en-GB-LibbyNeural", label: "GB Libby · light female", gender: "female" },
];

export const SPEAKER_GENDER: Record<SpeakerId, VoiceGender> = {
  aldric: "male",
  kael: "female",
  soren: "male",
  rhea: "female",
  silas: "male",
  lena: "female",
};

/** Free baseline: one male + one female per duo for headphone contrast. */
export const DEFAULT_EDGE_VOICES: Record<SpeakerId, string> = {
  aldric: "en-GB-RyanNeural",
  kael: "en-US-JennyNeural",
  soren: "en-GB-ThomasNeural",
  rhea: "en-US-AvaNeural",
  silas: "en-US-AndrewNeural",
  lena: "en-IE-EmilyNeural",
};

/** WaveNet defaults — 4M free chars/month, more generous than Neural2's 1M. */
export const DEFAULT_GOOGLE_VOICES: Record<SpeakerId, string> = {
  aldric: "en-GB-Wavenet-D",
  kael: "en-US-Wavenet-F",
  soren: "en-GB-Wavenet-B",
  rhea: "en-US-Wavenet-H",
  silas: "en-US-Wavenet-I",
  lena: "en-US-Wavenet-C",
};

export const SPEAKER_VOICE_BLURB: Record<
  SpeakerId,
  { name: string; duo: string; gender: VoiceGender; edge: string; google: string }
> = {
  aldric: {
    name: "Aldric Voss",
    duo: "Voss & Draven",
    gender: "male",
    edge: "GB Ryan · warm, older male",
    google: "en-GB-Wavenet-D",
  },
  kael: {
    name: "Kael Draven",
    duo: "Voss & Draven",
    gender: "female",
    edge: "US Jenny · bright, sharp female",
    google: "en-US-Wavenet-F",
  },
  soren: {
    name: "Soren Vale",
    duo: "Vale & Knox",
    gender: "male",
    edge: "GB Thomas · lighter male",
    google: "en-GB-Wavenet-B",
  },
  rhea: {
    name: "Rhea Knox",
    duo: "Vale & Knox",
    gender: "female",
    edge: "US Ava · warm female",
    google: "en-US-Wavenet-H",
  },
  silas: {
    name: "Silas Crowe",
    duo: "Crowe & Marquez",
    gender: "male",
    edge: "US Andrew · warm male",
    google: "en-US-Wavenet-I",
  },
  lena: {
    name: "Lena Marquez",
    duo: "Crowe & Marquez",
    gender: "female",
    edge: "Irish Emily · warm female",
    google: "en-US-Wavenet-C",
  },
};

const EDGE_IDS = new Set(EDGE_VOICE_POOL.map((v) => v.id));

export function isAllowedEdgeVoice(id: string): boolean {
  if (EDGE_IDS.has(id)) return true;
  return /^[a-z]{2}-[A-Z]{2}-[A-Za-z0-9]+Neural$/.test(id);
}

export function edgeVoiceLabel(id: string): string {
  return EDGE_VOICE_POOL.find((v) => v.id === id)?.label ?? id;
}

export function edgeVoicesForGender(gender: VoiceGender): VoiceChoice[] {
  return EDGE_VOICE_POOL.filter((v) => v.gender === gender);
}

export function maskVoiceId(id: string): string {
  const trimmed = id.trim();
  if (trimmed.length <= 4) return "••••";
  return `••••${trimmed.slice(-4)}`;
}
