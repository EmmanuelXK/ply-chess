import { weapons } from "./book";
import { makeOpening } from "./make-opening";
import { openingSpecs } from "./specs";
import { validateAll } from "./validate";
import type { Family, Opening, Side } from "./types";
import { STUDY_MODES, parseStudyMode, drillStudyMode } from "@/lib/reps/schedule";

export type {
  Opening,
  Side,
  PlanVoice,
  Chunk,
  Pin,
  StoryBeat,
  Family,
  RepsMode,
  StudyMode,
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

export {
  chunkAt,
  isUserPly,
  fullMoveCount,
  PILLAR_LABELS,
  looksLikeMoveList,
  openingKind,
  positionalIdea,
} from "./helpers";
export { openingDossier, openingHouses, studyHref } from "./dossier";
export {
  RACK_META,
  RACK_ORDER,
  RESERVED_OPENING_IDS,
  canonicalOpeningId,
  openingsInRack,
  rackForOpening,
  rackForOpeningId,
  weaponRacks,
  type RackId,
  type WeaponRack,
} from "./racks";
export {
  housePicture,
  housePictureAt,
  pinSpeech,
  storyLine,
  chunkIndexAt,
  visualLine,
} from "./memory";
export { openingFromTrap, openingOnLine } from "./make-opening";
export { activeLine, branchChoices, moveChip, sharedPrefixLength, type BranchChoice } from "./book";
export { quizForPly } from "./professor";
export { moveNoteAt, factualComment, type MoveNote } from "./move-note";
export { isKeyPly, keyPlyReasons, type KeyPlyReason } from "./key-ply";
export { repertoireLineTree, type LineBranch, type LineLeaf } from "./line-tree";
export {
  historyAt,
  historyFen,
  HISTORY_OPENER,
  HISTORY_PACK,
} from "./history";

const specById = new Map(openingSpecs.map((spec) => [spec.id, spec]));

export const openings: Opening[] = weapons.map((weapon) => {
  const spec = specById.get(weapon.id);
  if (!spec) throw new Error(`missing spec for ${weapon.id}`);
  return makeOpening(spec);
});

validateAll(openings);

const byId = new Map(openings.map((o) => [o.id, o]));

export function getOpening(id: string): Opening | undefined {
  return byId.get(id);
}

export const FAMILY_META: Record<
  Family,
  { title: string; blurb: string }
> = {
  white: { title: "White opening systems", blurb: "You move first. Pick the system." },
  "black-e4": { title: "Black vs 1.e4", blurb: "They open the king file." },
  "black-d4": { title: "Black vs 1.d4", blurb: "They want the queen file." },
};

export const SIDE_META = {
  white: { title: "White", blurb: "You move first." },
  black: { title: "Black", blurb: "Answer 1.e4 and 1.d4." },
} as const;

export {
  STUDY_MODES,
  parseStudyMode,
  drillStudyMode,
};

export function openingsInFamily(family: Family): Opening[] {
  return openings.filter((o) => o.family === family);
}

export function countBySide(side: Side): number {
  return openings.filter((o) => o.side === side).length;
}

/** @deprecated use STUDY_MODES */
export const REPS_MODES = STUDY_MODES;

export function openingsForSide(side: Side): Opening[] {
  return openings.filter((o) => o.side === side);
}
