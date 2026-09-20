"use client";

import { useSyncExternalStore } from "react";

import {
  collectPin,
  dueCards,
  dueCount,
  EMPTY_JOURNAL,
  enrollLearn,
  lineStatus,
  loadJournal,
  reviewTrain,
  subscribeJournal,
} from "@/lib/journal";

export function useJournal() {
  const snap = useSyncExternalStore(
    subscribeJournal,
    loadJournal,
    () => EMPTY_JOURNAL,
  );
  const now = new Date();
  const due = dueCards(snap, now);

  return {
    snap,
    dueCount: dueCount(snap, now),
    due,
    card: (id: string) => snap.cards[id],
    status: (id: string) => lineStatus(snap.cards[id], now),
    enrollLearn,
    reviewTrain,
    collectPin,
  };
}
