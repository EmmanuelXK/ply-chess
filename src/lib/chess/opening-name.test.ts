import assert from "node:assert/strict";
import test from "node:test";
import { START_FEN } from "./tree";
import { openingName } from "./opening-name";

test("the ECO name deepens as the line is played", () => {
  const early = openingName(START_FEN, ["e4"]);
  assert.equal(early?.eco, "B00");
  assert.match(early?.name ?? "", /King's Pawn/);
  const evans = openingName(START_FEN, ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4"]);
  assert.equal(evans?.eco, "C51");
  assert.match(evans?.name ?? "", /Evans Gambit/);
  assert.equal(openingName(START_FEN, []), null);
});
