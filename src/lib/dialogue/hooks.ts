import type { LessonFacts } from "./types";

export interface ShortHook {
  ply: number;
  hook: string;
  punch: string;
}

/**
 * Default strip copy — concept + image, never a SAN lead.
 * Align plies with existing pins / story / history so teaching stays sparse.
 *
 * Rubric for a good coach line:
 * 1. Picture first (breathe, house, clamp, outpost, coil, gift, open the center).
 * 2. One job, 6–15 words, Lupin-noir: sharp, few words, premium.
 * 3. No leading SAN (`Bf4`, `…Nbd7`) and no dumped move list.
 * 4. Why/Explain may name the move; the strip must not.
 */
export const SHORT_HOOKS: Record<string, ShortHook[]> = {
  "scotch-gambit": [
    {
      ply: -1,
      hook: "Hang the bishop. Don't recapture yet.",
      punch: "Open the center. Then sit on the wedge.",
    },
    {
      ply: 4,
      hook: "Kick the door. Open the center now.",
      punch: "They take. You develop. That's the gambit.",
    },
    {
      ply: 6,
      hook: "Hang the bishop. The king square is the headline.",
      punch: "Don't grab the pawn. Hunt the king.",
    },
    {
      ply: 8,
      hook: "Plant the wedge. They don't get to rest.",
      punch: "Sit on it. Ruin the knight next.",
    },
    {
      ply: 15,
      hook: "Ruin the house. Then squeeze the wreck.",
      punch: "Doubled pawns. The file is coming.",
    },
    {
      ply: 18,
      hook: "No outpost for them. Kick, then squeeze.",
      punch: "King tucked. Space comes next.",
    },
    {
      ply: 31,
      hook: "The file is yours. Don't give the wedge back.",
      punch: "Convert. Don't donate the extra space.",
    },
  ],
  "evans-gambit": [
    {
      ply: -1,
      hook: "Italian, then the gift. Don't let their bishop breathe.",
      punch: "Kick the bishop. Castle, then take the center.",
    },
    {
      ply: 3,
      hook: "Buy the tempo. That's the Evans.",
      punch: "Don't count pawns. Hunt the king while they grab.",
    },
    {
      ply: 6,
      hook: "This pawn is a ticket, not a donation.",
      punch: "Open the center while they count.",
    },
    {
      ply: 7,
      hook: "Open the center now. Don't let their bishop breathe.",
      punch: "Kick the house. Then castle.",
    },
    {
      ply: 11,
      hook: "Castle, then take the center. Keep it simple.",
      punch: "Recapture and park. Keep going.",
    },
    {
      ply: 13,
      hook: "You asked for the center. Take it clean.",
      punch: "King first. Then the wedge.",
    },
    {
      ply: 20,
      hook: "Cut the king. They don't castle for free.",
      punch: "The diagonal eats the exit.",
    },
    {
      ply: 22,
      hook: "Loot the gift. The diagonal is open.",
      punch: "Check next. Keep the initiative.",
    },
    {
      ply: 31,
      hook: "Open files. Don't take the pawn back.",
      punch: "Book's done. Keep hunting.",
    },
  ],
  "italian-attack": [
    {
      ply: -1,
      hook: "Two Knights. You attack. Not a quiet Italian.",
      punch: "Open the center. The king file is the religion.",
    },
    {
      ply: 6,
      hook: "Open the center. Not a quiet Italian.",
      punch: "No slow bind. Smash now.",
    },
    {
      ply: 7,
      hook: "The door is open. No slow Italian today.",
      punch: "Plant the wedge next.",
    },
    {
      ply: 10,
      hook: "Plant the wedge. That's the Lange.",
      punch: "Their knight has no sofa.",
    },
    {
      ply: 14,
      hook: "The wrecking ball lands. Check on the file.",
      punch: "Their king is still in the shop.",
    },
    {
      ply: 24,
      hook: "They ran long. Hunt that king.",
      punch: "Open the files they asked for.",
    },
    {
      ply: 31,
      hook: "Open the files. Their king picked a side.",
      punch: "Don't count. Convert the wreck.",
    },
  ],
  "vienna-gambit": [
    {
      ply: -1,
      hook: "Knight out first. Then gift the f-pawn.",
      punch: "King's Gambit with a head start.",
    },
    {
      ply: 4,
      hook: "Gambit with a knight already out.",
      punch: "They break. You take. Don't flinch.",
    },
    {
      ply: 7,
      hook: "They broke. You take. Don't chicken out.",
      punch: "Cover the cheap check. Then castle.",
    },
    {
      ply: 16,
      hook: "King tucked. Now own the file.",
      punch: "Trade the jumper on your terms.",
    },
    {
      ply: 22,
      hook: "Trade on your terms. Clean the jumper.",
      punch: "Tension dies when you say so.",
    },
    {
      ply: 31,
      hook: "Extra center, extra file. Squeeze.",
      punch: "Don't give the space back.",
    },
  ],
  "kings-gambit": [
    {
      ply: -1,
      hook: "Gift the f-pawn. Don't play scared.",
      punch: "Hunt the king, not the pawn.",
    },
    {
      ply: 2,
      hook: "Gift the f-pawn. The king file is a weapon.",
      punch: "Stop the cheap queen raid next.",
    },
    {
      ply: 8,
      hook: "Best outpost on the board. Sit.",
      punch: "Their g-pawn is committed. You hunt.",
    },
    {
      ply: 16,
      hook: "Castle through the fire. Don't panic.",
      punch: "Cover, then take the tension.",
    },
    {
      ply: 31,
      hook: "Take the tension on your terms.",
      punch: "Convert the outpost. Use the file.",
    },
  ],
  "grand-prix": [
    {
      ply: -1,
      hook: "Closed Sicilian that learned to punch.",
      punch: "No Open theory. Storm the fianchetto.",
    },
    {
      ply: 4,
      hook: "Punch the Sicilian. No Open theory tonight.",
      punch: "Aim at the king. Then crack the file.",
    },
    {
      ply: 10,
      hook: "Crack the file. They wanted a slow game.",
      punch: "Ruin the center. Then the queen swing.",
    },
    {
      ply: 20,
      hook: "Hop toward the king. Trade into the storm.",
      punch: "The fianchetto is the target.",
    },
    {
      ply: 26,
      hook: "Look at the holes. The fianchetto is the target.",
      punch: "Queen swing. Mate before they expand.",
    },
    {
      ply: 31,
      hook: "Storm the house. Mate before they expand.",
      punch: "Don't get distracted by the queenside.",
    },
  ],
  "smith-morra": [
    {
      ply: -1,
      hook: "Gift the c-pawn. Buy the tempos.",
      punch: "Don't recapture with the queen.",
    },
    {
      ply: 4,
      hook: "Gift the pawn. Buy the tempos.",
      punch: "Open Sicilian without the theory tax.",
    },
    {
      ply: 5,
      hook: "One pawn. Three developing moves bought.",
      punch: "Aim at the king. Pressure the backward pawn.",
    },
    {
      ply: 10,
      hook: "Aim at the king. Tempos on the soft square.",
      punch: "Castle. Then the d-file bind.",
    },
    {
      ply: 22,
      hook: "The d-file is the patient. Sit on the hole.",
      punch: "Outpost. Don't hop off.",
    },
    {
      ply: 24,
      hook: "Outpost. Sit. Don't hop off that hole.",
      punch: "Bishops recapture. Keep the bind.",
    },
    {
      ply: 31,
      hook: "Keep the bind. Don't take the pawn back.",
      punch: "Pressure until the backward pawn cracks.",
    },
  ],
  "french-kia": [
    {
      ply: -1,
      hook: "King's Indian with the white pieces.",
      punch: "Same house. Don't debate French trees.",
    },
    {
      ply: 2,
      hook: "Same house every game. Don't debate French trees.",
      punch: "Fianchetto. Then the storm.",
    },
    {
      ply: 14,
      hook: "They can loot the queenside. You plant the wedge.",
      punch: "Wait. Then the knight coils.",
    },
    {
      ply: 18,
      hook: "The knight coils for the storm.",
      punch: "Ignore their queenside. Hunt the king.",
    },
    {
      ply: 22,
      hook: "Storm the short king. Ignore their queenside.",
      punch: "The h-pawn is already running.",
    },
    {
      ply: 31,
      hook: "Mate is the only target. Don't loot with them.",
      punch: "Book's done. Finish the storm.",
    },
  ],
  "caro-fantasy": [
    {
      ply: -1,
      hook: "Keep the big center. Don't give the pawn away.",
      punch: "Same f-pawn religion as the rest.",
    },
    {
      ply: 1,
      hook: "They built a wall. You keep the big center.",
      punch: "Fantasy, not a long theory tree.",
    },
    {
      ply: 4,
      hook: "Keep the big center. Don't give the pawn away.",
      punch: "Take toward the middle. Then aim at the king.",
    },
    {
      ply: 8,
      hook: "They want the break. You develop around it.",
      punch: "Cover. Don't grab the center pawn yet.",
    },
    {
      ply: 16,
      hook: "King tucked. Queen wants the swing.",
      punch: "The wall has a crack.",
    },
    {
      ply: 18,
      hook: "Swing the queen. The wall has a crack.",
      punch: "Look at the king. Open the leftover file.",
    },
    {
      ply: 27,
      hook: "Open the leftover file. Storm the king.",
      punch: "The Caro wall is not a fortress.",
    },
  ],
  london: [
    {
      ply: -1,
      hook: "Triangle first. Keep the poison bishop.",
      punch: "Same house every game. Don't go Jobava.",
    },
    {
      ply: 0,
      hook: "This pawn is a rock, not a ram.",
      punch: "The bishop next. That's the London soul.",
    },
    {
      ply: 2,
      hook: "London bishop needs room to breathe on that diagonal.",
      punch: "Don't lose this bishop cheap.",
    },
    {
      ply: 8,
      hook: "Same house every game. Don't mix Jobava.",
      punch: "The rock is overprotected. Knights can hop.",
    },
    {
      ply: 12,
      hook: "They wanted the bishop. You said no.",
      punch: "It still bites. Keep it.",
    },
    {
      ply: 16,
      hook: "The knight sits. Clamp behind it.",
      punch: "Don't hop off. Squeeze.",
    },
    {
      ply: 22,
      hook: "King tucked. Now squeeze — don't donate the outpost.",
      punch: "The London wins by suffocation.",
    },
    {
      ply: 31,
      hook: "Keep the squeeze. Play the plan.",
      punch: "Don't look for a one-move mate.",
    },
  ],
  "jobava-london": [
    {
      ply: -1,
      hook: "Wild knight, London bishop. Not the quiet house.",
      punch: "Throw pawns. Storm the bishop, then the king.",
    },
    {
      ply: 4,
      hook: "London bishop, wild knight. Different religion.",
      punch: "Kick their bishop. That's Jobava.",
    },
    {
      ply: 8,
      hook: "Kick the bishop. That's the Jobava.",
      punch: "Space. Then trap it.",
    },
    {
      ply: 12,
      hook: "Trap the bishop. Space first.",
      punch: "Trade it off. You keep the storm.",
    },
    {
      ply: 24,
      hook: "Opposite kings. You storm first tonight.",
      punch: "Don't wait for permission.",
    },
    {
      ply: 29,
      hook: "Race now. Don't wait for permission.",
      punch: "The c-file and the g-pawn. Convert.",
    },
  ],
  "black-lion": [
    {
      ply: -1,
      hook: "You're a lion in a house-cat coat.",
      punch: "Coil the break. Don't rush the fianchetto.",
    },
    {
      ply: 0,
      hook: "They want a cheap Italian. Coil first.",
      punch: "Don't meet it with a fianchetto. Hide, then bite.",
    },
    {
      ply: 1,
      hook: "This is the house. Hold the break.",
      punch: "Knights next. Then the yawn.",
    },
    {
      ply: 5,
      hook: "The knight hides behind the pawn. Keep the c-pawn free.",
      punch: "Not the other hop. The Lion develops in the coil.",
    },
    {
      ply: 7,
      hook: "That's the Lion waking. Own the dark squares.",
      punch: "Yes. The bite later is the wedge.",
    },
    {
      ply: 11,
      hook: "The spine pawn. Blunt the hops.",
      punch: "Queen path next. Then castle.",
    },
    {
      ply: 13,
      hook: "King hidden. They have no cheap mate.",
      punch: "Coil the queen. Then the hop.",
    },
    {
      ply: 15,
      hook: "Coil the queen. Not a raid.",
      punch: "Clear the rook. Watch the break.",
    },
    {
      ply: 21,
      hook: "Ugly hop, right square. The knight wants the attack.",
      punch: "Take their jumper. Then shove the wedge.",
    },
    {
      ply: 25,
      hook: "Shove the wedge. That's the bite.",
      punch: "Cramp their pieces. Own the outpost.",
    },
    {
      ply: 31,
      hook: "Coil complete. Now the yawn.",
      punch: "Rooks, bishop slide, knights back to the hole.",
    },
  ],
  pirc: [
    {
      ply: -1,
      hook: "Let them have the center. You counterpunch.",
      punch: "Small house. Long bishop. Then the strike.",
    },
    {
      ply: 5,
      hook: "Fianchetto. This bishop is the soul.",
      punch: "Small house. Then take the center back.",
    },
    {
      ply: 7,
      hook: "Small house. The long bishop is the soul.",
      punch: "Castle. Then the strike.",
    },
    {
      ply: 9,
      hook: "King in. Then take the center back.",
      punch: "Blunt their hop. Then strike.",
    },
    {
      ply: 15,
      hook: "Strike. You take the center back.",
      punch: "That's the Pirc. Not a forever squeeze.",
    },
    {
      ply: 21,
      hook: "Hop to the outpost. Eye the chain.",
      punch: "Dual holes. Sit. The storm comes later.",
    },
    {
      ply: 31,
      hook: "Sit on the hole. The storm comes later.",
      punch: "Don't rush the f-pawn. Reload the hops.",
    },
  ],
  dragon: [
    {
      ply: -1,
      hook: "Dragon on the long diagonal. Then race.",
      punch: "Fianchetto. Opposite kings. Breath on the c-file.",
    },
    {
      ply: 9,
      hook: "This bishop is the soul. The long diagonal.",
      punch: "You knew they'd castle long.",
    },
    {
      ply: 11,
      hook: "You are a dragon on the long diagonal.",
      punch: "They went long. You asked for this race.",
    },
    {
      ply: 16,
      hook: "Opposite kings. You asked for this race.",
      punch: "The c-file is the Dragon's breath.",
    },
    {
      ply: 22,
      hook: "Hop. The c-file is the breath.",
      punch: "They throw the h-pawn. You freeze it.",
    },
    {
      ply: 23,
      hook: "Freeze their storm. That's how you race.",
      punch: "Hold the pawn. Their shove costs now.",
    },
    {
      ply: 24,
      hook: "Hold the pawn. Their storm is slower now.",
      punch: "Rook lift. Sac or hop. Convert the race.",
    },
    {
      ply: 31,
      hook: "Sac the exchange or hop in. Race.",
      punch: "Don't play pretty. Play first.",
    },
  ],
  scandinavian: [
    {
      ply: -1,
      hook: "Strike the center. Don't flinch now.",
      punch: "Queen out. Then the ugly file.",
    },
    {
      ply: 1,
      hook: "Strike the center. You don't wait.",
      punch: "Queen out. Pin ideas. Don't get trapped.",
    },
    {
      ply: 5,
      hook: "Queen out. Pin ideas. Don't get trapped.",
      punch: "Bishop out before you lock the chain.",
    },
    {
      ply: 14,
      hook: "Ugly pawn. Open file. That's the point.",
      punch: "You asked for a race. Castle long.",
    },
    {
      ply: 18,
      hook: "Long castle. You asked for a race.",
      punch: "Opposite kings. Then the leftover file.",
    },
    {
      ply: 31,
      hook: "Use the open file. Don't count pretty pawns.",
      punch: "Storm. Their king picked a side.",
    },
  ],
  alekhine: [
    {
      ply: -1,
      hook: "Poke the head. Don't play scared.",
      punch: "Make them overextend. Then rip the center.",
    },
    {
      ply: 1,
      hook: "Poke the head. Make them overextend.",
      punch: "They push. You hop. That's the deal.",
    },
    {
      ply: 8,
      hook: "Four pawns. You wanted this fight.",
      punch: "Develop around the wall. Then rip it.",
    },
    {
      ply: 20,
      hook: "King in. Then rip the center.",
      punch: "The wall is a piñata. That's the tax.",
    },
    {
      ply: 22,
      hook: "The center is a piñata. That's the tax.",
      punch: "Take the wreck. Use the files.",
    },
    {
      ply: 29,
      hook: "Take the wreck. Use the files.",
      punch: "Pins and the recoup. Don't get greedy.",
    },
  ],
  "kings-indian": [
    {
      ply: -1,
      hook: "Let them have the center. You want the king.",
      punch: "Close it. Then storm. Ignore their queenside.",
    },
    {
      ply: 3,
      hook: "Small house. Not a Grünfeld grab.",
      punch: "Fianchetto. Then close the center.",
    },
    {
      ply: 11,
      hook: "Close the center. Then storm the king.",
      punch: "Same bishop as the Pirc. Different race.",
    },
    {
      ply: 12,
      hook: "King in. The f-pawn wants to run.",
      punch: "Reroute. Unblock the storm.",
    },
    {
      ply: 15,
      hook: "Unblock the storm pawn. That's the Mar del Plata.",
      punch: "They can loot the queenside. You mate.",
    },
    {
      ply: 20,
      hook: "The storm starts. Ignore their queenside.",
      punch: "Lock next. Then the pawns run.",
    },
    {
      ply: 22,
      hook: "Lock the center. Now the pawns run.",
      punch: "Lift the rook. Mate before their queens land.",
    },
    {
      ply: 39,
      hook: "Shove. Mate before their queenside lands.",
      punch: "Don't look left. The king is the only target.",
    },
  ],
  "modern-benoni": [
    {
      ply: -1,
      hook: "Unbalance now. That's the Benoni gift.",
      punch: "Long bishop. Chip the center. Run the majority.",
    },
    {
      ply: 3,
      hook: "Unbalance now. You wanted this structure.",
      punch: "Take. The queenside majority is the gift.",
    },
    {
      ply: 5,
      hook: "Modern tell. Don't lock a Czech wall.",
      punch: "House next. Then hit the center pawn.",
    },
    {
      ply: 11,
      hook: "The long bishop is the soul.",
      punch: "King in. Then chip their extra pawn.",
    },
    {
      ply: 20,
      hook: "Hit the center pawn. It's hanging in the air.",
      punch: "Rook on the file. Then the hop.",
    },
    {
      ply: 24,
      hook: "Hop. Trade toward the majority.",
      punch: "Run the pawns. Don't fear their wedge.",
    },
    {
      ply: 31,
      hook: "Run the majority. Don't fear their wedge.",
      punch: "Chip. The long bishop breathes.",
    },
  ],
  benko: [
    {
      ply: -1,
      hook: "Buy the files. The pawn is a ticket.",
      punch: "Pressure until they crack. Don't take it back.",
    },
    {
      ply: 5,
      hook: "Buy the files. The pawn is a ticket.",
      punch: "Ask them to open the roads.",
    },
    {
      ply: 7,
      hook: "Ask them to open the roads.",
      punch: "Same bishop. Same files. Even if they decline.",
    },
    {
      ply: 12,
      hook: "Their king walked. You develop for free.",
      punch: "House up. Then sit on the files.",
    },
    {
      ply: 20,
      hook: "House up. Then sit on the files.",
      punch: "Queen out. Pressure the gift squares.",
    },
    {
      ply: 22,
      hook: "Pressure the gift squares. Don't take the pawn back.",
      punch: "Double the file. That's the whole opening.",
    },
    {
      ply: 31,
      hook: "Sit on the files. That's the whole opening.",
      punch: "Don't cash pretty. Squeeze a2 and b2.",
    },
  ],
  "dutch-leningrad": [
    {
      ply: -1,
      hook: "Unbalance on move one. Not a quiet King's Indian.",
      punch: "Fianchetto. Queen swing. Then the Dutch break.",
    },
    {
      ply: 1,
      hook: "Unbalance on move one. The f-pawn is the weapon.",
      punch: "Leningrad house. Not a Stonewall.",
    },
    {
      ply: 5,
      hook: "Leningrad house. Not a Stonewall grind.",
      punch: "This bishop is the soul.",
    },
    {
      ply: 7,
      hook: "Fianchetto. This bishop is the soul.",
      punch: "King in. Then the queen swing.",
    },
    {
      ply: 14,
      hook: "Queen swing. She wants the king.",
      punch: "They closed. You still break.",
    },
    {
      ply: 31,
      hook: "The Dutch break. Then the leftover file.",
      punch: "Don't let their center shove be free.",
    },
  ],
  budapest: [
    {
      ply: -1,
      hook: "Gift the pawn. Three tempos bought.",
      punch: "Check. Recoup. Squeeze the leftover.",
    },
    {
      ply: 3,
      hook: "Gift the pawn. Three tempos, one bite.",
      punch: "Don't play a quiet Nimzo. Bite d4.",
    },
    {
      ply: 6,
      hook: "Don't panic for the pawn. Pin and recoup.",
      punch: "The king file is already a story.",
    },
    {
      ply: 9,
      hook: "Check. The king file is already a story.",
      punch: "Pin the knight. Recoup next.",
    },
    {
      ply: 14,
      hook: "Cash the gambit. You got the pawn back.",
      punch: "King in. Nothing hanging.",
    },
    {
      ply: 18,
      hook: "King tucked. Nothing hanging now.",
      punch: "Hold the recoup. Then squeeze.",
    },
    {
      ply: 29,
      hook: "Squeeze the leftover pawn. Files next.",
      punch: "Development lead. Don't gift it back.",
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
