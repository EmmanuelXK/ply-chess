import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { fullMoveCount, type Opening } from "@/lib/openings";
import type { LineStatus, MemoryCard } from "@/lib/journal";

const accents: Record<string, string> = {
  london: "from-amber-500/20 to-transparent text-amber-200",
  pirc: "from-emerald-500/20 to-transparent text-emerald-200",
  "black-lion": "from-orange-500/20 to-transparent text-orange-200",
};

export function OpeningCard({
  opening,
  status,
  card,
}: {
  opening: Opening;
  status?: LineStatus;
  card?: MemoryCard;
}) {
  const moves = fullMoveCount(opening);
  const accent = accents[opening.id] ?? "from-zinc-500/20 to-transparent";

  return (
    <Card
      size="sm"
      className={`border-0 bg-linear-to-br ${accent} bg-zinc-900/80 ring-zinc-800`}
    >
      <CardContent className="flex flex-col gap-3 py-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
              {opening.side === "white" ? "You play White" : "You play Black"}
              {opening.versus ? ` · ${opening.versus}` : ""}
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-50">
              {opening.name}
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="rounded-full bg-black/40 px-2 py-1 font-mono text-[11px] text-zinc-300 ring-1 ring-white/10">
              {moves} moves
            </span>
            {status ? <StatusBadge status={status} /> : null}
          </div>
        </div>
        <p className="text-[13px] leading-snug text-zinc-300">
          {opening.blurb}
        </p>
        <p className="text-[12px] text-zinc-500">{opening.story.cast}</p>
        {card?.lastGrade && card.lastCorrect != null && card.lastTotal != null ? (
          <p className="text-[11px] text-zinc-500">
            Last train {card.lastCorrect}/{card.lastTotal}
          </p>
        ) : null}
        <div className="opening-actions">
          <Link href={`/drill/${opening.id}?mode=learn`} className="opening-action">
            Learn
          </Link>
          <Link
            href={`/drill/${opening.id}?mode=train`}
            className={
              status?.kind === "due"
                ? "opening-action opening-action-due"
                : "opening-action"
            }
          >
            Train
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: LineStatus }) {
  if (status.kind === "new") {
    return <span className="line-status">New</span>;
  }
  if (status.kind === "due") {
    return <span className="line-status line-status-due">Due</span>;
  }
  return <span className="line-status">{status.label}</span>;
}
