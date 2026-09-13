"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { supabasePublicConfig } from "@/lib/supabase/env";
import { friendlyAuthMessage, noteFromSearchParams } from "@/lib/auth/errors";
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRIES,
  countryByIso,
  normalizePhone,
  phoneHint,
} from "@/lib/auth/phone";
import { sanitizeOtp } from "@/lib/auth/sanitize";
import { APP_MARK } from "@/lib/version";

export function LoginScreen() {
  const params = useSearchParams();
  const configured = supabasePublicConfig().configured;
  const [country, setCountry] = useState(DEFAULT_PHONE_COUNTRY);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState<"google" | "sms" | "otp" | null>(null);
  const [phoneError, setPhoneError] = useState("");
  const [note, setNote] = useState(() => noteFromSearchParams(params));

  const next = params.get("next") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const selected = countryByIso(country);

  const resolvedPhone = () => {
    const result = normalizePhone(country, phone);
    if (!result.ok) {
      setPhoneError(phoneHint(country, result.reason));
      return null;
    }
    setPhoneError("");
    return result.e164;
  };

  const google = async () => {
    const supabase = createBrowserSupabase();
    if (!supabase) {
      setNote(friendlyAuthMessage("config", "google"));
      return;
    }
    setBusy("google");
    setNote("");
    try {
      const probe = await fetch("/auth/google/status", { cache: "no-store" });
      const status = (await probe.json()) as { enabled?: boolean | null };
      if (status.enabled === false) {
        setNote(friendlyAuthMessage("provider", "google"));
        setBusy(null);
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
      setNote(friendlyAuthMessage(error?.message ?? "google", "google"));
      setBusy(null);
      return;
    }
    window.location.assign(data.url);
  };

  const sendSms = async () => {
    const supabase = createBrowserSupabase();
    const e164 = resolvedPhone();
    if (!e164) return;
    if (!supabase) {
      setNote(friendlyAuthMessage("config", "phone"));
      return;
    }
    setBusy("sms");
    setNote("");
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
    setBusy(null);
    if (error) {
      setNote(friendlyAuthMessage(error.message, "phone"));
      return;
    }
    setSent(true);
    setNote("Code sent. Check your texts.");
  };

  const verify = async () => {
    const supabase = createBrowserSupabase();
    const e164 = resolvedPhone();
    const token = sanitizeOtp(code);
    if (!e164) return;
    if (!supabase || !token) {
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
      setNote(friendlyAuthMessage(error.message, "otp"));
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
        <div className="auth-phone-row">
          <label className="sr-only" htmlFor="phone-cc">
            Country code
          </label>
          <select
            id="phone-cc"
            className="auth-cc"
            value={country}
            autoComplete="tel-country-code"
            disabled={sent || busy !== null}
            onChange={(e) => {
              setCountry(e.target.value);
              setPhoneError("");
            }}
          >
            {PHONE_COUNTRIES.map((item) => (
              <option key={item.iso} value={item.iso}>
                {item.flag} +{item.dial}
              </option>
            ))}
          </select>
          <input
            id="phone"
            className="auth-input"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder={selected.placeholder}
            value={phone}
            disabled={sent}
            aria-invalid={phoneError ? true : undefined}
            aria-describedby={phoneError ? "phone-hint" : undefined}
            onChange={(e) => {
              setPhone(e.target.value);
              setPhoneError("");
            }}
          />
        </div>
        {phoneError ? (
          <p id="phone-hint" className="auth-note auth-note-warn" role="alert">
            {phoneError}
          </p>
        ) : null}
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
            <button
              type="button"
              className="auth-signout"
              onClick={() => {
                setSent(false);
                setCode("");
                setNote("");
              }}
              disabled={busy !== null}
            >
              Different number
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

        {note ? (
          <p className={note.startsWith("Code sent") ? "auth-note" : "auth-note auth-note-warn"}>
            {note}
          </p>
        ) : null}
        <p className="auth-foot">{APP_MARK}</p>
      </div>
    </div>
  );
}
