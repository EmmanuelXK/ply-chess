export const AUTH_CALLBACK_PATH = "/auth/callback";

/** Same-origin path after login. Reject protocol-relative and off-site URLs. */
export function safeInternalPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.includes("\\") || value.includes("://")) return "/";
  return value;
}

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname || "/";
}

/**
 * PKCE `code` that landed on Site URL `/` or `/login` (or any non-callback
 * path) must be exchanged on `/auth/callback`. Returns a same-origin path
 * + query, or null when this request is already the callback / has no code.
 */
export function strayOAuthCallbackPath(
  pathname: string,
  searchParams: URLSearchParams,
): string | null {
  const code = searchParams.get("code");
  if (!code) return null;

  const path = normalizePathname(pathname);
  if (path === AUTH_CALLBACK_PATH || path.startsWith(`${AUTH_CALLBACK_PATH}/`)) {
    return null;
  }

  const params = new URLSearchParams(searchParams);
  if (!params.get("next")) {
    params.set("next", path === "/login" ? "/" : safeInternalPath(pathname));
  }
  return `${AUTH_CALLBACK_PATH}?${params.toString()}`;
}

export function searchParamsFromRecord(
  query: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    const raw = Array.isArray(value) ? value[0] : value;
    if (raw) params.set(key, raw);
  }
  return params;
}

/**
 * Public origin for auth redirects. Prefer the forwarded host so a custom
 * domain (blitzbar.app) is not replaced by the Vercel deployment host.
 */
export function appOrigin(request: Request): string {
  const url = new URL(request.url);
  const rawHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const host = rawHost?.split(",")[0]?.trim() ?? "";
  if (!host || /[^a-zA-Z0-9.:-]/.test(host)) return url.origin;

  const rawProto =
    request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const proto = rawProto.split(",")[0]?.trim() ?? "https";
  if (proto !== "http" && proto !== "https") return url.origin;
  return `${proto}://${host}`;
}

export function loginErrorUrl(
  origin: string,
  rawError: string,
  next: string,
  classify: (raw: string) => string,
): URL {
  const fail = new URL("/login", origin);
  fail.searchParams.set("error", classify(rawError));
  fail.searchParams.set("next", safeInternalPath(next));
  return fail;
}
