"use client";

import { useSyncExternalStore } from "react";
import { readProgressSnapshot, subscribeProgress } from "@/lib/reps/schedule";

const emptySnapshot = () => "";

/** Empty on the server. After hydration, the saved reps and streak. */
export function useProgressStore(): string {
  return useSyncExternalStore(subscribeProgress, readProgressSnapshot, emptySnapshot);
}
