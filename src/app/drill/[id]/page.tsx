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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const opening = getOpening(id);
  if (!opening) notFound();
  return <DrillScreen opening={opening} />;
}
