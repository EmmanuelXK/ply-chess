import type { Metadata } from "next";

import { AnalyzeScreen } from "@/components/analyze/analyze-screen";
import { getOpening, openingOnLine } from "@/lib/openings";

export const metadata: Metadata = {
  title: "Analyze · EDGES",
};

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const openingId = first(query.opening);
  const lineId = first(query.line);
  const opening = openingId ? getOpening(openingId) : undefined;
  const line = opening ? openingOnLine(opening, lineId) : null;
  const moves = line?.moves ?? [];
  const plyText = first(query.ply);
  const plyRaw = plyText == null ? 0 : Number(plyText);
  const startPly = Number.isFinite(plyRaw)
    ? Math.max(0, Math.min(moves.length, Math.floor(plyRaw)))
    : 0;
  const mainId = opening?.lines[0]?.id ?? null;
  const branchId = lineId && lineId !== mainId ? lineId : null;

  return (
    <AnalyzeScreen
      openingId={opening?.id ?? null}
      lineId={branchId}
      kicker={line?.shortName ?? "Analyze"}
      side={line?.side ?? "white"}
      moves={moves}
      startPly={startPly}
      scores={(line?.evals ?? []).map((row) => ({ cp: row.cp, mate: row.mate, best: row.best }))}
    />
  );
}
