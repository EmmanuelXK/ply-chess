export type TtsProviderId = "elevenlabs" | "google" | "edge" | "webspeech";

export type SpeakerId =
  | "aldric"
  | "kael"
  | "soren"
  | "rhea"
  | "silas"
  | "lena";

export const SPEAKER_IDS: SpeakerId[] = [
  "aldric",
  "kael",
  "soren",
  "rhea",
  "silas",
  "lena",
];

export interface TtsRequest {
  text: string;
  speaker: SpeakerId;
  /** Character voices via ElevenLabs when a key is present. */
  premium?: boolean;
}

export interface TtsClip {
  audio: Buffer;
  contentType: string;
  provider: Exclude<TtsProviderId, "webspeech">;
}

export interface VoiceProsody {
  /** Edge SSML rate, e.g. "-12%" */
  edgeRate: string;
  /** Edge SSML pitch, e.g. "-6%" */
  edgePitch: string;
  /** Google speakingRate (0.25–4.0) */
  googleRate: number;
  /** Google pitch in semitones (−20–20) */
  googlePitch: number;
  webRate: number;
  webPitch: number;
  elevenSpeed: number;
  elevenStability: number;
  elevenStyle: number;
}
