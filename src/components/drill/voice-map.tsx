"use client";

import { useEffect, useState } from "react";

import { DUOS, type Teacher } from "@/lib/dialogue";
import {
  DEFAULT_EDGE_VOICES,
  SPEAKER_VOICE_BLURB,
  edgeVoiceLabel,
  edgeVoicesForGender,
} from "@/lib/tts/catalog";
import {
  readVoiceRemap,
  remappedEdgeVoice,
  setEdgeVoice,
} from "@/lib/tts/remap";
import type { SpeakerId } from "@/lib/tts/types";

type CloneInfo = { configured: boolean; masked?: string };

export function VoiceMap() {
  const [clones, setClones] = useState<Partial<Record<SpeakerId, CloneInfo>>>(
    {},
  );
  const [hasKey, setHasKey] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/tts/voices")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { elevenLabsKey?: boolean; speakers?: { id: SpeakerId; clone: CloneInfo }[] } | null) => {
        if (cancelled || !data) return;
        setHasKey(Boolean(data.elevenLabsKey));
        const next: Partial<Record<SpeakerId, CloneInfo>> = {};
        for (const row of data.speakers ?? []) {
          next[row.id] = row.clone;
        }
        setClones(next);
      })
      .catch(() => {
        /* Settings still works offline for Edge remap */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    readVoiceRemap();
  }, [tick]);

  return (
    <section className="voice-map" aria-label="Coach voices">
      <p className="duo-home-label">Voices</p>
      <p className="voice-map-note">
        Each duo is one male + one female. Remap the free Edge voice here.
        Instant Voice Clone IDs go in env — not uploaded from the app.
      </p>
      {DUOS.map((duo) => (
        <div key={duo.id} className="voice-duo">
          <p className="voice-duo-title">{duo.title}</p>
          <VoiceRow
            teacher={duo.left}
            clone={clones[duo.left.id]}
            hasKey={hasKey}
            onChange={() => setTick((n) => n + 1)}
          />
          <VoiceRow
            teacher={duo.right}
            clone={clones[duo.right.id]}
            hasKey={hasKey}
            onChange={() => setTick((n) => n + 1)}
          />
        </div>
      ))}
    </section>
  );
}

function VoiceRow({
  teacher,
  clone,
  hasKey,
  onChange,
}: {
  teacher: Teacher;
  clone?: CloneInfo;
  hasKey: boolean;
  onChange: () => void;
}) {
  const current = remappedEdgeVoice(teacher.id);
  const choices = edgeVoicesForGender(teacher.gender);
  const meta = SPEAKER_VOICE_BLURB[teacher.id];
  const envName = `ELEVENLABS_VOICE_${teacher.id.toUpperCase()}`;

  return (
    <div className="voice-row">
      <div className="voice-row-who">
        <span className={`speaker-dot speaker-${teacher.color}`} />
        <span className="voice-row-name">{teacher.name}</span>
        <span className="voice-row-gender">
          {teacher.gender === "male" ? "Male" : "Female"}
        </span>
      </div>
      <label className="voice-row-label">
        Free Edge
        <select
          className="voice-select"
          value={current}
          aria-label={`${teacher.short} Edge voice`}
          onChange={(e) => {
            setEdgeVoice(teacher.id, e.target.value);
            onChange();
          }}
        >
          {choices.map((choice) => (
            <option key={choice.id} value={choice.id}>
              {choice.label}
            </option>
          ))}
          {!choices.some((c) => c.id === current) ? (
            <option value={current}>{edgeVoiceLabel(current)}</option>
          ) : null}
        </select>
      </label>
      <p className="voice-clone">
        {clone?.configured ? (
          <>
            Clone {clone.masked}
            {hasKey ? " · key on" : " · needs API key"}
          </>
        ) : (
          <>
            No clone · paste {envName}
            {current !== DEFAULT_EDGE_VOICES[teacher.id]
              ? ""
              : ` · default ${meta.edge}`}
          </>
        )}
      </p>
    </div>
  );
}
