import { Chess } from "chess.js";
import { NextResponse, type NextRequest } from "next/server";

import { exploreFen } from "@/lib/explorer/lichess";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const fen = request.nextUrl.searchParams.get("fen")?.trim() ?? "";
  try {
    new Chess(fen);
  } catch {
    return NextResponse.json({ ok: false }, { headers: { "Cache-Control": "private, no-store" } });
  }
  const table = await exploreFen(fen, AbortSignal.timeout(4000));
  if (!table) {
    return NextResponse.json({ ok: false }, { headers: { "Cache-Control": "private, no-store" } });
  }
  return NextResponse.json(
    { ok: true, total: table.total, moves: table.moves },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
