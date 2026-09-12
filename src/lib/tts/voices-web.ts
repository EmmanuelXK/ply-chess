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
  kael: [/samantha/i, /zira/i, /jenny/i, /aria/i, /siri/i, /female/i],
  soren: [/daniel/i, /rishi/i, /uk english male/i, /thomas/i, /male/i],
  rhea: [/samantha/i, /siri/i, /zira/i, /ava/i, /aria/i, /female/i],
  silas: [/alex/i, /fred/i, /david/i, /andrew/i, /christopher/i, /male/i],
  lena: [/samantha/i, /karen/i, /emily/i, /jenny/i, /zira/i, /female/i],
};

const FEMALE: SpeakerId[] = ["kael", "rhea", "lena"];

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
  if (FEMALE.includes(speaker)) {
    return english.find((v) => /female|samantha|karen|zira|aria|jenny|ava/i.test(v.name));
  }
  return english.find((v) => /male|daniel|alex|fred/i.test(v.name)) ?? english[0];
}
