import { notFound } from "next/navigation";
import { DrillScreen } from "@/components/drill/drill-screen";
import { getOpening, openings } from "@/lib/openings";

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
    title: opening ? `${opening.name} · Opening Trainer` : "Opening Trainer",
  };
}

export default async function DrillPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string; queue?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const opening = getOpening(id);
  if (!opening) notFound();
  const initialMode =
    query.mode === "learn" || query.mode === "train" ? query.mode : undefined;
  return (
    <DrillScreen
      key={`${id}-${initialMode ?? "auto"}-${query.queue === "due" ? "due" : ""}`}
      opening={opening}
      initialMode={initialMode}
      queueDue={query.queue === "due"}
    />
  );
}
