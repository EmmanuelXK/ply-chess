"use client";

import { useEffect, useState } from "react";
import { TabBar } from "@/components/app/tab-bar";
import { useAuth } from "@/components/auth/auth-provider";
import {
  readTtsRate,
  readVoiceOnDefault,
  writeTtsRate,
  writeVoiceOnDefault,
} from "@/lib/tts/prefs";
import type { TtsRatePref } from "@/lib/tts/prosody";
import type { SidePref } from "@/lib/auth/sanitize";
import { APP_MILESTONE, APP_VERSION } from "@/lib/version";

export function SettingsScreen() {
  const { configured, user, profile, save } = useAuth();
  const [rate, setRate] = useState<TtsRatePref>(() => readTtsRate());
  const [voiceOn, setVoiceOn] = useState(() => readVoiceOnDefault());
  const [displayName, setDisplayName] = useState("");
  const [initials, setInitials] = useState("");
  const [sidePref, setSidePref] = useState<SidePref>("both");
  const [clubTag, setClubTag] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setInitials(profile.initials);
    setSidePref(profile.sidePref);
    setClubTag(profile.clubTag);
  }, [profile]);

  return (
    <div className="dash-shell">
      <header className="dash-head">
        <p className="dash-kicker">Opening Edge</p>
        <h1>Settings</h1>
        <p className="dash-sub">
          {APP_VERSION} · {APP_MILESTONE}
        </p>
      </header>

      <div className="dash-scroll">
        <section className="set-block" id="profile">
          <h2>Profile</h2>
          <div className="profile-row">
            <span className="profile-avatar" aria-hidden>
              {initials || profile?.initials || "OE"}
            </span>
            <p className="set-help">
              Simple personal card. Every signed-in club friend has full access.
            </p>
          </div>
          <label className="auth-label" htmlFor="displayName">
            Display name
          </label>
          <input
            id="displayName"
            className="auth-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={40}
          />
          <label className="auth-label" htmlFor="initials">
            Initials
          </label>
          <input
            id="initials"
            className="auth-input"
            value={initials}
            onChange={(e) => setInitials(e.target.value)}
            maxLength={2}
          />
          <p className="auth-label">Side you train first</p>
          <div className="mode-row" role="tablist" aria-label="Side preference">
            {(["white", "black", "both"] as const).map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={sidePref === id}
                className={sidePref === id ? "filter-chip filter-chip-on" : "filter-chip"}
                onClick={() => setSidePref(id)}
              >
                {id}
              </button>
            ))}
          </div>
          <label className="auth-label" htmlFor="clubTag">
            Club tag
          </label>
          <input
            id="clubTag"
            className="auth-input"
            value={clubTag}
            onChange={(e) => setClubTag(e.target.value)}
            maxLength={24}
            placeholder="optional"
          />
          <button
            type="button"
            className="auth-phone"
            disabled={!user}
            onClick={() => {
              void save({ displayName, initials, sidePref, clubTag }).then(
                () => setSaved("Saved."),
                () => setSaved("Could not save yet — local still works."),
              );
            }}
          >
            Save profile
          </button>
          {saved ? <p className="set-help">{saved}</p> : null}
          {configured && user ? (
            <form action="/auth/sign-out" method="post">
              <button type="submit" className="auth-signout">
                Sign out
              </button>
            </form>
          ) : (
            <p className="set-help">
              Sign in with Google or Phone to keep this profile on your account.
            </p>
          )}
        </section>

        <section className="set-block" id="voices">
          <h2>Voice</h2>
          <p className="set-help">
            One coach. Rate and mute. That’s the whole voice desk.
          </p>
          <div className="mode-row" role="tablist" aria-label="Speech rate">
            {(["slow", "clear", "brisk"] as const).map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={rate === id}
                className={rate === id ? "filter-chip filter-chip-on" : "filter-chip"}
                onClick={() => {
                  setRate(id);
                  writeTtsRate(id);
                }}
              >
                {id}
              </button>
            ))}
          </div>
          <label className="set-toggle">
            <input
              type="checkbox"
              checked={voiceOn}
              onChange={(e) => {
                setVoiceOn(e.target.checked);
                writeVoiceOnDefault(e.target.checked);
              }}
            />
            Start drills with Voice on
          </label>
        </section>

        <section className="set-block" id="about">
          <h2>About</h2>
          <p className="set-help">
            {APP_VERSION} — {APP_MILESTONE}. Weapons, the Map, Memory OS, one coach.
          </p>
        </section>
      </div>

      <TabBar active="settings" />
    </div>
  );
}
