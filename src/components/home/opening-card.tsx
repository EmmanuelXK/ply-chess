import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fullMoveCount, type Opening, type RepsMode } from "@/lib/openings";

const accents: Record<string, string> = {
  white: "from-amber-500/20 to-transparent",
  "black-e4": "from-emerald-500/20 to-transparent",
  "black-d4": "from-sky-500/20 to-transparent",
};

export function OpeningCard({
  opening,
  reps = "spine",
}: {
  opening: Opening;
  reps?: RepsMode;
}) {
  const moves = fullMoveCount(opening);
  const accent = accents[opening.family] ?? "from-zinc-500/20 to-transparent";
  const href =
    reps === "spine"
      ? `/drill/${opening.id}`
      : `/drill/${opening.id}?reps=${reps}`;

  return (
    <Link
      href={href}
      className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 active:scale-[0.99]"
      aria-label={`${opening.name}. You play ${opening.side === "white" ? "White" : "Black"}${opening.versus ? ` vs ${opening.versus}` : ""}. ${moves} moves, ${opening.traps.length} traps.`}
    >
      <Card
        size="sm"
        className={`border-0 bg-linear-to-br ${accent} bg-zinc-900/80 ring-zinc-800`}
      >
        <CardContent className="flex flex-col gap-3 py-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
                You play {opening.side === "white" ? "White" : "Black"}
                {opening.versus ? ` · ${opening.versus}` : ""}
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-50">
                {opening.name}
              </h2>
            </div>
            <div className="flex shrink-0 items-start gap-2">
              <div className="flex flex-col items-end gap-1">
                <span className="rounded-full bg-black/40 px-2 py-1 font-mono text-[11px] text-zinc-300 ring-1 ring-white/10">
                  {moves} moves
                </span>
                <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] text-zinc-400 ring-1 ring-white/8">
                  {opening.traps.length} traps
                </span>
              </div>
              <ChevronRight className="mt-1 size-4 text-zinc-500" aria-hidden />
            </div>
          </div>
          <p className="text-[13px] leading-snug text-zinc-300">{opening.blurb}</p>
          <p className="chunk-tag">{opening.chunks[0]?.name}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
