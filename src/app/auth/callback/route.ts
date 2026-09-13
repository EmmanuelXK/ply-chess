import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const supabase = await createServerSupabase();

  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const fail = new URL("/login", url.origin);
      fail.searchParams.set("error", "google");
      return NextResponse.redirect(fail);
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
