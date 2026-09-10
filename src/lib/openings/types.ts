export type Side = "white" | "black";
export type PlanVoice = "steady" | "creative" | "aggressive";
export type Family = "white" | "black-e4" | "black-d4";
export type RepsMode = "spine" | "traps" | "quiz" | "think";
export type MoveGlyph = "!!" | "!" | "!?" | "?" | "??" | "?!";
export type ArrowBrush =
  | "last"
  | "hint"
  | "green"
  | "red"
  | "blue"
  | "yellow"
  | "purple";

export interface Story {
  /** Who you are. One short sentence. */
  cast: string;
  /** What the opponent wants. One short sentence. */
  conflict: string;
  /** How the middlegame is supposed to feel. */
  plan: string;
}

export interface Chunk {
  /** Inclusive 0-based ply range. */
  fromPly: number;
  toPly: number;
  /** ≤6 words. Named job, never a raw ply. */
  name: string;
  /** What this chunk is for. Coach uses this on a miss. */
  job: string;
}

export interface Pin {
  afterPly: number;
  label: string;
}

export interface StoryBeat {
  afterPly: number;
  beat: string;
}

export interface CoachLine {
  /** -1 = before any move. */
  afterPly: number;
  text: string;
}

export interface Trap {
  id: string;
  name: string;
  blurb: string;
  shotPly: number;
  coach: string;
  moves: string[];
}

export interface TrapSpec {
  id: string;
  name: string;
  blurb: string;
  san: string;
  shotPly: number;
  coach: string;
}

export interface Pillars {
  pawnStructure: string;
  pieceCoordination: string;
  kingSafety: string;
  breaksAndStorms: string;
  tacticsBank: string;
  attackingPlan: string;
}

export type BookChunk = [plies: number, name: string, job: string];

export interface WhyArrow {
  orig: string;
  dest: string;
  brush: ArrowBrush;
}

export interface WhyPly {
  san: string;
  narrate: string;
  glyph?: MoveGlyph;
  arrows?: WhyArrow[];
  circles?: string[];
}

export interface WhyLesson {
  title: string;
  intro: string;
  /** Play the spine this far, then autoplay `branch`. */
  startPly: number;
  branch: WhyPly[];
}

export interface ProfessorScript {
  afterPly: number;
  /** CONCEPT of the move / square. */
  concept: string;
  /** WHY it matters in this opening. */
  why: string;
  /** NEXT attacking / positional plans. */
  plan: string;
  whyLesson?: WhyLesson;
}

export interface QuizChoice {
  id: string;
  text: string;
  correct: boolean;
  reaction: string;
}

export interface PositionalQuiz {
  id: string;
  /** Quiz is live while the user is inside this chunk. */
  fromPly: number;
  toPly: number;
  prompt: string;
  choices: QuizChoice[];
}

export interface OpeningSpec {
  id: string;
  name: string;
  shortName: string;
  side: Side;
  family: Family;
  versus?: string;
  blurb: string;
  story: Story;
  modelFromPly: number;
  bookChunks: BookChunk[];
  pins: Pin[];
  storyBeats: StoryBeat[];
  coach: CoachLine[];
  traps: TrapSpec[];
  pillars: Pillars;
  plans: Record<PlanVoice, string>;
  depthNote?: string;
}

export interface Opening {
  id: string;
  name: string;
  shortName: string;
  side: Side;
  family: Family;
  versus?: string;
  blurb: string;
  story: Story;
  moves: string[];
  modelFromPly: number;
  chunks: Chunk[];
  pins: Pin[];
  storyBeats: StoryBeat[];
  coach: CoachLine[];
  traps: Trap[];
  pillars: Pillars;
  plans: Record<PlanVoice, string>;
  depthNote?: string;
  professor: ProfessorScript[];
  quizzes: PositionalQuiz[];
}
