import { NextResponse } from "next/server";
import { isProviderDisabledError } from "@/lib/auth/errors";
import { supabasePublicConfig } from "@/lib/supabase/env";

export async function GET() {
  const { url, key, configured } = supabasePublicConfig();
  if (!configured) {
    return NextResponse.json({ enabled: null, reason: "config" });
  }

  try {
    const authorize = new URL("/auth/v1/authorize", url);
    authorize.searchParams.set("provider", "google");
    const res = await fetch(authorize, {
      method: "GET",
      redirect: "manual",
      headers: {
        Accept: "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    if (res.status >= 400) {
      const text = await res.text();
      if (isProviderDisabledError(text)) {
        return NextResponse.json({ enabled: false });
      }
    }

    return NextResponse.json({ enabled: true });
  } catch {
    return NextResponse.json({ enabled: null });
  }
}
