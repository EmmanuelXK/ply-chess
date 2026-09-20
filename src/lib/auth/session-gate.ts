import { AUTH_PROXY_TIMEOUT_MS, withTimeout } from "./timeout";

export const PUBLIC_PATHS = [
  "/login",
  "/auth/callback",
  "/auth/sign-out",
  "/auth/google",
] as const;

export type ClaimsProbe = () => Promise<{
  data?: { claims?: { sub?: string } | null } | null;
}>;

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * Login, OAuth, and static public routes must not wait on Supabase.
 * A hung getClaims() here is a blank black document on mobile.
 */
export function shouldSkipAuthSession(pathname: string): boolean {
  return isPublicPath(pathname);
}

/** Timeout or error → treat as signed-out so gating cannot stall TTFB. */
export async function signedInFromClaims(
  probe: ClaimsProbe,
  timeoutMs: number = AUTH_PROXY_TIMEOUT_MS,
): Promise<boolean> {
  try {
    const { data } = await withTimeout(probe(), timeoutMs);
    return Boolean(data?.claims?.sub);
  } catch {
    return false;
  }
}
