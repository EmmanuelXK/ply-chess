import { Chess } from "chess.js";
import { NextResponse, type NextRequest } from "next/server";

import { CoachHttpError, coachFailureMessage, spentCount } from "@/lib/coach/errors";
import { askCoach, coachKeyKind } from "@/lib/coach/model";
import { coachUserPrompt, type CoachPosition } from "@/lib/coach/prompt";
import { parseCoachShow } from "@/lib/coach/show";
import {
  COACH_COOKIE,
  COACH_DAILY_LIMIT,
  allowance,
  openQuota,
  parisDay,
  quotaBucket,
  rememberCount,
  sealQuota,
} from "@/lib/coach/quota";

export const dynamic = "force-dynamic";

interface CoachBody {
  question?: unknown;
  fen?: unknown;
  line?: unknown;
  matchup?: unknown;
  moves?: unknown;
  side?: unknown;
  evalCp?: unknown;
  evalMate?: unknown;
  evalDepth?: unknown;
  best?: unknown;
  note?: unknown;
  deviceId?: unknown;
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function deviceOf(request: NextRequest, bodyDevice?: unknown): string {
  const header = request.headers.get("x-edges-device")?.trim();
  const raw = header || (typeof bodyDevice === "string" ? bodyDevice.trim() : "");
  if (/^[a-zA-Z0-9-]{8,80}$/.test(raw)) return raw;
  return "anon";
}

function text(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function nullableNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function cookieHeader(device: string, count: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const token = sealQuota({ day: parisDay(), count, device });
  return `${COACH_COOKIE}=${token}; Path=/; Max-Age=172800; HttpOnly; SameSite=Lax${secure}`;
}

function statusPayload(connected: boolean, remaining: number, extra?: Record<string, unknown>) {
  return {
    connected,
    remaining,
    limit: COACH_DAILY_LIMIT,
    ...extra,
  };
}

export async function GET(request: NextRequest) {
  const device = deviceOf(request);
  const cookie = openQuota(request.cookies.get(COACH_COOKIE)?.value);
  const remaining = Math.max(
    0,
    COACH_DAILY_LIMIT - allowance(quotaBucket(clientIp(request), device), cookie, device),
  );
  return NextResponse.json(statusPayload(coachKeyKind() != null, remaining), {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(request: NextRequest) {
  let body: CoachBody;
  try {
    body = (await request.json()) as CoachBody;
  } catch {
    return NextResponse.json({ error: "Missing question." }, { status: 400 });
  }

  const question = text(body.question, 500);
  if (!question) {
    return NextResponse.json({ error: "Ask a short question." }, { status: 400 });
  }

  const fen = text(body.fen, 120);
  try {
    new Chess(fen);
  } catch {
    return NextResponse.json({ error: "That position could not be read." }, { status: 400 });
  }

  const device = deviceOf(request, body.deviceId);
  const bucket = quotaBucket(clientIp(request), device);
  const cookie = openQuota(request.cookies.get(COACH_COOKIE)?.value);
  const used = allowance(bucket, cookie, device);
  const connected = coachKeyKind() != null;

  if (!connected) {
    return NextResponse.json(
      statusPayload(false, Math.max(0, COACH_DAILY_LIMIT - used), {
        reply: "Coach not connected yet",
      }),
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  if (used >= COACH_DAILY_LIMIT) {
    return NextResponse.json(
      statusPayload(true, 0, { resting: true, reply: "Coach is resting, back tomorrow" }),
      {
        status: 429,
        headers: {
          "Cache-Control": "private, no-store",
          "Set-Cookie": cookieHeader(device, used),
        },
      },
    );
  }

  const reserved = used + 1;
  rememberCount(bucket, parisDay(), reserved);
  const moves = Array.isArray(body.moves)
    ? body.moves.filter((move): move is string => typeof move === "string").slice(0, 80)
    : [];
  const side = body.side === "white" || body.side === "black" ? body.side : null;
  const position: CoachPosition = {
    fen,
    line: text(body.line, 80),
    matchup: text(body.matchup, 120),
    moves,
    side,
    evalCp: nullableNumber(body.evalCp),
    evalMate: nullableNumber(body.evalMate),
    evalDepth: nullableNumber(body.evalDepth),
    best: text(body.best, 16) || null,
    note: text(body.note, 400) || null,
  };

  const release = (error: unknown) => {
    const count = spentCount(reserved, true);
    rememberCount(bucket, parisDay(), count);
    const message =
      error instanceof CoachHttpError
        ? coachFailureMessage(error.status, error.message)
        : "Coach could not answer. Try again.";
    const connectedNow = message !== "Coach not connected yet";
    return NextResponse.json(statusPayload(connectedNow, COACH_DAILY_LIMIT - count, { error: message }), {
      status: message === "Coach not connected yet" ? 200 : 502,
      headers: {
        "Cache-Control": "private, no-store",
        "Set-Cookie": cookieHeader(device, count),
      },
    });
  };

  try {
    const raw = await askCoach(coachUserPrompt(position, question), AbortSignal.timeout(20_000));
    const show = parseCoachShow(raw, fen);
    if (!show) return release(new CoachHttpError(502, "empty reply"));
    const count = spentCount(reserved, false);
    return NextResponse.json(
      statusPayload(true, COACH_DAILY_LIMIT - count, {
        reply: show.text,
        arrows: show.arrows,
        squares: show.squares,
      }),
      {
        headers: {
          "Cache-Control": "private, no-store",
          "Set-Cookie": cookieHeader(device, count),
        },
      },
    );
  } catch (error) {
    return release(error);
  }
}
