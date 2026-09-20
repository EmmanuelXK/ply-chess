import { createBrowserClient } from "@supabase/ssr";
import { supabasePublicConfig } from "./env";

export function createBrowserSupabase() {
  const { url, key, configured } = supabasePublicConfig();
  if (!configured) return null;
  return createBrowserClient(url, key);
}
