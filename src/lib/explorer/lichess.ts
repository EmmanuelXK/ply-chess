import { parseExplorer, type CrowdTable } from "@/lib/explorer/crowd";

const EXPLORER = "https://explorer.lichess.ovh/lichess";
const TTL_MS = 6 * 60 * 60 * 1000;
const CACHE_CAP = 200;

const cache = new Map<string, { at: number; table: CrowdTable }>();

export function explorerUrl(fen: string): string {
  const url = new URL(EXPLORER);
  url.searchParams.set("variant", "standard");
  url.searchParams.set("speeds", "blitz,rapid");
  url.searchParams.set("ratings", "1200,1400,1600,1800,2000");
  url.searchParams.set("moves", "12");
  url.searchParams.set("topGames", "0");
  url.searchParams.set("recentGames", "0");
  url.searchParams.set("fen", fen);
  return url.toString();
}

export function cachedCrowd(fen: string, now = Date.now()): CrowdTable | null {
  const hit = cache.get(fen);
  if (!hit || now - hit.at > TTL_MS) return null;
  return hit.table;
}

export function rememberCrowd(fen: string, table: CrowdTable, now = Date.now()): void {
  cache.delete(fen);
  cache.set(fen, { at: now, table });
  while (cache.size > CACHE_CAP) {
    const oldest = cache.keys().next().value;
    if (!oldest) break;
    cache.delete(oldest);
  }
}

export function resetExplorerCache(): void {
  cache.clear();
}

/** Lichess database, club ratings, blitz and rapid. Null means fall back quietly. */
export async function exploreFen(fen: string, signal?: AbortSignal): Promise<CrowdTable | null> {
  const cached = cachedCrowd(fen);
  if (cached) return cached;
  const token = process.env.LICHESS_TOKEN?.trim();
  if (!token) return null;
  try {
    const response = await fetch(explorerUrl(fen), {
      signal,
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return null;
    const table = parseExplorer(await response.json());
    if (!table) return null;
    rememberCrowd(fen, table);
    return table;
  } catch {
    return null;
  }
}
