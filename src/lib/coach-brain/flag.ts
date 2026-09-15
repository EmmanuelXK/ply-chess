const STORAGE_KEY = "opening-edge.coach-brain-v2";

function readStored(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
}

/** Env preview kill-switch. Unset / unknown = off. */
export function coachBrainV2FromEnv(raw: string | null | undefined): boolean {
  const value = raw?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "on";
}

/** Settings toggle. Only an explicit "1" turns the brain on. */
export function coachBrainV2FromStored(raw: string | null): boolean {
  return raw === "1";
}

export function readCoachBrainV2Stored(): boolean {
  return coachBrainV2FromStored(readStored());
}

export function writeCoachBrainV2Stored(on: boolean): void {
  writeStored(on ? "1" : "0");
}

/**
 * COACH_BRAIN_V2 — default OFF so the shipped coach path stays safe.
 * Either NEXT_PUBLIC_COACH_BRAIN_V2 or the settings toggle can enable it.
 */
export function isCoachBrainV2Enabled(): boolean {
  if (coachBrainV2FromEnv(process.env.NEXT_PUBLIC_COACH_BRAIN_V2)) return true;
  return readCoachBrainV2Stored();
}
