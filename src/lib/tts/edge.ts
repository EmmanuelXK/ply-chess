import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import WebSocket from "ws";

import { DEFAULT_EDGE_VOICE } from "./config";

/**
 * Handshake aligned with node-edge-tts 1.2.10 / Chromium 143.
 * Outbound WebSocket only — works on Vercel Node.js functions for short clips.
 * No native binaries; audio is buffered in memory.
 */
const CHROMIUM_FULL_VERSION = "143.0.3650.75";
const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const WINDOWS_FILE_TIME_EPOCH = BigInt("11644473600");
const AUDIO_SEPARATOR = "Path:audio\r\n";
const OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";

function generateSecMsGecToken(): string {
  const ticks =
    BigInt(Math.floor(Date.now() / 1000 + Number(WINDOWS_FILE_TIME_EPOCH))) *
    BigInt(10000000);
  const roundedTicks = ticks - (ticks % BigInt(3000000000));
  return createHash("sha256")
    .update(`${roundedTicks}${TRUSTED_CLIENT_TOKEN}`, "ascii")
    .digest("hex")
    .toUpperCase();
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      case "'":
        return "&apos;";
      default:
        return c;
    }
  });
}

function localeFromVoice(voice: string): string {
  const parts = voice.split("-");
  if (parts.length >= 2) return `${parts[0]}-${parts[1]}`;
  return "en-GB";
}

export async function synthesizeEdgeTts(
  text: string,
  voice = DEFAULT_EDGE_VOICE,
  timeoutMs = 8000,
): Promise<{ audio: Buffer; contentType: string }> {
  const chromiumMajor = CHROMIUM_FULL_VERSION.split(".")[0];
  const connectionId = randomUUID().replace(/-/g, "");
  const url =
    `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` +
    `?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}` +
    `&Sec-MS-GEC=${generateSecMsGecToken()}` +
    `&Sec-MS-GEC-Version=1-${CHROMIUM_FULL_VERSION}` +
    `&ConnectionId=${connectionId}`;

  const ws = new WebSocket(url, {
    host: "speech.platform.bing.com",
    origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
    headers: {
      Pragma: "no-cache",
      "Cache-Control": "no-cache",
      Cookie: `MUID=${randomBytes(16).toString("hex").toUpperCase()}`,
      "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromiumMajor}.0.0.0 Safari/537.36 Edg/${chromiumMajor}.0.0.0`,
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        ws.close();
      } catch {
        /* ignore */
      }
      if (error) {
        reject(error);
        return;
      }
      const audio = Buffer.concat(chunks);
      if (audio.length === 0) {
        reject(new Error("Edge TTS returned no audio"));
        return;
      }
      resolve({ audio, contentType: "audio/mpeg" });
    };

    const timer = setTimeout(() => {
      finish(new Error("Edge TTS timed out"));
    }, timeoutMs);

    ws.once("error", (err) => {
      finish(err instanceof Error ? err : new Error(String(err)));
    });

    ws.once("open", () => {
      ws.send(
        `Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
          JSON.stringify({
            context: {
              synthesis: {
                audio: {
                  metadataoptions: {
                    sentenceBoundaryEnabled: "false",
                    wordBoundaryEnabled: "false",
                  },
                  outputFormat: OUTPUT_FORMAT,
                },
              },
            },
          }),
      );

      const requestId = randomBytes(16).toString("hex");
      const lang = localeFromVoice(voice);
      // Slightly slow and low — professor, not a rush-hour announcer.
      const ssml =
        `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" ` +
        `xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${lang}">` +
        `<voice name="${escapeXml(voice)}">` +
        `<prosody rate="-12%" pitch="-6%" volume="+0%">` +
        `${escapeXml(text)}` +
        `</prosody></voice></speak>`;

      ws.send(
        `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`,
      );
    });

    ws.on("message", (data, isBinary) => {
      if (isBinary) {
        const buf = Buffer.isBuffer(data)
          ? data
          : Buffer.from(data as ArrayBuffer);
        const index = buf.indexOf(AUDIO_SEPARATOR);
        if (index === -1) return;
        const audio = buf.subarray(index + AUDIO_SEPARATOR.length);
        if (audio.length > 0) chunks.push(audio);
        return;
      }

      const message = data.toString();
      if (message.includes("Path:turn.end")) {
        finish();
      }
    });
  });
}
