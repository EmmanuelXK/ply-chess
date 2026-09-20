import { notFound } from "next/navigation";
import { DrillScreen } from "@/components/drill/drill-screen";
import { getOpening, openings, parseStudyMode, type StudyMode } from "@/lib/openings";

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

function parseReps(value: string | string[] | undefined): StudyMode {
  const v = Array.isArray(value) ? value[0] : value;
  return parseStudyMode(v);
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
