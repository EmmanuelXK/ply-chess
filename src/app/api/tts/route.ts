import { NextResponse } from "next/server";

import { normalizeTtsText, synthesizeSpeech } from "@/lib/tts/synthesize";

export const runtime = "nodejs";
export const maxDuration = 15;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const text =
    typeof body === "object" && body !== null && "text" in body
      ? (body as { text: unknown }).text
      : undefined;

  if (typeof text !== "string") {
    return NextResponse.json({ error: "text_required" }, { status: 400 });
  }

  const normalized = normalizeTtsText(text);
  if (!normalized) {
    return NextResponse.json({ error: "text_invalid" }, { status: 400 });
  }

  try {
    const clip = await synthesizeSpeech(normalized);
    return new NextResponse(new Uint8Array(clip.audio), {
      status: 200,
      headers: {
        "Content-Type": clip.contentType,
        "Cache-Control": "private, max-age=3600",
        "X-TTS-Provider": clip.provider,
      },
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
