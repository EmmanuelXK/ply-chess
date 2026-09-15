import type { CoachKind } from "@/lib/openings/coach";
import type { Opening } from "@/lib/openings/types";
import type { DialogueAsk, LessonFacts } from "@/lib/dialogue/types";

/** What the coach is trying to do this beat — presentation stays Aldric/TTS. */
export type TeachingIntent =
  | "INTRODUCE"
  | "REINFORCE"
  | "CORRECT"
  | "CONNECT"
  | "PREDICT"
  | "RECALL"
  | "CONTRAST"
  | "TRANSFER"
  | "EXPLAIN"
  | "CELEBRATE"
  | "SILENCE";

export type TeachMethod = "explain" | "question" | "contrast";

export type MoveClass =
  | "Critical"
  | "Strong"
  | "Practical"
  | "Interesting"
  | "Inferior";

export type ContentSource =
  | "hook"
  | "pin"
  | "professor"
  | "story"
  | "why"
  | "history"
  | "quiz"
  | "silence";

export interface PositionUnderstanding {
  materialCp: number;
  kingSafety: { us: number; them: number };
  structure: string[];
  activity: number;
  space: number;
  weakSquares: string[];
  files: string[];
  diags: string[];
  threats: string[];
  plans: string[];
  opponentIntent: string;
  volatile: boolean;
  forcing: boolean;
  sacrifice: boolean;
}

export interface CandidateMove {
  san: string;
  uci?: string;
  classification: MoveClass;
  /** Authored or geometric reason — never "engine says this is best". */
  reason: string;
  book?: boolean;
  changesPlan: boolean;
}

export interface TeachingPly {
  ply: number;
  san: string;
  idea: string;
}

export interface HumanLayer {
  what: string;
  why: string;
  criticalCandidates: CandidateMove[];
  whatChanges: string;
  ideaToRemember: string;
}

export interface EngineAnalysis {
  engineId: string;
  ready: boolean;
  candidates: CandidateMove[];
  evalCp?: number;
  mate?: number;
  /** Truncated to teaching lookahead — never a 30-ply dump. */
  pv?: string[];
  note: string;
}

export type ConsensusVerdict = "investigate" | "stable" | "tactical";

export interface EngineConsensus {
  analyses: EngineAnalysis[];
  agree: boolean;
  disagreement: string | null;
  /** On disagreement: investigate. Never crown max eval. */
  verdict: ConsensusVerdict;
}

export interface AnalyzeRequest {
  fen?: string;
  candidates: CandidateMove[];
  depth: number;
  lookaheadSans: string[];
}

export interface PositionAnalyzer {
  engineId: string;
  analyze(request: AnalyzeRequest): EngineAnalysis;
}

export interface CompressDecision {
  understanding: PositionUnderstanding;
  candidates: CandidateMove[];
  compressed: CandidateMove[];
  depth: number;
  escalate: boolean;
  lookahead: TeachingPly[];
  human: HumanLayer;
  consensus: EngineConsensus;
}

export interface SelectedContent {
  intent: TeachingIntent;
  text: string;
  detail?: string;
  ask?: DialogueAsk;
  /** Training mode: after "what's the problem?", ask for two candidates. */
  nextAsk?: DialogueAsk;
  source: ContentSource;
  method: TeachMethod;
}

export interface CoachBrainInput {
  opening: Opening;
  afterPly: number;
  kind: CoachKind;
  facts: LessonFacts;
  fen?: string;
  soloText?: string;
  player: PlayerModel;
  budget: SpeechBudget;
}

export interface CoachBrainDecision {
  intent: TeachingIntent;
  content: SelectedContent;
  compress: CompressDecision | null;
  speak: boolean;
  method: TeachMethod;
}

export interface PlayerModel {
  recordFail(conceptId: string): TeachMethod;
  recordSuccess(conceptId: string): void;
  methodFor(conceptId: string): TeachMethod;
  failCount(conceptId: string): number;
  lastConcept(): string | undefined;
  noteConcept(conceptId: string): void;
}

export interface SpeechBudget {
  canSpeak(kind: CoachKind, ply: number): boolean;
  noteSpoken(kind: CoachKind, ply: number): void;
  spokenCount(): number;
}
