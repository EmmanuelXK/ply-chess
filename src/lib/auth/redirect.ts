/** Same-origin path after login. Reject protocol-relative and off-site URLs. */
export function safeInternalPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.includes("\\") || value.includes("://")) return "/";
  return value;
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
