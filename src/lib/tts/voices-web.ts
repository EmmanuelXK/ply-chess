import type { SpeakerId } from "./types";

const PREFS: Record<SpeakerId, RegExp[]> = {
  aldric: [
    /daniel/i,
    /george/i,
    /rishi/i,
    /uk english male/i,
    /english united kingdom/i,
    /microsoft david/i,
    /ryan/i,
  ],
  kael: [
    /ava/i,
    /samantha/i,
    /siri/i,
    /zira/i,
    /jenny/i,
    /sara/i,
    /female/i,
  ],
  soren: [/daniel/i, /rishi/i, /uk english male/i, /thomas/i, /oliver/i, /male/i],
  rhea: [/jenny/i, /samantha/i, /siri/i, /zira/i, /aria/i, /female/i],
  silas: [/andrew/i, /alex/i, /fred/i, /david/i, /christopher/i, /male/i],
  lena: [/emma/i, /samantha/i, /karen/i, /jenny/i, /zira/i, /female/i],
};

const FEMALE: SpeakerId[] = ["kael", "rhea", "lena"];

export function pickWebVoice(
  speaker: SpeakerId,
  preferName?: string,
): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  if (preferName) {
    const named = voices.find(
      (v) => v.name.toLowerCase() === preferName.toLowerCase() && /^en/i.test(v.lang),
    );
    if (named) return named;
  }
  for (const pref of PREFS[speaker]) {
    const hit = voices.find((v) => pref.test(v.name) && /^en/i.test(v.lang));
    if (hit) return hit;
  }
  const english = voices.filter((v) => /^en/i.test(v.lang));
  if (FEMALE.includes(speaker)) {
    return english.find((v) => /female|samantha|karen|zira|aria|ava|jenny|emma|sara/i.test(v.name));
  }
  return english.find((v) => /male|daniel|alex|fred|ryan|andrew/i.test(v.name)) ?? english[0];
}
