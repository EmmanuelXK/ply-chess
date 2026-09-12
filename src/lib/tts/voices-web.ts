import type { SpeakerId } from "./types";

const PREFS: Record<SpeakerId, RegExp[]> = {
  aldric: [
    /daniel/i,
    /george/i,
    /rishi/i,
    /uk english male/i,
    /english united kingdom/i,
    /microsoft david/i,
  ],
  kael: [/alex/i, /fred/i, /guy/i, /microsoft mark/i, /english united states/i],
  soren: [/daniel/i, /rishi/i, /uk english male/i, /thomas/i, /male/i],
  rhea: [/samantha/i, /siri/i, /zira/i, /aria/i, /female/i],
  silas: [/alex/i, /fred/i, /david/i, /christopher/i, /male/i],
  lena: [/samantha/i, /karen/i, /jenny/i, /zira/i, /female/i],
};

export function pickWebVoice(
  speaker: SpeakerId,
): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  for (const pref of PREFS[speaker]) {
    const hit = voices.find((v) => pref.test(v.name) && /^en/i.test(v.lang));
    if (hit) return hit;
  }
  const english = voices.filter((v) => /^en/i.test(v.lang));
  if (speaker === "rhea" || speaker === "lena") {
    return english.find((v) => /female|samantha|karen|zira|aria/i.test(v.name));
  }
  return english.find((v) => /male|daniel|alex|fred/i.test(v.name)) ?? english[0];
}
