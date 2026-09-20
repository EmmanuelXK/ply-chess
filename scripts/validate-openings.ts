import { ATLAS } from "../src/lib/atlas";
import { validateAtlas } from "../src/lib/atlas/validate";
import { validateDialogue } from "../src/lib/dialogue/validate";
import { housePicture, looksLikeMoveList, openings } from "../src/lib/openings";

for (const opening of openings) {
  const moves = Math.ceil(opening.moves.length / 2);
  console.log(
    `✓ ${opening.name} (${opening.side}) — ${opening.moves.length} plies / ${moves} moves — ${opening.chunks.length} chunks`,
  );
  if (opening.depthNote) {
    console.log(`  note: ${opening.depthNote}`);
  }
  for (const chunk of opening.chunks) {
    const picture = housePicture(chunk);
    if (looksLikeMoveList(picture)) {
      throw new Error(`${opening.id} house "${chunk.name}" picture dumps moves: ${picture}`);
    }
  }
}

validateDialogue(openings);
validateAtlas();
console.log(`\n${openings.length} openings legal from the start position.`);
console.log(`✓ Theory atlas: ${ATLAS.length} mainstream openings, legal routes.`);
console.log("✓ Single male coach; key-point lines only (≤15 words) on Lion, London, Evans.");
