"use client";

import { useState } from "react";
import { TabBar } from "@/components/app/tab-bar";
import { activeTeachers } from "@/lib/dialogue";
import {
  readTtsRate,
  readVoiceMap,
  readVoiceOnDefault,
  VOICE_PRESETS,
  writeTtsRate,
  writeVoiceOnDefault,
  writeVoicePreset,
} from "@/lib/tts/prefs";
import type { TtsRatePref } from "@/lib/tts/prosody";
import type { SpeakerId } from "@/lib/tts/types";

export function SettingsScreen() {
  const [rate, setRate] = useState<TtsRatePref>(() => readTtsRate());
  const [voiceOn, setVoiceOn] = useState(() => readVoiceOnDefault());
  const [map, setMap] = useState<Partial<Record<SpeakerId, string>>>(() => readVoiceMap());
  const teachers = activeTeachers();

  return (
    <div className="dash-shell">
      <header className="dash-head">
        <p className="dash-kicker">Opening Edge</p>
        <h1>Settings</h1>
        <p className="dash-sub">Voice and rate. One coach. No dual heads.</p>
      </header>

      <div className="dash-scroll">
        <section className="set-block" id="voices">
          <h2>Voice</h2>
          <p className="set-help">
            One coach head. Internally a warm male and a bright female voice
            (Aldric / Kael) take turns by purpose — no picker, no duos.
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
          <div className="voice-remap">
            {[teachers.left, teachers.right].map((teacher) => (
              <div key={teacher.id} className="voice-row">
                <p>
                  <span className={`speaker-dot speaker-${teacher.color}`} />
                  {teacher.gender === "male" ? "Warm male" : "Bright female"}
                </p>
                <div className="mode-row">
                  {VOICE_PRESETS[teacher.id].map((preset) => {
                    const on = (map[teacher.id] ?? "default") === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        className={on ? "filter-chip filter-chip-on" : "filter-chip"}
                        onClick={() => {
                          writeVoicePreset(teacher.id, preset.id);
                          setMap((prev) => ({ ...prev, [teacher.id]: preset.id }));
                        }}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <TabBar active="settings" />
    </div>
  );
}
