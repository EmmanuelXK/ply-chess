"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { supabasePublicConfig } from "@/lib/supabase/env";
import { friendlyAuthMessage, noteFromSearchParams } from "@/lib/auth/errors";
import { safeInternalPath } from "@/lib/auth/redirect";
import { APP_MARK } from "@/lib/version";

function GoogleMark() {
  return (
    <svg className="auth-google-mark" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function LoginScreen() {
  const params = useSearchParams();
  const configured = supabasePublicConfig().configured;
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(() => noteFromSearchParams(params));

  const safeNext = safeInternalPath(params.get("next"));

  const google = async () => {
    const supabase = createBrowserSupabase();
    if (!supabase) {
      setNote(friendlyAuthMessage("config"));
      return;
    }
    setBusy(true);
    setNote("");
    try {
      const probe = await fetch("/auth/google/status", { cache: "no-store" });
      const status = (await probe.json()) as { enabled?: boolean | null };
      if (status.enabled === false) {
        setNote(friendlyAuthMessage("provider"));
        setBusy(false);
        return;
      }
    } catch {
      /* Probe is best-effort. Still try OAuth so a flaky check cannot block a working provider. */
    }
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) {
      setNote(friendlyAuthMessage(error?.message ?? "google"));
      setBusy(false);
      return;
    }
    window.location.assign(data.url);
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <img src="/icon-192.png" alt="" width={72} height={72} className="auth-mark" />
        <p className="dash-kicker">Club login</p>
        <h1>Opening Edge</h1>
        <p className="auth-lead">
          Sign in with Google to train. Every signed-in friend gets the full board.
        </p>

        {!configured ? (
          <p className="auth-note">
            Google sign-in is ready in the app. Add the public Supabase URL and
            publishable key on Vercel to turn the wall on. See LAUNCH.md.
          </p>
        ) : null}

        <button
          type="button"
          className="auth-google"
          onClick={() => void google()}
          disabled={busy}
        >
          <GoogleMark />
          {busy ? "Opening Google…" : "Continue with Google"}
        </button>

        {note ? <p className="auth-note auth-note-warn">{note}</p> : null}
        <p className="auth-foot">{APP_MARK}</p>
      </div>
    </div>
  );
}
