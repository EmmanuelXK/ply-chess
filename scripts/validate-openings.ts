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
console.log(`\n${openings.length} openings legal from the start position.`);
console.log("✓ Dual-master dialogue for all three duos on Lion + London.");
