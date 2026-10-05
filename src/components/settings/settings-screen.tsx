"use client";

import { useState } from "react";
import { TabBar } from "@/components/app/tab-bar";
import { useAuth } from "@/components/auth/auth-provider";
import type { ProfileDraft } from "@/lib/auth/sanitize";
import { profileSeed } from "@/lib/auth/profile";
import { defaultOwner, writeLocalOwner } from "@/lib/owner";
import { useLocalOwner } from "@/lib/use-local-owner";
import { APP_MILESTONE, APP_VERSION } from "@/lib/version";
import { InstallHint } from "@/components/settings/install-hint";

export function SettingsScreen() {
  const { user, profile, save } = useAuth();
  const stored = useLocalOwner();
  const session = profile ?? (user ? profileSeed(user) : null);
  const base = stored ?? session ?? defaultOwner();
  const [edits, setEdits] = useState<ProfileDraft | null>(null);
  const [saved, setSaved] = useState("");
  const draft = edits ?? base;

  const patch = (partial: Partial<ProfileDraft>) => {
    setEdits({ ...draft, ...partial });
    setSaved("");
  };

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
              {draft.initials || "RE"}
            </span>
            <p className="set-help">
              Name on this phone. The board opens without signing in.
            </p>
          </div>
          <label className="auth-label" htmlFor="displayName">
            Display name
          </label>
          <input
            id="displayName"
            className="auth-input"
            value={draft.displayName}
            onChange={(e) => patch({ displayName: e.target.value })}
            maxLength={40}
          />
          <label className="auth-label" htmlFor="initials">
            Initials
          </label>
          <input
            id="initials"
            className="auth-input"
            value={draft.initials}
            onChange={(e) => patch({ initials: e.target.value })}
            maxLength={2}
          />
          <p className="auth-label">Side you train first</p>
          <div className="mode-row" role="tablist" aria-label="Side preference">
            {(["white", "black", "both"] as const).map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={draft.sidePref === id}
                className={draft.sidePref === id ? "filter-chip filter-chip-on" : "filter-chip"}
                onClick={() => patch({ sidePref: id })}
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
            value={draft.clubTag}
            onChange={(e) => patch({ clubTag: e.target.value })}
            maxLength={24}
            placeholder="optional"
          />
          <button
            type="button"
            className="set-save"
            onClick={() => {
              const next = writeLocalOwner(draft);
              setEdits(null);
              setSaved("Saved on this device.");
              if (user) {
                void save(next).catch(() => {
                  /* Local copy already landed. */
                });
              }
            }}
          >
            Save profile
          </button>
          {saved ? <p className="set-help">{saved}</p> : null}
        </section>

        <InstallHint />

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
