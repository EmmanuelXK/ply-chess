"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TabBar } from "@/components/app/tab-bar";
import { DuoPicker } from "@/components/home/duo-picker";
import {
  DEFAULT_DUO,
  DUOS,
  getDuo,
  readStoredDuo,
  readStoredLesson,
  readStoredMode,
  writeStoredDuo,
  writeStoredLesson,
  writeStoredMode,
  type DialogueMode,
  type DuoId,
  type LessonStyle,
} from "@/lib/dialogue";
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
  const params = useSearchParams();
  const [duo, setDuo] = useState<DuoId>(DEFAULT_DUO);
  const [mode, setMode] = useState<DialogueMode>("dual");
  const [lesson, setLesson] = useState<LessonStyle>("teach");
  const [rate, setRate] = useState<TtsRatePref>("clear");
  const [voiceOn, setVoiceOn] = useState(false);
  const [map, setMap] = useState<Partial<Record<SpeakerId, string>>>({});

  useEffect(() => {
    setDuo(readStoredDuo());
    setMode(readStoredMode());
    setLesson(readStoredLesson());
    setRate(readTtsRate());
    setVoiceOn(readVoiceOnDefault());
    setMap(readVoiceMap());
  }, []);

  const pack = getDuo(duo);
  const focus = params.get("focus");

  return (
    <div className="dash-shell">
      <header className="dash-head">
        <p className="dash-kicker">Opening Edge</p>
        <h1>Settings</h1>
        <p className="dash-sub">
          Coaches, lesson style, and voices live here — not on the board.
        </p>
      </header>

      <div className="dash-scroll">
        <section className="set-block" id="lesson">
          <h2>Lesson</h2>
          <div className="mode-row" role="tablist" aria-label="Lesson style">
            <button
              type="button"
              role="tab"
              aria-selected={lesson === "teach"}
              className={lesson === "teach" ? "filter-chip filter-chip-on" : "filter-chip"}
              onClick={() => {
                setLesson("teach");
                writeStoredLesson("teach");
              }}
            >
              Teach
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={lesson === "podcast"}
              className={lesson === "podcast" ? "filter-chip filter-chip-on" : "filter-chip"}
              onClick={() => {
                setLesson("podcast");
                writeStoredLesson("podcast");
              }}
            >
              Podcast
            </button>
          </div>
          <p className="set-help">
            Teach: you move; they talk on the move, a miss, Why, or a quiz.
            Podcast: the line autoplays with a short dual talk-show.
          </p>
        </section>

        <section className="set-block" id="cast">
          <h2>Cast</h2>
          <div className="mode-row" role="tablist" aria-label="Dialogue mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "dual"}
              className={mode === "dual" ? "filter-chip filter-chip-on" : "filter-chip"}
              onClick={() => {
                setMode("dual");
                writeStoredMode("dual");
              }}
            >
              Dual
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "solo"}
              className={mode === "solo" ? "filter-chip filter-chip-on" : "filter-chip"}
              onClick={() => {
                setMode("solo");
                writeStoredMode("solo");
              }}
            >
              Solo
            </button>
          </div>
        </section>

        <section
          className={focus === "duo" ? "set-block set-block-focus" : "set-block"}
          id="duo"
        >
          <h2>Headphone duo</h2>
          <p className="set-help">Each pair is male + female. Two different vibes.</p>
          <DuoPicker
            value={duo}
            onChange={(id) => {
              setDuo(id);
              writeStoredDuo(id);
            }}
          />
        </section>

        <section className="set-block" id="voices">
          <h2>Voices</h2>
          <p className="set-help">
            Warm neural defaults. Slower and clearer. ElevenLabs Instant Voice
            Clone only via <code>ELEVENLABS_VOICE_&lt;SPEAKER&gt;</code> — no
            celebrity clones. Works with zero keys.
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
            {[pack.left, pack.right].map((teacher) => (
              <div key={teacher.id} className="voice-row">
                <p>
                  <span className={`speaker-dot speaker-${teacher.color}`} />
                  {teacher.short}{" "}
                  <span className="voice-gender">
                    {teacher.gender === "male" ? "♂" : "♀"}
                  </span>
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
          <p className="set-help">
            Other duos:{" "}
            {DUOS.filter((d) => d.id !== duo)
              .map((d) => d.title)
              .join(" · ")}
            . Pick the duo above to remap those voices.
          </p>
        </section>
      </div>

      <TabBar active="settings" />
    </div>
  );
}
