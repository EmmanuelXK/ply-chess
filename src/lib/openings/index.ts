import { makeOpening } from "./make-opening";
import { openingSpecs } from "./specs";
import { validateAll } from "./validate";
import type { Family, Opening, RepsMode, Side } from "./types";

export type {
  Opening,
  Side,
  PlanVoice,
  Chunk,
  Pin,
  StoryBeat,
  Family,
  RepsMode,
  Pillars,
  Trap,
  WhyLesson,
  WhyPly,
  MoveGlyph,
  ProfessorScript,
  PositionalQuiz,
  HistoryMilestone,
  HistoryEra,
  HistoryGlyph,
} from "./types";

export { chunkAt, isUserPly, fullMoveCount, PILLAR_LABELS } from "./helpers";
export { openingFromTrap } from "./make-opening";
export { quizForPly, whyLessonAt, professorAt } from "./professor";
export {
  historyAt,
  historyFen,
  HISTORY_OPENER,
  HISTORY_PACK,
} from "./history";

export const openings: Opening[] = openingSpecs.map(makeOpening);

validateAll(openings);

const byId = new Map(openings.map((o) => [o.id, o]));

export function getOpening(id: string): Opening | undefined {
  return byId.get(id);
}

export const FAMILY_META: Record<
  Family,
  { title: string; blurb: string }
> = {
  white: { title: "White", blurb: "You move first. Pick the system." },
  "black-e4": { title: "Black vs 1.e4", blurb: "They open the king file." },
  "black-d4": { title: "Black vs 1.d4", blurb: "They want the queen file." },
};

export function openingsInFamily(family: Family): Opening[] {
  return openings.filter((o) => o.family === family);
}

export function countBySide(side: Side): number {
  return openings.filter((o) => o.side === side).length;
}

export const REPS_MODES: { id: RepsMode; label: string; blurb: string }[] = [
  { id: "spine", label: "Spine", blurb: "Main line to move 21" },
  { id: "traps", label: "Traps", blurb: "Pack shots off the spine" },
  { id: "quiz", label: "Quiz", blurb: "Positional questions from here" },
  { id: "think", label: "Think", blurb: "Hybrid engines — human plans" },
];
