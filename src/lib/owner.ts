import {
  draftFromRaw,
  type ProfileDraft,
  type SidePref,
} from "@/lib/auth/sanitize";

/** Personal copy of Opening Edge. Shown without a session. */
export const OWNER_NAME = "Rajitha Emmanuel";

export const OWNER_KEY = "opening-edge.owner.v1";
const OWNER_EVENT = "opening-edge-owner";

export interface LocalOwner extends ProfileDraft {
  sidePref: SidePref;
}

export function defaultOwner(): LocalOwner {
  return {
    displayName: OWNER_NAME,
    initials: "RE",
    sidePref: "both",
    clubTag: "",
  };
}

export function readLocalOwner(): LocalOwner | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(OWNER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ProfileDraft>;
    const clean = draftFromRaw({
      displayName: parsed.displayName ?? "",
      initials: parsed.initials ?? "",
      sidePref: parsed.sidePref ?? "both",
      clubTag: parsed.clubTag ?? "",
    });
    if (!clean.displayName) return null;
    return clean;
  } catch {
    return null;
  }
}

export function writeLocalOwner(draft: ProfileDraft): LocalOwner {
  const clean = draftFromRaw(draft);
  const next = defaultOwner();
  const stored: LocalOwner = {
    displayName: clean.displayName || next.displayName,
    initials: clean.initials || next.initials,
    sidePref: clean.sidePref,
    clubTag: clean.clubTag,
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(OWNER_KEY, JSON.stringify(stored));
      window.dispatchEvent(new Event(OWNER_EVENT));
    } catch {
      /* Private mode can refuse storage. The name still paints. */
    }
  }
  return stored;
}

export function ownerLabel(localName?: string | null, sessionName?: string | null): string {
  const local = localName?.trim();
  if (local) return local;
  const session = sessionName?.trim();
  if (session) return session;
  return OWNER_NAME;
}
