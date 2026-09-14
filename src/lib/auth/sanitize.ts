export type SidePref = "white" | "black" | "both";

export interface ProfileDraft {
  displayName: string;
  initials: string;
  sidePref: SidePref;
  clubTag: string;
}

export function sanitizeName(raw: string): string {
  return raw.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
}

export function sanitizeInitials(raw: string, fallback = ""): string {
  const letters = raw.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 2);
  if (letters) return letters;
  return fallback.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 2);
}

export function sanitizeClubTag(raw: string): string {
  return raw.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);
}

export function sanitizeSide(raw: string): SidePref {
  if (raw === "white" || raw === "black") return raw;
  return "both";
}

export function sanitizePhone(raw: string): string | null {
  const compact = raw.replace(/[^\d+]/g, "");
  if (!/^\+[1-9]\d{7,14}$/.test(compact)) return null;
  return compact;
}

export function sanitizeOtp(raw: string): string | null {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  return digits.length >= 6 ? digits : null;
}

export function draftFromRaw(input: {
  displayName: string;
  initials: string;
  sidePref: string;
  clubTag: string;
}): ProfileDraft {
  const displayName = sanitizeName(input.displayName);
  return {
    displayName,
    initials: sanitizeInitials(input.initials, displayName),
    sidePref: sanitizeSide(input.sidePref),
    clubTag: sanitizeClubTag(input.clubTag),
  };
}
