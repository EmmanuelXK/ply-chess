import { NextResponse, type NextRequest } from "next/server";
import { appOrigin } from "@/lib/auth/redirect";
import { createRouteHandlerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const login = NextResponse.redirect(new URL("/login", appOrigin(request)), {
    status: 303,
  });
  login.headers.set("Cache-Control", "private, no-store");
  const supabase = createRouteHandlerSupabase(request, login);
  if (supabase) await supabase.auth.signOut();
  return login;
}
