export type SpeakHandle = {
  stop: () => void;
  done: Promise<void>;
};

const MALE_PREFS = [
  /daniel/i,
  /george/i,
  /rishi/i,
  /uk english male/i,
  /english united kingdom/i,
  /microsoft david/i,
  /alex/i,
  /fred/i,
  /male/i,
];

function pickProfessorVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  for (const pref of MALE_PREFS) {
    const hit = voices.find((v) => pref.test(v.name) && /^en/i.test(v.lang));
    if (hit) return hit;
  }
  return voices.find((v) => /^en/i.test(v.lang));
}

function clauses(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?;:])\s+|(?<=—)\s+/)
    .map((c) => c.trim())
    .filter(Boolean);
}

function hash(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) >>> 0;
  return n;
}

/** Deep, strained, unhurried professor. Organic pacing — not a metronome. */
export function speakProfessor(
  text: string,
  opts?: { interrupt?: boolean },
): SpeakHandle {
  const empty = Promise.resolve();
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return { stop() {}, done: empty };
  }
  if (opts?.interrupt !== false) window.speechSynthesis.cancel();

  const parts = clauses(text);
  if (!parts.length) return { stop() {}, done: empty };

  let stopped = false;
  const voice = pickProfessorVoice();

  const done = (async () => {
    // Voices often populate asynchronously on iOS.
    if (!window.speechSynthesis.getVoices().length) {
      await new Promise<void>((resolve) => {
        const t = window.setTimeout(resolve, 250);
        window.speechSynthesis.addEventListener(
          "voiceschanged",
          () => {
            window.clearTimeout(t);
            resolve();
          },
          { once: true },
        );
      });
    }
    const chosen = voice ?? pickProfessorVoice();
    for (let i = 0; i < parts.length; i++) {
      if (stopped) return;
      const part = parts[i];
      const jitter = (hash(part) % 13) / 100;
      const hasSan = /\b(?:[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8]|O-O-O|O-O)\b/.test(
        part,
      );
      await new Promise<void>((resolve) => {
        const u = new SpeechSynthesisUtterance(part);
        u.lang = chosen?.lang ?? "en-GB";
        if (chosen) u.voice = chosen;
        u.rate = hasSan ? 0.72 + jitter * 0.4 : 0.78 + jitter;
        u.pitch = 0.58 + (hash(part + "p") % 10) / 80;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        window.speechSynthesis.speak(u);
      });
      if (stopped) return;
      const gap = 160 + (hash(part + "g") % 220);
      await new Promise((r) => window.setTimeout(r, gap));
    }
  })();

  return {
    stop() {
      stopped = true;
      window.speechSynthesis.cancel();
    },
    done,
  };
}

export function speak(text: string): SpeakHandle {
  return speakProfessor(text);
}

export function silence(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}
