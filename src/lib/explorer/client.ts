import type { CrowdMove, CrowdTable } from "@/lib/explorer/crowd";

const memory = new Map<string, CrowdTable | null>();

/** Ask our server route. A miss is cached so Practice does not retry all day. */
export async function fetchCrowd(fen: string): Promise<CrowdTable | null> {
  if (memory.has(fen)) return memory.get(fen) ?? null;
  try {
    const response = await fetch(`/api/explorer?fen=${encodeURIComponent(fen)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3500),
    });
    const body = (await response.json()) as {
      ok?: boolean;
      total?: number;
      moves?: CrowdMove[];
    };
    if (!response.ok || body.ok !== true || !Array.isArray(body.moves) || typeof body.total !== "number") {
      memory.set(fen, null);
      return null;
    }
    const table: CrowdTable = { total: body.total, moves: body.moves };
    memory.set(fen, table);
    return table;
  } catch {
    return null;
  }
}
