import { NextResponse } from "next/server";
import { classifyAuthError } from "@/lib/auth/errors";
import { createServerSupabase } from "@/lib/supabase/server";

function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function failToLogin(url: URL, raw: string, next: string) {
  const fail = new URL("/login", url.origin);
  fail.searchParams.set("error", classifyAuthError(raw));
  fail.searchParams.set("next", next);
  return NextResponse.redirect(fail);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const oauthError = [
    url.searchParams.get("error"),
    url.searchParams.get("error_code"),
    url.searchParams.get("error_description"),
  ]
    .filter(Boolean)
    .join(" ");

  if (!code && oauthError) {
    return failToLogin(url, oauthError, next);
  }

  const supabase = await createServerSupabase();

  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return failToLogin(url, error.message, next);
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
