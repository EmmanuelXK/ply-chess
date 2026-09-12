import "server-only";

/**
 * Default Edge TTS voice — British male neural, clear and unhurried.
 * Slowed and slightly lowered in synthesis for a professor cadence.
 * Override with EDGE_TTS_VOICE.
 */
export const DEFAULT_EDGE_VOICE = "en-GB-RyanNeural";

/**
 * ElevenLabs stock voice "George" — warm, mature male narrator.
 * https://elevenlabs.io/app/voice-library?voiceId=JBFqnCBsd6RMkjVDRZzb
 * Override with ELEVENLABS_VOICE_ID.
 */
export const DEFAULT_ELEVENLABS_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";

export const MAX_TTS_CHARS = 800;

export function edgeVoice(): string {
  return process.env.EDGE_TTS_VOICE?.trim() || DEFAULT_EDGE_VOICE;
}

export function elevenLabsKey(): string | undefined {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  return key || undefined;
}

export function elevenLabsVoiceId(): string {
  return (
    process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_ELEVENLABS_VOICE_ID
  );
}
