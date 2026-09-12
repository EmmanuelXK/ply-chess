import "server-only";

import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

import {
  googleApiKey,
  googleCredentialsPath,
  googleServiceAccountJson,
  googleVoice,
} from "./config";
import { speakerProsody } from "./prosody";
import type { SpeakerId } from "./types";

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

function parseServiceAccount(raw: string): ServiceAccount {
  const parsed = JSON.parse(raw) as Partial<ServiceAccount>;
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("GOOGLE_CLOUD_TTS service account is missing fields");
  }
  return { client_email: parsed.client_email, private_key: parsed.private_key };
}

function loadServiceAccount(): ServiceAccount | undefined {
  const inline = googleServiceAccountJson();
  if (inline) return parseServiceAccount(inline);
  const path = googleCredentialsPath();
  if (!path) return undefined;
  return parseServiceAccount(readFileSync(path, "utf8"));
}

function b64url(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64url");
}

async function accessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const jwt = `${header}.${claim}.${b64url(signer.sign(sa.private_key))}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`Google OAuth HTTP ${response.status}`);
  }
  const body = (await response.json()) as { access_token?: string };
  if (!body.access_token) throw new Error("Google OAuth missing access_token");
  return body.access_token;
}

function languageFromVoice(voice: string): string {
  const parts = voice.split("-");
  if (parts.length >= 2) return `${parts[0]}-${parts[1]}`;
  return "en-US";
}

export async function synthesizeGoogleTts(
  text: string,
  speaker: SpeakerId,
  timeoutMs = 10000,
): Promise<{ audio: Buffer; contentType: string }> {
  const voice = googleVoice(speaker);
  const prosody = speakerProsody(speaker);
  const url = new URL("https://texttospeech.googleapis.com/v1/text:synthesize");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const key = googleApiKey();
  if (key) {
    url.searchParams.set("key", key);
  } else {
    const sa = loadServiceAccount();
    if (!sa) throw new Error("Google Cloud TTS is not configured");
    headers.Authorization = `Bearer ${await accessToken(sa)}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: languageFromVoice(voice),
        name: voice,
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: prosody.googleRate,
        pitch: prosody.googlePitch,
      },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Google TTS HTTP ${response.status}`);
  }

  const body = (await response.json()) as { audioContent?: string };
  if (!body.audioContent) {
    throw new Error("Google TTS returned no audio");
  }
  return {
    audio: Buffer.from(body.audioContent, "base64"),
    contentType: "audio/mpeg",
  };
}
