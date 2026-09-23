import { NextResponse, type NextRequest } from "next/server";
import { classifyAuthError } from "@/lib/auth/errors";
import { appOrigin, loginErrorUrl, safeInternalPath } from "@/lib/auth/redirect";
import { AUTH_OAUTH_START_TIMEOUT_MS, withTimeout } from "@/lib/auth/timeout";
import { createRouteHandlerSupabase } from "@/lib/supabase/server";

const NO_STORE = { "Cache-Control": "private, no-store" } as const;

export type AuthCodeClient = {
  auth: {
    exchangeCodeForSession: (
      code: string,
    ) => Promise<{ error: { message: string } | null }>;
  };
};

export type CreateCallbackClient = (
  request: NextRequest,
  response: NextResponse,
) => AuthCodeClient | null;

function noStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", NO_STORE["Cache-Control"]);
  return response;
}

function fail(
  origin: string,
  raw: string,
  next: string,
): NextResponse {
  return noStore(NextResponse.redirect(loginErrorUrl(origin, raw, next, classifyAuthError)));
}

export async function handleAuthCallback(
  request: NextRequest,
  createClient: CreateCallbackClient = createRouteHandlerSupabase,
  timeoutMs: number = AUTH_OAUTH_START_TIMEOUT_MS,
): Promise<NextResponse> {
  const url = new URL(request.url);
  const origin = appOrigin(request);
  const code = url.searchParams.get("code");
  const next = safeInternalPath(url.searchParams.get("next"));
  const oauthError = [
    url.searchParams.get("error"),
    url.searchParams.get("error_code"),
    url.searchParams.get("error_description"),
  ]
    .filter(Boolean)
    .join(" ");

  if (!code) {
    return fail(origin, oauthError || "google", next);
  }

  const destination = NextResponse.redirect(new URL(next, origin));
  noStore(destination);

  const supabase = createClient(request, destination);
  if (!supabase) {
    return fail(origin, "config", next);
  }

  try {
    const { error } = await withTimeout(
      supabase.auth.exchangeCodeForSession(code),
      timeoutMs,
    );
    if (error) {
      return fail(origin, error.message, next);
    }
  } catch {
    return fail(origin, "google", next);
  }

  return destination;
}
