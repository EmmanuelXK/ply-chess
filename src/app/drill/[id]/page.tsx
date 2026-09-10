import { notFound } from "next/navigation";
import { DrillScreen } from "@/components/drill/drill-screen";
import { getOpening, openings, type RepsMode } from "@/lib/openings";

export function generateStaticParams() {
  return openings.map((opening) => ({ id: opening.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const opening = getOpening(id);
  return {
    title: opening ? `${opening.name} · Opening Edge` : "Opening Edge",
  };
}

function parseReps(value: string | string[] | undefined): RepsMode {
  const v = Array.isArray(value) ? value[0] : value;
  if (v === "traps" || v === "quiz" || v === "think" || v === "spine") return v;
  return "spine";
}

export default async function DrillPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const opening = getOpening(id);
  if (!opening) notFound();
  const trapRaw = query.trap;
  const trap = Array.isArray(trapRaw) ? trapRaw[0] : trapRaw;
  return (
    <DrillScreen
      opening={opening}
      initialReps={parseReps(query.reps)}
      initialTrap={trap ?? null}
    />
  );
}
