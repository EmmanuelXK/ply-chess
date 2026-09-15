import { NextResponse, type NextRequest } from "next/server";
import { classifyAuthError } from "@/lib/auth/errors";
import { appOrigin, loginErrorUrl, safeInternalPath } from "@/lib/auth/redirect";
import { AUTH_OAUTH_START_TIMEOUT_MS, withTimeout } from "@/lib/auth/timeout";
import { supabasePublicConfig } from "@/lib/supabase/env";
import { copyResponseCookies, createRouteHandlerSupabase } from "@/lib/supabase/server";

const NO_STORE = { "Cache-Control": "private, no-store" } as const;

export type GoogleStartClient = {
  auth: {
    signInWithOAuth: (args: {
      provider: "google";
      options: { redirectTo: string };
    }) => Promise<{
      data: { url: string | null };
      error: { message: string } | null;
    }>;
  };
};

export type CreateGoogleStartClient = (
  request: NextRequest,
  response: NextResponse,
) => GoogleStartClient | null;

function noStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", NO_STORE["Cache-Control"]);
  return response;
}

function fail(origin: string, raw: string, next: string): NextResponse {
  return noStore(
    NextResponse.redirect(loginErrorUrl(origin, raw, next, classifyAuthError)),
  );
}

/** Any HTTP response means DNS/TCP worked. Hang or throw means Auth is down. */
export async function probeSupabaseAuth(
  timeoutMs: number = AUTH_OAUTH_START_TIMEOUT_MS,
): Promise<void> {
  const { url } = supabasePublicConfig();
  if (!url) return;
  await fetch(new URL("/auth/v1/health", url), {
    method: "GET",
    cache: "no-store",
    redirect: "manual",
    signal: AbortSignal.timeout(timeoutMs),
  });
}

/**
 * Server-side Google OAuth start so the login CTA is a real link.
 * Works before client JS, and fails closed to /login if Supabase hangs.
 */
export async function handleGoogleStart(
  request: NextRequest,
  createClient: CreateGoogleStartClient = createRouteHandlerSupabase,
  timeoutMs: number = AUTH_OAUTH_START_TIMEOUT_MS,
  reachable: () => Promise<unknown> = () => probeSupabaseAuth(timeoutMs),
): Promise<NextResponse> {
  const origin = appOrigin(request);
  const next = safeInternalPath(request.nextUrl.searchParams.get("next"));

  try {
    await withTimeout(Promise.resolve().then(() => reachable()), timeoutMs);
  } catch {
    return fail(origin, "google", next);
  }

  const cookieJar = NextResponse.next();
  noStore(cookieJar);

  const supabase = createClient(request, cookieJar);
  if (!supabase) {
    return fail(origin, "config", next);
  }

  try {
    const { data, error } = await withTimeout(
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      }),
      timeoutMs,
    );
    if (error || !data.url) {
      return fail(origin, error?.message ?? "google", next);
    }
    const dest = NextResponse.redirect(data.url);
    noStore(dest);
    copyResponseCookies(cookieJar, dest);
    return dest;
  } catch {
    return fail(origin, "google", next);
  }
}
