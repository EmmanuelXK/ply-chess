import type { SpeakerId, VoiceProsody } from "./types";

/** Slower, clearer conversational defaults. Women slightly brighter; men warmer. */
export const SPEAKER_PROSODY: Record<SpeakerId, VoiceProsody> = {
  aldric: {
    edgeRate: "-18%",
    edgePitch: "-6%",
    googleRate: 0.84,
    googlePitch: -2,
    webRate: 0.74,
    webPitch: 0.62,
    elevenSpeed: 0.82,
    elevenStability: 0.66,
    elevenStyle: 0.1,
  },
  kael: {
    edgeRate: "-10%",
    edgePitch: "+4%",
    googleRate: 0.92,
    googlePitch: 1.4,
    webRate: 0.86,
    webPitch: 1.02,
    elevenSpeed: 0.9,
    elevenStability: 0.46,
    elevenStyle: 0.28,
  },
  soren: {
    edgeRate: "-20%",
    edgePitch: "-8%",
    googleRate: 0.8,
    googlePitch: -3.2,
    webRate: 0.7,
    webPitch: 0.54,
    elevenSpeed: 0.78,
    elevenStability: 0.74,
    elevenStyle: 0.04,
  },
  rhea: {
    edgeRate: "-8%",
    edgePitch: "+5%",
    googleRate: 0.94,
    googlePitch: 2,
    webRate: 0.9,
    webPitch: 1.08,
    elevenSpeed: 0.92,
    elevenStability: 0.38,
    elevenStyle: 0.32,
  },
  silas: {
    edgeRate: "-16%",
    edgePitch: "-3%",
    googleRate: 0.86,
    googlePitch: -1.2,
    webRate: 0.8,
    webPitch: 0.72,
    elevenSpeed: 0.84,
    elevenStability: 0.66,
    elevenStyle: 0.08,
  },
  lena: {
    edgeRate: "-12%",
    edgePitch: "+2%",
    googleRate: 0.9,
    googlePitch: 0.8,
    webRate: 0.86,
    webPitch: 0.96,
    elevenSpeed: 0.88,
    elevenStability: 0.48,
    elevenStyle: 0.2,
  },
};

export function speakerProsody(speaker: SpeakerId): VoiceProsody {
  return SPEAKER_PROSODY[speaker];
}

export type TtsRatePref = "slow" | "clear" | "brisk";

export function rateScale(pref: TtsRatePref): number {
  if (pref === "slow") return 0.9;
  if (pref === "brisk") return 1.12;
  return 1;
}
