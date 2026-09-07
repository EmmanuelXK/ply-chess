export type Side = "white" | "black";
export type PlanVoice = "steady" | "creative" | "aggressive";

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
  /** Fires after this 0-based ply is on the board. */
  afterPly: number;
  /** Recall anchor, e.g. "at the e5 pin…" */
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

export interface Opening {
  id: string;
  name: string;
  shortName: string;
  side: Side;
  versus?: string;
  blurb: string;
  story: Story;
  /** SAN from the start position. */
  moves: string[];
  chunks: Chunk[];
  pins: Pin[];
  storyBeats: StoryBeat[];
  coach: CoachLine[];
  plans: Record<PlanVoice, string>;
  /** If a model line is shorter than ~30, say why. */
  depthNote?: string;
}
