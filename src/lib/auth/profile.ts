import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  draftFromRaw,
  sanitizeInitials,
  sanitizeName,
  type ProfileDraft,
  type SidePref,
} from "./sanitize";

export interface ClubProfile extends ProfileDraft {
  id: string;
}

function labelFromUser(user: User): string {
  const meta = user.user_metadata ?? {};
  const named =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    "";
  const fromName = sanitizeName(named);
  if (fromName) return fromName;
  if (user.phone) return `Club ${user.phone.slice(-4)}`;
  return "Club player";
}

export function profileSeed(user: User): ClubProfile {
  const displayName = labelFromUser(user);
  return {
    id: user.id,
    displayName,
    initials: sanitizeInitials("", displayName) || "OE",
    sidePref: "both",
    clubTag: "",
  };
}

export async function loadProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<ClubProfile> {
  const seed = profileSeed(user);
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, initials, side_pref, club_tag")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    await supabase.from("profiles").upsert({
      id: user.id,
      display_name: seed.displayName,
      initials: seed.initials,
      side_pref: seed.sidePref,
      club_tag: seed.clubTag,
    });
    return seed;
  }

  return {
    id: user.id,
    displayName: sanitizeName(data.display_name ?? seed.displayName),
    initials: sanitizeInitials(data.initials ?? "", seed.displayName) || "OE",
    sidePref: (data.side_pref as SidePref) || "both",
    clubTag: data.club_tag ?? "",
  };
}

export async function saveProfile(
  supabase: SupabaseClient,
  userId: string,
  draft: ProfileDraft,
): Promise<ClubProfile> {
  const clean = draftFromRaw(draft);
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    display_name: clean.displayName,
    initials: clean.initials,
    side_pref: clean.sidePref,
    club_tag: clean.clubTag,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return { id: userId, ...clean };
}
