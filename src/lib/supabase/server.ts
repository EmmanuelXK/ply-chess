import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublicConfig } from "./env";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

export function applyCookiesToResponse(
  response: NextResponse,
  toSet: CookieToSet[],
  headers?: Record<string, string>,
) {
  toSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
}

/** Preserve Set-Cookie + cache headers when swapping a NextResponse. */
export function copyResponseCookies(from: NextResponse, to: NextResponse) {
  for (const cookie of from.headers.getSetCookie()) {
    to.headers.append("Set-Cookie", cookie);
  }
  for (const name of ["cache-control", "expires", "pragma"] as const) {
    const value = from.headers.get(name);
    if (value) to.headers.set(name, value);
  }
}

export async function createServerSupabase() {
  const { url, key, configured } = supabasePublicConfig();
  if (!configured) return null;
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet, _headers) {
        try {
          toSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          /* Server Components cannot always write cookies; proxy refreshes the session. */
        }
      },
    },
  });
}

/**
 * Route-handler client that writes session cookies onto a specific response.
 * Required for OAuth callbacks: Next.js does not copy `cookies().set()` onto
 * a later `NextResponse.redirect()`.
 */
export function createRouteHandlerSupabase(
  request: NextRequest,
  response: NextResponse,
) {
  const { url, key, configured } = supabasePublicConfig();
  if (!configured) return null;
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet, headers) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        applyCookiesToResponse(response, toSet, headers);
      },
    },
  });
}
