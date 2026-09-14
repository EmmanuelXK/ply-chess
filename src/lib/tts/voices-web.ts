import { COACH_SPEAKER, type SpeakerId } from "./types";

const MALE_PREFS: RegExp[] = [
  /daniel/i,
  /george/i,
  /rishi/i,
  /uk english male/i,
  /english united kingdom/i,
  /microsoft david/i,
  /ryan/i,
  /andrew/i,
  /thomas/i,
  /male/i,
];

export function pickWebVoice(
  speaker: SpeakerId = COACH_SPEAKER,
  preferName?: string,
): SpeechSynthesisVoice | undefined {
  void speaker;
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  if (preferName && !/female|ava|jenny|emma|samantha|zira|aria|sara/i.test(preferName)) {
    const named = voices.find(
      (v) => v.name.toLowerCase() === preferName.toLowerCase() && /^en/i.test(v.lang),
    );
    if (named) return named;
  }
  for (const pref of MALE_PREFS) {
    const hit = voices.find((v) => pref.test(v.name) && /^en/i.test(v.lang));
    if (hit) return hit;
  }
  const english = voices.filter((v) => /^en/i.test(v.lang));
  return (
    english.find((v) => /male|daniel|alex|fred|ryan|andrew|george|david/i.test(v.name)) ??
    english.find((v) => !/female|ava|jenny|emma|samantha|zira|aria|sara/i.test(v.name))
  );
}
