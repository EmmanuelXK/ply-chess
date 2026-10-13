import { Chess } from "chess.js";

export interface CoachShow {
  text: string;
  arrows: string[];
  squares: string[];
}

function asStrings(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").slice(0, max);
}

function extractJson(raw: string): Record<string, unknown> | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function legalArrows(fen: string, arrows: readonly string[]): string[] {
  let root: Chess;
  try {
    root = new Chess(fen);
  } catch {
    return [];
  }
  const kept: string[] = [];
  for (const uci of arrows) {
    if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci)) continue;
    if (kept.includes(uci)) continue;
    try {
      const played = root.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci[4] || undefined,
      });
      if (!played) continue;
      root.undo();
      kept.push(uci);
    } catch {
      /* skip an illegal arrow */
    }
    if (kept.length >= 4) break;
  }
  return kept;
}

function legalSquares(squares: readonly string[]): string[] {
  const kept: string[] = [];
  for (const square of squares) {
    if (!/^[a-h][1-8]$/.test(square) || kept.includes(square)) continue;
    kept.push(square);
    if (kept.length >= 4) break;
  }
  return kept;
}

/** Pull the spoken answer and the board marks out of the model text. */
export function parseCoachShow(raw: string, fen: string): CoachShow | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const json = extractJson(trimmed);
  if (json && typeof json.text === "string" && json.text.trim()) {
    return {
      text: json.text.trim(),
      arrows: legalArrows(fen, asStrings(json.arrows, 6)),
      squares: legalSquares(asStrings(json.squares, 6)),
    };
  }
  const prose = trimmed.replace(/\{[\s\S]*\}\s*$/g, "").trim();
  if (!prose || prose.startsWith("{")) return null;
  return { text: prose, arrows: [], squares: [] };
}
