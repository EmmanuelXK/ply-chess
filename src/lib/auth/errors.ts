export type AuthKind = "google" | "phone" | "otp";

function extractErrorText(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as {
        msg?: string;
        message?: string;
        error_description?: string;
        error_code?: string;
      };
      return (
        parsed.msg ??
        parsed.error_description ??
        parsed.message ??
        parsed.error_code ??
        raw
      );
    } catch {
      /* Keep the original string when JSON is incomplete. */
    }
  }
  return raw;
}

export function isProviderDisabledError(raw: string): boolean {
  const text = extractErrorText(raw).toLowerCase();
  return /unsupported provider|provider is not enabled|provider_disabled/.test(text);
}

export function classifyAuthError(raw: string): "provider" | "google" | "config" {
  const text = extractErrorText(raw).toLowerCase();
  if (text === "config" || /auth is not configured/.test(text)) return "config";
  if (isProviderDisabledError(raw) || text === "provider") return "provider";
  return "google";
}

export function friendlyAuthMessage(raw: string, kind: AuthKind): string {
  const extracted = extractErrorText(raw);
  const lower = extracted.toLowerCase();

  if (lower === "config" || /auth is not configured/.test(lower)) {
    return "Auth is not configured on this deploy.";
  }

  if (isProviderDisabledError(raw) || lower === "provider") {
    return kind === "google"
      ? "Google sign-in is not switched on yet. Ask the club host to enable it."
      : "Phone sign-in is not switched on yet. Ask the club host to enable it.";
  }

  if (/rate.?limit|too many|over_sms|sms_send/.test(lower)) {
    return "Too many codes. Wait a minute and try again.";
  }

  if (kind === "otp" && /invalid|expired|otp|token/.test(lower)) {
    return "That code did not match. Check the text and try again.";
  }

  if (kind === "phone" && /invalid|phone|unprocessable/.test(lower)) {
    return "Check the number. Use a mobile that can receive texts.";
  }

  if (kind === "google") {
    if (/access_denied|user.?denied|cancelled|canceled/.test(lower)) {
      return "Google sign-in was cancelled. Try again when you are ready.";
    }
    return "Google sign-in did not finish. Try again.";
  }

  if (kind === "otp") {
    return "That code did not match. Check the text and try again.";
  }

  return "Could not send a text. Check the number and try again.";
}

export function noteFromSearchParams(params: {
  get(name: string): string | null;
}): string {
  const parts = [
    params.get("error"),
    params.get("error_code"),
    params.get("error_description"),
    params.get("msg"),
  ].filter((value): value is string => Boolean(value));
  if (parts.length === 0) return "";
  return friendlyAuthMessage(parts.join(" "), "google");
}
