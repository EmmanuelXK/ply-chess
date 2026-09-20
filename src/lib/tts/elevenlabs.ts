import "server-only";

import { DEFAULT_ELEVENLABS_VOICES } from "./config";
import { speakerProsody } from "./prosody";
import type { SpeakerId } from "./types";

export async function synthesizeElevenLabs(
  text: string,
  apiKey: string,
  voiceId = DEFAULT_ELEVENLABS_VOICES.aldric,
  speaker: SpeakerId = "aldric",
  timeoutMs = 10000,
): Promise<{ audio: Buffer; contentType: string }> {
  const url = new URL(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
  );
  url.searchParams.set("output_format", "mp3_44100_128");
  const prosody = speakerProsody(speaker);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: prosody.elevenStability,
        similarity_boost: 0.75,
        style: prosody.elevenStyle,
        use_speaker_boost: true,
        speed: prosody.elevenSpeed,
      },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs HTTP ${response.status}`);
  }

  const audio = Buffer.from(await response.arrayBuffer());
  if (audio.length === 0) {
    throw new Error("ElevenLabs returned no audio");
  }

  return {
    audio,
    contentType: response.headers.get("content-type") ?? "audio/mpeg",
  };
}
