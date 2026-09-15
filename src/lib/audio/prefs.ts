const MUSIC_ON_KEY = "opening-edge.focus-music";

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

/** Unset defaults ON — the memory-palace bed is part of Learn. */
export function musicOnFromStored(raw: string | null): boolean {
  return raw !== "0";
}

export function readFocusMusicOn(): boolean {
  return musicOnFromStored(read(MUSIC_ON_KEY));
}

export function writeFocusMusicOn(on: boolean): void {
  write(MUSIC_ON_KEY, on ? "1" : "0");
}
