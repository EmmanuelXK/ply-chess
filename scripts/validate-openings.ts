import { ATLAS } from "../src/lib/atlas";
import { validateAtlas } from "../src/lib/atlas/validate";
import { validateDialogue } from "../src/lib/dialogue/validate";
import { openings } from "../src/lib/openings";

for (const opening of openings) {
  const moves = Math.ceil(opening.moves.length / 2);
  console.log(
    `✓ ${opening.name} (${opening.side}) — ${opening.moves.length} plies / ${moves} moves — ${opening.chunks.length} chunks`,
  );
  if (opening.depthNote) {
    console.log(`  note: ${opening.depthNote}`);
  }
}

validateDialogue(openings);
validateAtlas();
console.log(`\n${openings.length} openings legal from the start position.`);
console.log(`✓ Theory atlas: ${ATLAS.length} mainstream openings, legal routes.`);
console.log("✓ Single-coach purpose dialogue (≤15 words, no repeats) on Lion, London, Evans.");
