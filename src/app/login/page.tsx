import { redirect } from "next/navigation";
import { LoginScreen } from "@/components/auth/login-screen";
import { noteFromSearchParams } from "@/lib/auth/errors";
import {
  safeInternalPath,
  searchParamsFromRecord,
  strayOAuthCallbackPath,
} from "@/lib/auth/redirect";
import { supabasePublicConfig } from "@/lib/supabase/env";

export const metadata = {
  title: "Login · Opening Edge",
};

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const stray = strayOAuthCallbackPath("/login", searchParamsFromRecord(query));
  if (stray) redirect(stray);

  const params = {
    get(name: string) {
      return firstParam(query[name]);
    },
  };
  const next = safeInternalPath(firstParam(query.next));
  const note = noteFromSearchParams(params);
  const configured = supabasePublicConfig().configured;

  return <LoginScreen next={next} note={note} configured={configured} />;
}
