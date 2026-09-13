"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { supabasePublicConfig } from "@/lib/supabase/env";
import { sanitizeOtp, sanitizePhone } from "@/lib/auth/sanitize";
import { APP_MARK } from "@/lib/version";

export function LoginScreen() {
  const params = useSearchParams();
  const configured = supabasePublicConfig().configured;
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState<"google" | "sms" | "otp" | null>(null);
  const [note, setNote] = useState(() => {
    if (params.get("error") === "google") return "Google sign-in did not finish. Try again.";
    return "";
  });

  const next = params.get("next") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const google = async () => {
    const supabase = createBrowserSupabase();
    if (!supabase) {
      setNote("Auth is not configured on this deploy.");
      return;
    }
    setBusy("google");
    setNote("");
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setNote(error.message);
      setBusy(null);
    }
  };

  const sendSms = async () => {
    const supabase = createBrowserSupabase();
    const e164 = sanitizePhone(phone);
    if (!supabase || !e164) {
      setNote("Use an international number, like +447911123456.");
      return;
    }
    setBusy("sms");
    setNote("");
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
    setBusy(null);
    if (error) {
      setNote(error.message);
      return;
    }
    setSent(true);
    setNote("Code sent. Check your texts.");
  };

  const verify = async () => {
    const supabase = createBrowserSupabase();
    const e164 = sanitizePhone(phone);
    const token = sanitizeOtp(code);
    if (!supabase || !e164 || !token) {
      setNote("Enter the 6-digit code from your text.");
      return;
    }
    setBusy("otp");
    const { error } = await supabase.auth.verifyOtp({
      phone: e164,
      token,
      type: "sms",
    });
    setBusy(null);
    if (error) {
      setNote(error.message);
      return;
    }
    window.location.assign(safeNext);
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <img src="/icon-192.png" alt="" width={72} height={72} className="auth-mark" />
        <p className="dash-kicker">Club login</p>
        <h1>Opening Edge</h1>
        <p className="auth-lead">Sign in to train. Every signed-in friend gets the full board.</p>

        {!configured ? (
          <p className="auth-note">
            Google and Phone are ready in the app. Add the public Supabase URL and
            publishable key on Vercel to turn the wall on. See LAUNCH.md.
          </p>
        ) : null}

        <button
          type="button"
          className="auth-google"
          onClick={() => void google()}
          disabled={busy !== null}
        >
          {busy === "google" ? "Opening Google…" : "Continue with Google"}
        </button>

        <div className="auth-or" aria-hidden>
          or
        </div>

        <label className="auth-label" htmlFor="phone">
          Phone
        </label>
        <input
          id="phone"
          className="auth-input"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+44 7911 123456"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {sent ? (
          <>
            <label className="auth-label" htmlFor="otp">
              Text code
            </label>
            <input
              id="otp"
              className="auth-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              type="button"
              className="auth-phone"
              onClick={() => void verify()}
              disabled={busy !== null}
            >
              {busy === "otp" ? "Checking…" : "Verify code"}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="auth-phone"
            onClick={() => void sendSms()}
            disabled={busy !== null}
          >
            {busy === "sms" ? "Sending…" : "Text me a code"}
          </button>
        )}

        {note ? <p className="auth-note">{note}</p> : null}
        <p className="auth-foot">{APP_MARK}</p>
      </div>
    </div>
  );
}
