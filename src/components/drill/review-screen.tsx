"use client";

import { DrillScreen } from "@/components/drill/drill-screen";
import { openings } from "@/lib/openings";

export function ReviewScreen() {
  const opening = openings[0];
  if (!opening) return null;
  return <DrillScreen opening={opening} initialReps="review" daily />;
}
