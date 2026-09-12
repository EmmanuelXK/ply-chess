import { NextResponse } from "next/server";

import {
  SPEAKER_GENDER,
  SPEAKER_VOICE_BLURB,
  DEFAULT_EDGE_VOICES,
  DEFAULT_GOOGLE_VOICES,
} from "@/lib/tts/catalog";
import {
  elevenLabsKey,
  elevenLabsSpeakerStatus,
} from "@/lib/tts/config";
import { SPEAKER_IDS } from "@/lib/tts/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const clones = elevenLabsSpeakerStatus();
  const speakers = SPEAKER_IDS.map((id) => {
    const meta = SPEAKER_VOICE_BLURB[id];
    return {
      id,
      name: meta.name,
      duo: meta.duo,
      gender: SPEAKER_GENDER[id],
      edge: DEFAULT_EDGE_VOICES[id],
      edgeLabel: meta.edge,
      google: DEFAULT_GOOGLE_VOICES[id],
      clone: clones[id],
    };
  });

  return NextResponse.json({
    elevenLabsKey: Boolean(elevenLabsKey()),
    speakers,
    note: "Paste Instant Voice Clone IDs in env as ELEVENLABS_VOICE_<NAME>.",
  });
}
