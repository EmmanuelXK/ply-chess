import "server-only";

import { DEFAULT_ELEVENLABS_VOICE_ID } from "./config";

export async function synthesizeElevenLabs(
  text: string,
  apiKey: string,
  voiceId = DEFAULT_ELEVENLABS_VOICE_ID,
  timeoutMs = 10000,
): Promise<{ audio: Buffer; contentType: string }> {
  const url = new URL(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
  );
  url.searchParams.set("output_format", "mp3_44100_128");

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
        stability: 0.52,
        similarity_boost: 0.78,
        style: 0.18,
        use_speaker_boost: true,
        speed: 0.9,
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
