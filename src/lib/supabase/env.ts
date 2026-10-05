/** Public browser config only. Never read a service-role or secret key here. */
export function supabasePublicConfig(): {
  url: string;
  key: string;
  configured: boolean;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    ""
  ).trim();
  return { url, key, configured: Boolean(url && key) };
}

/**
 * Personal Opening Edge is open on this phone.
 * Set OPENING_EDGE_REQUIRE_AUTH=1 to restore the login wall for a public launch.
 */
export function authIsRequired(): boolean {
  const flag = process.env.OPENING_EDGE_REQUIRE_AUTH?.trim().toLowerCase();
  return flag === "1" || flag === "true";
}
