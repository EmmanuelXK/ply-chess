"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TabBar } from "@/components/app/tab-bar";
import { useAuth } from "@/components/auth/auth-provider";
import {
  readCoachBrainV2Stored,
  writeCoachBrainV2Stored,
} from "@/lib/coach-brain/flag";
import {
  readTtsRate,
  readVoiceOnDefault,
  writeTtsRate,
  writeVoiceOnDefault,
} from "@/lib/tts/prefs";
import {
  readFocusMusicOn,
  writeFocusMusicOn,
} from "@/lib/audio/prefs";
import type { TtsRatePref } from "@/lib/tts/prosody";
import type { SidePref } from "@/lib/auth/sanitize";
import { profileSeed } from "@/lib/auth/profile";
import { APP_MILESTONE, APP_VERSION } from "@/lib/version";

export function SettingsScreen() {
  const { configured, ready, user, profile, save } = useAuth();
  const [rate, setRate] = useState<TtsRatePref>(() => readTtsRate());
  const [voiceOn, setVoiceOn] = useState(() => readVoiceOnDefault());
  const [musicOn, setMusicOn] = useState(() => readFocusMusicOn());
  const [coachBrain, setCoachBrain] = useState(() => readCoachBrainV2Stored());
  const [displayName, setDisplayName] = useState("");
  const [initials, setInitials] = useState("");
  const [sidePref, setSidePref] = useState<SidePref>("both");
  const [clubTag, setClubTag] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setInitials(profile.initials);
      setSidePref(profile.sidePref);
      setClubTag(profile.clubTag);
      return;
    }
    if (user) {
      const seed = profileSeed(user);
      setDisplayName(seed.displayName);
      setInitials(seed.initials);
      setSidePref(seed.sidePref);
      setClubTag(seed.clubTag);
    }
  }, [profile, user]);

  return (
    <div className="dash-shell">
      <header className="dash-head">
        <p className="dash-kicker">Opening Edge</p>
        <h1>Settings</h1>
        <p className="dash-sub">{APP_VERSION}</p>
        <p className="dash-mode-blurb">{APP_MILESTONE}</p>
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
            className="set-save"
            disabled={!user || !ready}
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
              Sign in with Google to keep this profile on your account.
            </p>
          )}
        </section>

        <section className="set-block" id="voices">
          <h2>Voice</h2>
          <p className="set-help">
            One man. Voice starts on for new players, but the board stays quiet
            until you tap <strong>Ask Coach</strong>. Mute still silences him.
            Why is the move board with SAN allowed.
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
            Start drills with Voice on (Ask Coach still required)
          </label>
        </section>

        <section className="set-block" id="journal">
          <h2>Journal</h2>
          <p className="set-help">
            Pin a finished spar with the coach — the game plus a short note —
            and it comes back as a memory on that line. Saved on this device,
            and on your profile when signed in.
          </p>
          <Link href="/journal" className="journal-home-link">
            Open journal
          </Link>
        </section>

        <section className="set-block" id="focus-music">
          <h2>Focus music</h2>
          <p className="set-help">
            Each of the 26 systems has its own quiet instrumental bed — a memory
            palace room. No lyrics. It ducks when Aldric speaks. Mute music
            separately from Voice on the drill dock.
          </p>
          <label className="set-toggle">
            <input
              type="checkbox"
              checked={musicOn}
              onChange={(e) => {
                setMusicOn(e.target.checked);
                writeFocusMusicOn(e.target.checked);
              }}
            />
            Start drills with focus music
          </label>
        </section>

        <section className="set-block" id="coach-brain">
          <h2>Experimental</h2>
          <p className="set-help">
            Coach Brain v2 decides when to introduce, reinforce, correct, or
            stay silent — still from authored hooks, never invented book moves.
            Off by default. The current coach stays until you turn this on.
          </p>
          <label className="set-toggle">
            <input
              type="checkbox"
              checked={coachBrain}
              onChange={(e) => {
                setCoachBrain(e.target.checked);
                writeCoachBrainV2Stored(e.target.checked);
              }}
            />
            Use Coach Brain v2
          </label>
        </section>

        <section className="set-block" id="about">
          <h2>About</h2>
          <p className="set-version">{APP_VERSION}</p>
          <p className="set-help">{APP_MILESTONE}</p>
        </section>
      </div>

      <TabBar active="settings" />
    </div>
  );
}
