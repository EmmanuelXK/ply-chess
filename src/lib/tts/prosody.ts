import type { SpeakerId, VoiceProsody } from "./types";

/** Slower / clearer than newsreader defaults. Contrast inside each M/F duo. */
export const SPEAKER_PROSODY: Record<SpeakerId, VoiceProsody> = {
  aldric: {
    edgeRate: "-18%",
    edgePitch: "-8%",
    googleRate: 0.86,
    googlePitch: -3,
    webRate: 0.76,
    webPitch: 0.56,
    elevenSpeed: 0.84,
    elevenStability: 0.64,
    elevenStyle: 0.1,
  },
  kael: {
    edgeRate: "-8%",
    edgePitch: "+6%",
    googleRate: 0.96,
    googlePitch: 2,
    webRate: 0.92,
    webPitch: 1.08,
    elevenSpeed: 0.94,
    elevenStability: 0.4,
    elevenStyle: 0.3,
  },
  soren: {
    edgeRate: "-18%",
    edgePitch: "-10%",
    googleRate: 0.82,
    googlePitch: -4,
    webRate: 0.72,
    webPitch: 0.5,
    elevenSpeed: 0.8,
    elevenStability: 0.74,
    elevenStyle: 0.04,
  },
  rhea: {
    edgeRate: "-6%",
    edgePitch: "+4%",
    googleRate: 0.98,
    googlePitch: 1.8,
    webRate: 0.94,
    webPitch: 1.06,
    elevenSpeed: 0.96,
    elevenStability: 0.36,
    elevenStyle: 0.34,
  },
  silas: {
    edgeRate: "-14%",
    edgePitch: "-5%",
    googleRate: 0.88,
    googlePitch: -1.8,
    webRate: 0.82,
    webPitch: 0.66,
    elevenSpeed: 0.86,
    elevenStability: 0.66,
    elevenStyle: 0.08,
  },
  lena: {
    edgeRate: "-8%",
    edgePitch: "+3%",
    googleRate: 0.95,
    googlePitch: 1.2,
    webRate: 0.9,
    webPitch: 1.0,
    elevenSpeed: 0.92,
    elevenStability: 0.44,
    elevenStyle: 0.2,
  },
};

export function speakerProsody(speaker: SpeakerId): VoiceProsody {
  return SPEAKER_PROSODY[speaker];
}
