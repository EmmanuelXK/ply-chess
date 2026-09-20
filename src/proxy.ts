import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isPublicPath, signedInFromClaims } from "@/lib/auth/session-gate";
import { AUTH_PROXY_TIMEOUT_MS } from "@/lib/auth/timeout";
import { authIsRequired, supabasePublicConfig } from "@/lib/supabase/env";
import { copyResponseCookies } from "@/lib/supabase/server";

function redirectKeepingCookies(target: URL, source: NextResponse): NextResponse {
  const dest = NextResponse.redirect(target);
  copyResponseCookies(source, dest);
  return dest;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });
  const { url, key, configured } = supabasePublicConfig();

  if (!configured) {
    if (authIsRequired() && !isPublicPath(pathname)) {
      const login = request.nextUrl.clone();
      login.pathname = "/login";
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    return response;
  }

  // Public routes must paint even if Supabase is slow or DNS-fails.
  // Login is one of them — getClaims() here was hanging TTFB on phones.
  if (isPublicPath(pathname)) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet, headers) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers ?? {}).forEach(([header, value]) => {
          response.headers.set(header, value);
        });
      },
    },
  });

  const signedIn = await signedInFromClaims(
    () => supabase.auth.getClaims(),
    AUTH_PROXY_TIMEOUT_MS,
  );

  if (!signedIn) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", pathname);
    return redirectKeepingCookies(login, response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|wasm|mp3)$).*)",
  ],
};
