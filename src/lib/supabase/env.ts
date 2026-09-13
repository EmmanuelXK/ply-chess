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

export function authIsRequired(): boolean {
  if (supabasePublicConfig().configured) return true;
  return process.env.VERCEL_ENV === "production";
}
