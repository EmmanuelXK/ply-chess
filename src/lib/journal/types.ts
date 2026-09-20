import type { Card } from "ts-fsrs";

/** One Memory OS card = one opening variation (London / Pirc / Black Lion). */
export type GradeName = "again" | "hard" | "good" | "easy";

export type StudyMode = "learn" | "train";

export interface StoredFsrsCard {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: string;
}

export interface MemoryCard {
  id: string;
  variationId: string;
  fsrs: StoredFsrsCard;
  learnCompletedAt: string | null;
  lastGrade: GradeName | null;
  lastScore: number | null;
  lastCorrect: number | null;
  lastTotal: number | null;
  lastHintsUsed: number | null;
  lastReviewedAt: string | null;
  updatedAt: string;
}

export interface JournalPin {
  id: string;
  openingId: string;
  afterPly: number;
  label: string;
  collectedAt: string;
}

export interface MemorySession {
  id: string;
  startedAt: string;
  endedAt?: string;
  mode: StudyMode;
  variationId: string;
  firstAttemptCorrect: number;
  totalUserPlies: number;
  grade?: GradeName;
  hintsUsed: number;
}

export interface JournalSnapshot {
  version: 1;
  cards: Record<string, MemoryCard>;
  pins: JournalPin[];
  lastSession: MemorySession | null;
}

export type LineStatus =
  | { kind: "new" }
  | { kind: "due" }
  | { kind: "waiting"; dueAt: string; label: string };

export type FsrsCard = Card;
