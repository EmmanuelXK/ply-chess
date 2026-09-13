import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authIsRequired, supabasePublicConfig } from "@/lib/supabase/env";
import { copyResponseCookies } from "@/lib/supabase/server";

const PUBLIC_PATHS = ["/login", "/auth/callback", "/auth/sign-out", "/auth/google"];
const OAUTH_HANDSHAKE = ["/auth/callback", "/auth/google"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function isOAuthHandshake(pathname: string): boolean {
  return OAUTH_HANDSHAKE.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

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
    if (authIsRequired() && !isPublic(pathname)) {
      const login = request.nextUrl.clone();
      login.pathname = "/login";
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    return response;
  }

  // Do not touch the session during the OAuth code exchange. getClaims() here
  // can miss or race the cookies the callback is about to write.
  if (isOAuthHandshake(pathname)) {
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

  let signedIn = false;
  try {
    const { data } = await supabase.auth.getClaims();
    signedIn = Boolean(data?.claims?.sub);
  } catch {
    signedIn = false;
  }

  if (!signedIn && !isPublic(pathname)) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", pathname);
    return redirectKeepingCookies(login, response);
  }

  if (signedIn && pathname === "/login") {
    const home = request.nextUrl.clone();
    home.pathname = "/";
    home.search = "";
    return redirectKeepingCookies(home, response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|wasm|mp3)$).*)",
  ],
};
