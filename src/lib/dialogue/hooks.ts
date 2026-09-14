import { twoBeatLine } from "./short";
import type { LessonFacts } from "./types";

export interface ShortHook {
  ply: number;
  /** Why the opponent replied like that — their idea, threat, or plan. */
  they: string;
  /** How we concern / treat that idea — our conceptual answer. */
  we: string;
}

/**
 * Default strip copy — two pictures on key plies, never a SAN lead.
 * Align plies with existing pins / story / history so teaching stays sparse.
 *
 * Rubric for a good coach line:
 * 1. On a highlight, plant TWO concepts: why they moved, then how we treat it.
 * 2. Picture language (breathe, house, clamp, outpost, coil, gift, open the center).
 * 3. Two short sentences, 6–15 words total. Lupin-noir: sharp, male, premium.
 * 4. No leading SAN (`Bf4`, `…Nbd7`) and no dumped move list.
 * 5. Why/Explain may name the move; the strip must not.
 */
export function spokenHook(row: ShortHook): string {
  return twoBeatLine(row.they, row.we);
}

export const SHORT_HOOKS: Record<string, ShortHook[]> = {
  "scotch-gambit": [
    {
      ply: -1,
      they: "They want to pocket the pawn.",
      we: "Hang the bishop. Hunt the king.",
    },
    {
      ply: 3,
      they: "They develop the knight.",
      we: "Kick the door. Open the center.",
    },
    {
      ply: 4,
      they: "They held the point.",
      we: "Kick the door. Open the center.",
    },
    {
      ply: 6,
      they: "They grabbed the pawn.",
      we: "Hang the bishop. Hunt the king.",
    },
    {
      ply: 8,
      they: "They poke the head.",
      we: "Plant the wedge. No rest.",
    },
    {
      ply: 15,
      they: "They recapture ugly.",
      we: "Ruin the house. Then squeeze.",
    },
    {
      ply: 18,
      they: "They want a piece out.",
      we: "No outpost. Kick, then squeeze.",
    },
    {
      ply: 31,
      they: "They chip the wreck.",
      we: "Keep the file. Don't give the wedge back.",
    },
  ],
  "evans-gambit": [
    {
      ply: -1,
      they: "They want a quiet Italian.",
      we: "Gift a pawn. Don't let their bishop breathe.",
    },
    {
      ply: 3,
      they: "They copy the Italian.",
      we: "Buy the tempo. That's the Evans.",
    },
    {
      ply: 6,
      they: "Their bishop sits pretty.",
      we: "This pawn is a ticket, not a donation.",
    },
    {
      ply: 7,
      they: "They count the pawn.",
      we: "Open the center. Don't let their bishop breathe.",
    },
    {
      ply: 11,
      they: "They take the center pawn.",
      we: "Castle, then recapture clean.",
    },
    {
      ply: 13,
      they: "They slam the door.",
      we: "You already asked for the center.",
    },
    {
      ply: 20,
      they: "They grab in the middle.",
      we: "Cut the king. No free castle.",
    },
    {
      ply: 22,
      they: "They hunt the bishop.",
      we: "Loot the gift. The diagonal is open.",
    },
    {
      ply: 31,
      they: "They recapture the smash.",
      we: "Open files. Don't take the pawn back.",
    },
  ],
  "italian-attack": [
    {
      ply: -1,
      they: "They want Two Knights peace.",
      we: "You attack. Open the center.",
    },
    {
      ply: 6,
      they: "They poke instead of a quiet Italian.",
      we: "Open the center now.",
    },
    {
      ply: 7,
      they: "They take the gift.",
      we: "No slow bind. Smash continues.",
    },
    {
      ply: 10,
      they: "They develop the Italian bishop.",
      we: "Plant the wedge. That's the Lange.",
    },
    {
      ply: 14,
      they: "They grab the bishop.",
      we: "Wrecking ball. Check on the file.",
    },
    {
      ply: 24,
      they: "They ran the king long.",
      we: "Hunt that king. Open the files.",
    },
    {
      ply: 31,
      they: "They hide the king.",
      we: "Open the files they asked for.",
    },
  ],
  "vienna-gambit": [
    {
      ply: -1,
      they: "They expect a quiet Vienna.",
      we: "Gift the f-pawn with a knight out.",
    },
    {
      ply: 4,
      they: "They poke the head.",
      we: "Gambit anyway. Knight already out.",
    },
    {
      ply: 7,
      they: "They broke to kill the gambit.",
      we: "You take. Don't chicken out.",
    },
    {
      ply: 16,
      they: "They trade to dull it.",
      we: "King tucked. Now own the file.",
    },
    {
      ply: 22,
      they: "They loot a pawn.",
      we: "Trade the jumper on your terms.",
    },
    {
      ply: 31,
      they: "They contest the file.",
      we: "Extra center. Squeeze. Don't give it back.",
    },
  ],
  "kings-gambit": [
    {
      ply: -1,
      they: "They want a safe king file.",
      we: "Gift the f-pawn. Hunt the king.",
    },
    {
      ply: 2,
      they: "They took the center.",
      we: "Gift the f-pawn. The file is a weapon.",
    },
    {
      ply: 8,
      they: "They kick with the g-pawn.",
      we: "Best outpost. Sit and hunt.",
    },
    {
      ply: 16,
      they: "Their knight is offside.",
      we: "Castle through the fire. Don't panic.",
    },
    {
      ply: 31,
      they: "They develop a bishop.",
      we: "Take the tension on your terms.",
    },
  ],
  "grand-prix": [
    {
      ply: -1,
      they: "They wanted a Sicilian tree.",
      we: "Punch it. Storm the fianchetto.",
    },
    {
      ply: 4,
      they: "They develop Sicilian-style.",
      we: "Punch. No Open theory tonight.",
    },
    {
      ply: 10,
      they: "They wanted a slow game.",
      we: "Crack the file. Ruin the center.",
    },
    {
      ply: 20,
      they: "They expand on the king.",
      we: "Hop toward the king. Trade into the storm.",
    },
    {
      ply: 26,
      they: "They sit in the hole.",
      we: "The fianchetto is the target.",
    },
    {
      ply: 31,
      they: "They develop quiet.",
      we: "Storm the house. Mate before they expand.",
    },
  ],
  "smith-morra": [
    {
      ply: -1,
      they: "They grabbed the Sicilian pawn.",
      we: "Gift another. Buy the tempos.",
    },
    {
      ply: 4,
      they: "They took on d4.",
      we: "Gift the pawn. Buy the tempos.",
    },
    {
      ply: 5,
      they: "They cash the pawn.",
      we: "One pawn. Three developing moves.",
    },
    {
      ply: 10,
      they: "They hide the backward pawn.",
      we: "Aim at the king. Sit on the patient.",
    },
    {
      ply: 22,
      they: "They tucked the king.",
      we: "The d-file is the patient. Sit.",
    },
    {
      ply: 24,
      they: "They take the outpost.",
      we: "Recapture. Don't hop off the hole.",
    },
    {
      ply: 31,
      they: "They hide in the corner.",
      we: "Keep the bind. Don't take the pawn back.",
    },
  ],
  "french-kia": [
    {
      ply: -1,
      they: "They want a French tree.",
      we: "Same house. Storm the short king.",
    },
    {
      ply: 2,
      they: "They lock a French wall.",
      we: "Same house. Don't debate trees.",
    },
    {
      ply: 14,
      they: "They castle short.",
      we: "Let them loot. You plant the wedge.",
    },
    {
      ply: 18,
      they: "They shuffle to expand.",
      we: "The knight coils. Ignore their queenside.",
    },
    {
      ply: 22,
      they: "They loot the queenside.",
      we: "Storm the short king. Don't loot with them.",
    },
    {
      ply: 31,
      they: "They still loot the file.",
      we: "Mate is the only target.",
    },
  ],
  "caro-fantasy": [
    {
      ply: -1,
      they: "They built a Caro wall.",
      we: "Keep the big center.",
    },
    {
      ply: 1,
      they: "They built a wall.",
      we: "You keep the big center.",
    },
    {
      ply: 4,
      they: "They strike the head.",
      we: "Keep the big center. Don't give it away.",
    },
    {
      ply: 8,
      they: "They want the break.",
      we: "Develop around it. Don't grab yet.",
    },
    {
      ply: 16,
      they: "They aim at the king.",
      we: "King tucked. Queen wants the swing.",
    },
    {
      ply: 18,
      they: "They tucked the king.",
      we: "Swing the queen. The wall has a crack.",
    },
    {
      ply: 27,
      they: "They contest the file.",
      we: "Open the leftover file. Storm the king.",
    },
  ],
  london: [
    {
      ply: -1,
      they: "They'll hunt the poison bishop.",
      we: "Triangle first. Keep its air.",
    },
    {
      ply: 0,
      they: "They want a queen's pawn fight.",
      we: "This pawn is a rock, not a ram.",
    },
    {
      ply: 2,
      they: "They stake a wall.",
      we: "London bishop needs to breathe.",
    },
    {
      ply: 8,
      they: "They chip the house.",
      we: "Fix the chain. Don't mix Jobava.",
    },
    {
      ply: 12,
      they: "They want the bishop dead.",
      we: "Keep its air. You said no.",
    },
    {
      ply: 16,
      they: "They hide behind a fianchetto.",
      we: "Knight sits. Clamp behind it.",
    },
    {
      ply: 22,
      they: "They shuffle to challenge the hole.",
      we: "King tucked. Don't donate the outpost.",
    },
    {
      ply: 31,
      they: "They hop into the hole.",
      we: "Keep the squeeze. Don't look for a mate.",
    },
  ],
  "jobava-london": [
    {
      ply: -1,
      they: "They expect a quiet London.",
      we: "Wild knight. Storm their bishop.",
    },
    {
      ply: 4,
      they: "They stake a wall.",
      we: "London bishop, wild knight. Different religion.",
    },
    {
      ply: 8,
      they: "They blunt the diagonal.",
      we: "Kick the bishop. That's Jobava.",
    },
    {
      ply: 12,
      they: "They make air for the bishop.",
      we: "Trap it. Space first.",
    },
    {
      ply: 24,
      they: "They take the London bishop.",
      we: "Opposite kings. You storm first.",
    },
    {
      ply: 29,
      they: "They tucked the king.",
      we: "Race. Don't wait for permission.",
    },
  ],
  "black-lion": [
    {
      ply: -1,
      they: "They want a cheap Italian.",
      we: "Coil. House-cat coat, lion teeth.",
    },
    {
      ply: 0,
      they: "They open the king file.",
      we: "Coil first. Don't fianchetto.",
    },
    {
      ply: 1,
      they: "They took the center.",
      we: "This is the house. Hold the break.",
    },
    {
      ply: 5,
      they: "They develop the Italian knight.",
      we: "Hide yours behind the pawn.",
    },
    {
      ply: 7,
      they: "They develop quiet.",
      we: "That's the Lion waking. Own the dark squares.",
    },
    {
      ply: 11,
      they: "They tucked the king.",
      we: "Spine pawn. Blunt the hops.",
    },
    {
      ply: 13,
      they: "They want a cheap mate raid.",
      we: "King hidden. Coil the queen.",
    },
    {
      ply: 15,
      they: "They stare at the file.",
      we: "Coil the queen. Not a raid.",
    },
    {
      ply: 21,
      they: "They plant a jumper.",
      we: "Ugly hop. Then take it and shove.",
    },
    {
      ply: 25,
      they: "They recapture the trade.",
      we: "Shove the wedge. That's the bite.",
    },
    {
      ply: 31,
      they: "They wait.",
      we: "Coil complete. Now the yawn.",
    },
  ],
  pirc: [
    {
      ply: -1,
      they: "They take the whole center.",
      we: "Small house. Then you counterpunch.",
    },
    {
      ply: 5,
      they: "They occupy the middle.",
      we: "Fianchetto. This bishop is the soul.",
    },
    {
      ply: 7,
      they: "They develop quiet.",
      we: "Small house. Long bishop is the soul.",
    },
    {
      ply: 9,
      they: "They castle, keeping the space.",
      we: "King in. Then take the center back.",
    },
    {
      ply: 15,
      they: "They stare at the file.",
      we: "Strike. You take the center back.",
    },
    {
      ply: 21,
      they: "They take in the middle.",
      we: "Hop to the outpost. Eye the chain.",
    },
    {
      ply: 31,
      they: "They blunt the storm pawn.",
      we: "Sit on the hole. Storm comes later.",
    },
  ],
  dragon: [
    {
      ply: -1,
      they: "They'll castle long and race.",
      we: "Dragon on the long diagonal.",
    },
    {
      ply: 9,
      they: "They build the Yugoslav.",
      we: "This bishop is the soul.",
    },
    {
      ply: 11,
      they: "They aim at the long king.",
      we: "Dragon on the long diagonal. Race.",
    },
    {
      ply: 16,
      they: "They castle long and hunt.",
      we: "The c-file is the Dragon's breath.",
    },
    {
      ply: 22,
      they: "They throw the storm pawn.",
      we: "Hop. Freeze it. The c-file breathes.",
    },
    {
      ply: 23,
      they: "They throw the h-pawn.",
      we: "Freeze their storm. That's how you race.",
    },
    {
      ply: 24,
      they: "They pin to speed the storm.",
      we: "Hold the pawn. Their storm is slower.",
    },
    {
      ply: 31,
      they: "They shove the f-pawn.",
      we: "Sac the exchange or hop in. Race.",
    },
  ],
  scandinavian: [
    {
      ply: -1,
      they: "They open the king file.",
      we: "Strike the center. Don't wait.",
    },
    {
      ply: 1,
      they: "They took the king file.",
      we: "Strike the center. You don't wait.",
    },
    {
      ply: 5,
      they: "They develop with tempo.",
      we: "Queen out. Pin. Don't get trapped.",
    },
    {
      ply: 14,
      they: "They hop to wreck the queen.",
      we: "Ugly pawn. Open file. That's the point.",
    },
    {
      ply: 18,
      they: "They aim at the king.",
      we: "Long castle. You asked for a race.",
    },
    {
      ply: 31,
      they: "They tucked a bishop.",
      we: "Use the open file. Don't count pretty pawns.",
    },
  ],
  alekhine: [
    {
      ply: -1,
      they: "They want a big center.",
      we: "Poke the head. Make them overextend.",
    },
    {
      ply: 1,
      they: "They took the king file.",
      we: "Poke. Make them overextend.",
    },
    {
      ply: 8,
      they: "They grab four pawns.",
      we: "You wanted this fight. Then rip it.",
    },
    {
      ply: 20,
      they: "They tucked the king.",
      we: "Rip the center. The wall is a piñata.",
    },
    {
      ply: 22,
      they: "They take your rip.",
      we: "The center is a piñata. That's the tax.",
    },
    {
      ply: 29,
      they: "They hide the queen.",
      we: "Take the wreck. Use the files.",
    },
  ],
  "kings-indian": [
    {
      ply: -1,
      they: "They want the whole center.",
      we: "Let them. You want the king.",
    },
    {
      ply: 3,
      they: "They grab space with the c-pawn.",
      we: "Small house. Not a Grünfeld grab.",
    },
    {
      ply: 11,
      they: "They develop quiet, keeping space.",
      we: "Close the center. Then storm the king.",
    },
    {
      ply: 12,
      they: "They tucked the king.",
      we: "The f-pawn wants to run.",
    },
    {
      ply: 15,
      they: "They close and loot queenside.",
      we: "Unblock the storm. That's Mar del Plata.",
    },
    {
      ply: 20,
      they: "They prep the queenside loot.",
      we: "The storm starts. Ignore their queenside.",
    },
    {
      ply: 22,
      they: "They blunt the storm.",
      we: "Lock the center. Now the pawns run.",
    },
    {
      ply: 39,
      they: "They still loot the queenside.",
      we: "Shove. Mate before their queens land.",
    },
  ],
  "modern-benoni": [
    {
      ply: -1,
      they: "They want a quiet queen's pawn.",
      we: "Unbalance now. Run the majority.",
    },
    {
      ply: 3,
      they: "They grab the c-space.",
      we: "Unbalance. You wanted this structure.",
    },
    {
      ply: 5,
      they: "They close a wedge.",
      we: "Modern tell. Don't lock a Czech wall.",
    },
    {
      ply: 11,
      they: "They take more center.",
      we: "The long bishop is the soul.",
    },
    {
      ply: 20,
      they: "They tucked the king.",
      we: "Hit the center pawn. It's hanging.",
    },
    {
      ply: 24,
      they: "They develop the London bishop.",
      we: "Hop. Trade toward the majority.",
    },
    {
      ply: 31,
      they: "They tuck the bishop.",
      we: "Run the majority. Don't fear their wedge.",
    },
  ],
  benko: [
    {
      ply: -1,
      they: "They close a wedge.",
      we: "Buy the files. The pawn is a ticket.",
    },
    {
      ply: 5,
      they: "They jammed the center shut.",
      we: "Buy the files. The pawn is a ticket.",
    },
    {
      ply: 7,
      they: "They took the gift.",
      we: "Ask them to open the roads.",
    },
    {
      ply: 12,
      they: "Their king walked for the bishop.",
      we: "You develop for free. Sit on the files.",
    },
    {
      ply: 20,
      they: "They tucked the walked king.",
      we: "House up. Then sit on the files.",
    },
    {
      ply: 22,
      they: "They contest the middle.",
      we: "Pressure the gift squares. Don't take it back.",
    },
    {
      ply: 31,
      they: "They develop quiet.",
      we: "Sit on the files. That's the whole opening.",
    },
  ],
  "dutch-leningrad": [
    {
      ply: -1,
      they: "They want a quiet queen's pawn.",
      we: "Unbalance. The f-pawn is the weapon.",
    },
    {
      ply: 1,
      they: "They took the queen's pawn.",
      we: "Unbalance. The f-pawn is the weapon.",
    },
    {
      ply: 5,
      they: "They fianchetto first.",
      we: "Leningrad house. Not a Stonewall.",
    },
    {
      ply: 7,
      they: "They develop quiet.",
      we: "Fianchetto. This bishop is the soul.",
    },
    {
      ply: 14,
      they: "They close the center on you.",
      we: "Queen swing. She still wants the king.",
    },
    {
      ply: 31,
      they: "They stare at the file.",
      we: "The Dutch break. Then the leftover file.",
    },
  ],
  budapest: [
    {
      ply: -1,
      they: "They grab c-space vs a Nimzo.",
      we: "Gift the pawn. Three tempos.",
    },
    {
      ply: 3,
      they: "They grabbed the c-pawn space.",
      we: "Gift the pawn. Three tempos, one bite.",
    },
    {
      ply: 6,
      they: "They cover the extra pawn.",
      we: "Don't panic. Pin and recoup.",
    },
    {
      ply: 9,
      they: "They develop the knight.",
      we: "Check. The king file is already a story.",
    },
    {
      ply: 14,
      they: "They take the recoup knight.",
      we: "You cashed the gambit. Nothing hanging.",
    },
    {
      ply: 18,
      they: "They tucked the king.",
      we: "King in. Hold the recoup. Then squeeze.",
    },
    {
      ply: 29,
      they: "They hide the queen.",
      we: "Squeeze the leftover pawn. Files next.",
    },
  ],
  alapin: [
    {
      ply: 2,
      they: "They want an Open Sicilian.",
      we: "Build a pawn center instead.",
    },
    {
      ply: 6,
      they: "They opened the c-file.",
      we: "Recapture with a pawn.",
    },
    {
      ply: 18,
      they: "Their queen sits in the draft.",
      we: "Hunt her. Then park the knight.",
    },
    {
      ply: 30,
      they: "They want the c-file quiet.",
      we: "Sit the knight. Squeeze.",
    },
    {
      ply: 40,
      they: "They hope the isolani dies.",
      we: "Keep it. Activity beats the pawn.",
    },
  ],
  english: [
    {
      ply: 0,
      they: "They expect a king's pawn fight.",
      we: "Own the hole from the flank.",
    },
    {
      ply: 8,
      they: "They want the center back.",
      we: "Clamp it. Don't give the hole.",
    },
    {
      ply: 10,
      they: "They eye a kingside storm.",
      we: "Hide the knight so the f-pawn breathes.",
    },
    {
      ply: 16,
      they: "They have to live with the hole.",
      we: "Sit there. Hold the clamp.",
    },
    {
      ply: 32,
      they: "They chip the f-pawn.",
      we: "Take it. That's why the knight hid.",
    },
  ],
  "caro-kann": [
    {
      ply: 1,
      they: "They open the king file.",
      we: "Wall first. Bishop stays free.",
    },
    {
      ply: 5,
      they: "They want that bishop jailed.",
      we: "Get it out. Then the chain.",
    },
    {
      ply: 9,
      they: "Their spearhead wants to sit.",
      we: "Chip the head. Don't let it live.",
    },
    {
      ply: 19,
      they: "They left a hole.",
      we: "Hop in. Then park on the file.",
    },
    {
      ply: 35,
      they: "They hold the queenside quiet.",
      we: "Outpost on the file. Yawn.",
    },
  ],
  "queens-gambit": [
    {
      ply: 2,
      they: "They grab a stake in the center.",
      we: "Offer the wing. You want the middle.",
    },
    {
      ply: 6,
      they: "They recapture toward the wall.",
      we: "Take it. Now the minority is legal.",
    },
    {
      ply: 20,
      they: "They feel the b-pawn coming.",
      we: "Rook behind it. That's the tell.",
    },
    {
      ply: 24,
      they: "They chip the expand.",
      we: "Push anyway. Their wall is the target.",
    },
    {
      ply: 32,
      they: "They cling to the backward pawn.",
      we: "Wreck it. Then sit the outpost.",
    },
  ],
  slav: [
    {
      ply: 3,
      they: "They want a Semi mix.",
      we: "Wall first. Don't jail the bishop.",
    },
    {
      ply: 7,
      they: "They hang the wing pawn.",
      we: "Take it. Bishop out before the chain.",
    },
    {
      ply: 9,
      they: "They hope the bishop stays in.",
      we: "Get it outside. That's the Slav.",
    },
    {
      ply: 13,
      they: "They want a free e-push.",
      we: "Pin first. That shove costs a story.",
    },
    {
      ply: 23,
      they: "They shove the wedge.",
      we: "Hop the hole they left.",
    },
  ],
};

export function hookAt(facts: LessonFacts): ShortHook | undefined {
  const rows = SHORT_HOOKS[facts.openingId];
  if (!rows?.length) return undefined;
  const exact = rows.find((r) => r.ply === facts.ply);
  if (exact) return exact;
  return [...rows]
    .filter((r) => r.ply <= facts.ply)
    .sort((a, b) => b.ply - a.ply)[0];
}
