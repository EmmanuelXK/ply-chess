import type { SpeakerId, VoiceProsody } from "./types";

export const SPEAKER_PROSODY: Record<SpeakerId, VoiceProsody> = {
  aldric: {
    edgeRate: "-14%",
    edgePitch: "-8%",
    googleRate: 0.88,
    googlePitch: -3,
    webRate: 0.78,
    webPitch: 0.58,
    elevenSpeed: 0.86,
    elevenStability: 0.62,
    elevenStyle: 0.12,
  },
  kael: {
    edgeRate: "-4%",
    edgePitch: "+3%",
    googleRate: 1.04,
    googlePitch: 1.2,
    webRate: 0.98,
    webPitch: 0.92,
    elevenSpeed: 0.98,
    elevenStability: 0.42,
    elevenStyle: 0.32,
  },
  soren: {
    edgeRate: "-16%",
    edgePitch: "-10%",
    googleRate: 0.84,
    googlePitch: -4,
    webRate: 0.74,
    webPitch: 0.52,
    elevenSpeed: 0.82,
    elevenStability: 0.72,
    elevenStyle: 0.04,
  },
  rhea: {
    edgeRate: "-2%",
    edgePitch: "+5%",
    googleRate: 1.06,
    googlePitch: 2.2,
    webRate: 1.02,
    webPitch: 1.08,
    elevenSpeed: 1.02,
    elevenStability: 0.34,
    elevenStyle: 0.38,
  },
  silas: {
    edgeRate: "-10%",
    edgePitch: "-4%",
    googleRate: 0.9,
    googlePitch: -1.5,
    webRate: 0.86,
    webPitch: 0.7,
    elevenSpeed: 0.88,
    elevenStability: 0.64,
    elevenStyle: 0.08,
  },
  lena: {
    edgeRate: "-5%",
    edgePitch: "+2%",
    googleRate: 1.0,
    googlePitch: 0.8,
    webRate: 0.96,
    webPitch: 0.95,
    elevenSpeed: 0.96,
    elevenStability: 0.44,
    elevenStyle: 0.22,
  },
};

export function speakerProsody(speaker: SpeakerId): VoiceProsody {
  return SPEAKER_PROSODY[speaker];
}
