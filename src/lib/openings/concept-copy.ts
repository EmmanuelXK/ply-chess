import { SHORT_HOOKS, spokenHook } from "@/lib/dialogue/hooks";
import type { Chunk, CoachLine, Opening, StoryBeat } from "./types";

/** Chunk jobs and names — house pictures, never a dumped move list. */
const CHUNK_JOBS: Record<string, Record<string, { name?: string; job: string }>> = {
  "scotch-gambit": {
    "Open the center": { job: "Kick the door. Open the middle before they castle." },
    "Gambit bishop": { job: "Hang the bishop. Don't recapture yet." },
    "e5 wedge": { job: "Plant the wedge. They don't get to rest." },
    "Ruin the pawns": { job: "Ruin the house. Doubled pawns, then squeeze." },
    "Castle then kick": { job: "King tucked. No outpost for their knight." },
    "f4 squeeze": { job: "Space. Drive the jumper. That's the squeeze." },
    "Trade the jumper": { job: "Trade on your terms. Clean the center." },
    "c3 and the file": { job: "Rooks belong on the open file. Sit." },
  },
  "evans-gambit": {
    "Italian then b4": { job: "Italian house, then the gift. Buy the tempo." },
    "c3 plus d4": { job: "Kick their bishop. Open the center now." },
    "Castle, take d4": { job: "King first. Then take the center clean." },
    "e5 wedge": { job: "Plant the wedge. Open the cutting bishop." },
    "Ba3 cuts the king": { job: "Cut the exit. They don't castle for free." },
    "Loot the knight": { job: "Loot the gift. Check next." },
    "d5 smash": { job: "Open more files. Don't take the pawn back." },
  },
  "italian-attack": {
    "Italian two knights": { job: "Two Knights. You attack. Not a quiet Italian." },
    "d4 smash": { job: "Open the center now. No slow bind." },
    "e5 wedge": { job: "Plant the Lange wedge. Their knight has no sofa." },
    "exf6 check": { job: "The wrecking ball lands. Check on the file." },
    "Ng5 plus Nc3": { job: "Hop at the holes. Queen eyes the wreck." },
    "Nce4 castle long": { job: "They run long. Hunt that king." },
    "g4 and fxg7": { job: "Kick the queen. Open the files they asked for." },
  },
  "vienna-gambit": {
    "Vienna knight": { job: "Knight out first. Then gift the f-pawn." },
    "f4 then d5": { job: "They break. You take. Don't chicken out." },
    "Nf3 Be7": { name: "Cover the raid", job: "Develop. Cover the cheap queen check." },
    "d4 castle": { job: "Center plus king. Then own the file." },
    "Bd3 f5": { job: "They kick. Take en passant. Keep the file." },
    "Trade Ne4": { job: "Trade on your terms. Clean the jumper." },
    "Bishops off": { job: "Trade the wreck. Queen up. Squeeze the file." },
  },
  "kings-gambit": {
    "f4 gift": { job: "Gift the f-pawn. The king file is a weapon." },
    "Nf3 g5 h4": { name: "Kick the storm", job: "Kieseritzky. Kick their g-pawn. Hunt, don't grab." },
    "Ne5 Nf6": { name: "Ne5 outpost", job: "Best outpost on the board. Sit." },
    "Bc4 d5": { job: "Bishop out. Same king-square religion." },
    "d4 Nh5": { job: "Take the center. Their knight is offside." },
    "Nc3 castle": { job: "Castle through the fire. Don't panic." },
    "Ne4 and g3": { name: "Cover then take", job: "Cover the king. Take the tension on your terms." },
  },
  "grand-prix": {
    "Nc3 f4": { name: "Prix punch", job: "Punch the Sicilian. No Open theory tonight." },
    "Nf3 Bc4": { name: "Aim the bishop", job: "Aim at the king. Same soft-square religion." },
    "f5 lever": { job: "Crack the file. They wanted a slow game." },
    "Take e6": { job: "Ruin the center. Then the queen swing." },
    "d3 Bg5": { job: "Pin. Then the bishop slides toward the king." },
    "Castle hops": { job: "King in. Knights hop toward the fianchetto." },
    "Trade and Qh5": { name: "Queen raid", job: "Look at the holes. The fianchetto is the target." },
  },
  "smith-morra": {
    "d4 c3 gift": { name: "c3 gift", job: "Gift the pawn. Buy the tempos." },
    "Nxc3 Bc4": { name: "Tempos on f7", job: "Aim at the king. Tempos on the soft square." },
    "O-O Nf6": { job: "Castle. Then the d-file bind." },
    "Bf4 e6": { name: "Hit d6", job: "Hit the backward pawn. They blunt. You sit." },
    "Qe2 Be7": { job: "Queen up. Rook wants the patient file." },
    "Rad1 e5": { job: "They grab space. You sit on the hole." },
    "Nd5 trades": { job: "Outpost. Don't hop off. Keep the bind." },
  },
  "french-kia": {
    "d3 KIA house": { job: "Same house every game. Don't debate French trees." },
    "Nf3 g3": { job: "Fianchetto. This bishop is the soul." },
    "Bg2 castle": { job: "King in. Then the storm." },
    "Re1 b5": { job: "They expand. You wait. Then plant the wedge." },
    "e5 Nd7": { job: "Wedge. The knight coils for the storm." },
    "Nf1 a5": { job: "The KIA hop. Ignore their queenside." },
    "h4 and Ng4": { name: "h-storm", job: "Storm the short king. Mate is the only target." },
  },
  "caro-fantasy": {
    "Fantasy f3": { job: "Keep the big center. Don't give the pawn away." },
    "Take e4, …e5": { name: "Take the center", job: "Take toward the middle. They want the break." },
    "Nf3 Be6": { job: "Cover. Don't grab the center pawn yet." },
    "c3 Bd3": { job: "Triangle. Aim at the king." },
    "Castle Bd6": { job: "King tucked. Queen wants the swing." },
    "Qe1 Qc7": { job: "Swing the queen. The wall has a crack." },
    "Nb3 a5": { job: "Chip. Pin next." },
    "Bg5 h6": { job: "Pin. They kick. You sit. Open the leftover file." },
  },
  london: {
    "London triangle": {
      job: "Fix the pawn chain so the bishop can breathe. Same house every game.",
    },
    "Knights vs c5": { job: "Meet the break. Keep developing. Don't panic." },
    "Keep the bishop": { job: "They wanted the London bishop. You said no." },
    "Ne5 outpost": { job: "The knight sits. Clamp behind it. Don't hop off." },
    "Castle then clamp": { job: "King tucked. Squeeze. Don't donate the outpost." },
    "Take the tension": { job: "If they hop, take on your terms. Recycle the knight." },
    "Pin and trade": { job: "Pin the defender. Trade it. Rooks to the files." },
  },
  "jobava-london": {
    "Jobava Nc3": { job: "Wild knight, London bishop. Not the quiet house." },
    "f3 e6 g4": { name: "Kick Bf5", job: "Kick their bishop. That's Jobava." },
    "h4 h6 h5": { name: "Trap the bishop", job: "Trap the bishop. Space first." },
    "e3 c5 Bd3": { job: "Trade their bishop. You keep the storm." },
    "Qxd3 Nc6": { job: "Queen up. Opposite kings are coming." },
    "Nge2 Bd6": { job: "Cover. They challenge. You still race." },
    "Long castle": { job: "Opposite kings. You storm first." },
  },
  "black-lion": {
    "Lion e5 break": { job: "Coil the house. Then wake — own the dark squares." },
    "Hide then castle": { job: "Cover the king square. Spine pawn. Then hide." },
    "Coil the queen": { job: "Coil the queen. Not a raid. Clear the rook." },
    "Kill the jumper": { job: "Ugly hop, right square. Take their jumper. Shove." },
    "Close the center": { job: "Close if they push. Queen tucks. Then the yawn." },
    "Lion yawn": { job: "Rooks. Bishop slides. The second jaw." },
    "Reload the hops": { job: "Knights back to the hole. That's the bite leftover." },
  },
  pirc: {
    "Pirc house": { job: "Small house. Long bishop. This bishop is the soul." },
    "Castle plus c6": { job: "King in. Blunt their hop. Then take the center back." },
    "Lion strike e5": { name: "Pirc strike", job: "Strike. You take the center back." },
    "Knight to c5": { job: "Hop to the outpost. Eye the chain." },
    "Reload the hops": { job: "Dual holes. Sit. The storm comes later." },
    "Develop and wait": { job: "Don't rush the f-pawn. Wait for the king to be ready." },
    "Trade the jumper": { job: "Trade on your terms. Recycle onto the hole." },
  },
  dragon: {
    "Dragon house": { job: "This bishop is the soul. The long diagonal." },
    "Yugoslav f3": { job: "They castle long. You knew. Race." },
    "Bc4 Bd7": { job: "Bishop out. The c-file wants the rook." },
    "O-O-O Rc8": { job: "Opposite kings. The c-file is the Dragon's breath." },
    "Ne5 h4": { job: "Hop. They throw the h-pawn. You freeze it." },
    "Soltis h5": { job: "Freeze their storm. That's how you race." },
    "Bg5 Rc5": { job: "Rook lift. Sac the exchange or hop in." },
  },
  scandinavian: {
    "…d5 strike": { name: "d5 strike", job: "Strike the center. You don't wait." },
    "Qa5 plus d4": { name: "Queen out", job: "Queen out. Pin ideas. Don't get trapped." },
    "Bf5 develop": { job: "Bishop out before you lock the chain." },
    "Nd5 Qd8": { job: "They hop. Queen tucks. Ugly pawn next." },
    "gxf6 wreck": { job: "Ugly pawn. Open file. That's the point." },
    "Long castle": { job: "Long castle. You asked for a race." },
    "Opposite kings": { job: "Use the open file. Don't count pretty pawns." },
  },
  alekhine: {
    "Provoke e5": { job: "Poke the head. Make them overextend." },
    "Four pawns": { job: "Four pawns. You wanted this fight." },
    "Take e5 Nc6": { job: "Open. Develop. Hit the overextended wall." },
    "Bf5 e6": { job: "Bishop out before you blunt. Then the rip." },
    "Be7 castle": { job: "King in. Then rip the center." },
    "…f6 rip": { name: "f6 rip", job: "The center is a piñata. That's the tax." },
    "Queen and pins": { job: "Pins and the recoup. Take the wreck. Use the files." },
  },
  "kings-indian": {
    "KID house": { job: "Small house. Not a Grünfeld grab. This bishop is the soul." },
    "…e5 close": { name: "Close the center", job: "Close the center. Then storm the king." },
    "Ne7 Nd7": { job: "Unblock the storm pawn. That's the Mar del Plata." },
    "f5 f4": { job: "The storm starts. Lock the center. Ignore their queenside." },
    "c5 g5": { job: "They chip queenside. You ignore it. Run the pawns." },
    "Ng6 Rf7": { job: "Lift. The g-file next. Mate is the target." },
    "h5 Bf8": { job: "Air. Bishop tucks. Then shove." },
  },
  "modern-benoni": {
    "…c5 Benoni": { name: "c5 Benoni", job: "Unbalance now. You wanted this structure." },
    "…d6 g6": { name: "Benoni house", job: "House. The long bishop is coming." },
    "Bg7 castle": { job: "The long bishop is the soul. King in." },
    "h3 a6": { job: "They stop the pin. You prep the majority." },
    "Nbd7 Re8": { job: "Hit the center pawn. It's hanging in the air." },
    "Rb8 Ne5": { job: "The b-file. Hop. Trade toward the majority." },
    "…g5 Nh5": { name: "Chip then hop", job: "Chip the king side. Knight to the hole. Run the pawns." },
  },
  benko: {
    "…b5 gift": { name: "b5 gift", job: "Buy the files. The pawn is a ticket." },
    "Take a6 g6": { name: "Open the roads", job: "Ask them to open the roads. Same bishop, same files." },
    "Bxf1 Kf1": { job: "Their king walked. You develop for free." },
    "…d6 Nf3": { name: "Hold the center", job: "Hold the middle. They cover. You still own the files." },
    "Bg7 castle": { job: "House up. Then the files." },
    "Qa5 Re1": { job: "Queen up. Pressure the gift squares." },
    "Rfb8 Ne8": { job: "Sit on the files. That's the whole opening." },
  },
  "dutch-leningrad": {
    "…f5 Dutch": { name: "f5 Dutch", job: "Unbalance on move one. The f-pawn is the weapon." },
    "Leningrad house": { job: "Leningrad house. Not a Stonewall. This bishop is the soul." },
    "Castle plus d6": { job: "King in. Cover the break square." },
    "Qe8 d5": { job: "Queen swing. She wants the king." },
    "…a5 Na6": { name: "Stop b4", job: "Stop their chip. Knight to the hole." },
    "…c6 take": { name: "Blunt d5", job: "Blunt their close. Recapture toward the center." },
    "…e5 break": { name: "Dutch break", job: "The Dutch break. Then the leftover file." },
  },
  budapest: {
    "…e5 gift": { name: "e5 gift", job: "Gift the pawn. Three tempos." },
    "Ng4 Bf4": { name: "Hop and cover", job: "Don't panic for the pawn. Pin and recoup." },
    "Bb4+ Qe7": { job: "Check. The king file is already a story." },
    "Take e5": { job: "Cash the gambit. You got the pawn back." },
    "Castle d6": { job: "King in. Nothing hanging. Hold the recoup." },
    "…b6 Bc5": { name: "Keep the bishop", job: "They hop. You keep the bishop. Squeeze next." },
    "…a5 files": { name: "Open a", job: "Squeeze the leftover pawn. Files next." },
  },
  alapin: {
    "c3 house": { job: "Same house every game. Recapture with a pawn." },
    "Full center": { job: "Take with a pawn. Don't gambit this one." },
    "Castle then kick": { job: "King in. Then tempo the queen." },
    "Hunt the queen": { job: "Hunt her. She doesn't get to sit." },
    "c5 outpost": { job: "Park the knight. The file is yours." },
    "Pile the file": { job: "Doubled rooks. They suffer on that file." },
    "IQP squeeze": { job: "Keep the isolani. Activity beats the pawn." },
  },
  english: {
    "c4 house": { job: "The flank pawn is the hero. Don't rush the center." },
    "Botvinnik clamp": { job: "Clamp the hole. You own it." },
    "Knight to e2": { job: "Hide the knight so the f-pawn can breathe." },
    "d5 outpost": { job: "Sit. They have to live with the hole." },
    "Hold …f5": { name: "Hold the clamp", job: "They chip. You keep the clamp." },
    "Queenside expand": { job: "Expand. Same as their Sicilian, a tempo up." },
    "Open the f-file": { job: "Take the chip. That's why the knight hid." },
  },
  "caro-kann": {
    "Caro wall": { job: "Wall first. Bishop out before the chain." },
    "Short shell": { job: "They develop quiet. You still chip the head." },
    "Chip the head": { job: "Hit the spearhead. Don't let it sit." },
    "Nf5 hop": { name: "Hop the hole", job: "Pin, then hop the hole they left." },
    "Castle the wall": { job: "King in. Don't donate the h-pawn." },
    "c4 outpost": { job: "Park the knight. The file is your yawn." },
    "Trade the bind": { job: "If they offer the bishop, take on your terms." },
  },
  "queens-gambit": {
    "Offer the wing": { job: "Offer the wing pawn. You want the middle." },
    "Exchange the center": { job: "Take. Now the minority is legal." },
    "Pin and house": { job: "Same pieces every game. Then the rook." },
    "Rook behind b": { job: "Rook behind the pawn. That's the tell." },
    "b4 anyway": { name: "Expand anyway", job: "They chip. You still expand." },
    "Wreck c6": { name: "Wreck the wall", job: "Crack their wall. Leave a patient." },
    "Ne5 sit": { job: "Outpost. Trade the right minors. Ending time." },
  },
  slav: {
    "Slav wall": { job: "Wall first. Not a Semi. Bishop stays free." },
    "Take then bishop": { job: "Take the pawn. Bishop out before the chain." },
    "Pin the knight": { job: "Pin. Their shove now costs a story." },
    "Castle the wall": { job: "King in. Tuck the bishop. Don't get trapped." },
    "Nd5 hole": { job: "They shove. You hop the hole they left." },
    "c-file sit": { job: "Rook to the file. Recycle the knight." },
    "Air vs h-pawn": { job: "Air, then tuck. Don't get trapped." },
  },
};

function overlayChunks(chunks: Chunk[], openingId: string): Chunk[] {
  const jobs = CHUNK_JOBS[openingId];
  if (!jobs) return chunks;
  return chunks.map((chunk) => {
    const next = jobs[chunk.name];
    if (!next) return chunk;
    return {
      ...chunk,
      name: next.name ?? chunk.name,
      job: next.job,
    };
  });
}

function coachFromHooks(openingId: string): CoachLine[] | undefined {
  const hooks = SHORT_HOOKS[openingId];
  if (!hooks?.length) return undefined;
  return hooks.map((row) => ({ afterPly: row.ply, text: spokenHook(row) }));
}

function beatsFromHooks(opening: Opening): StoryBeat[] {
  return opening.storyBeats.map((beat) => {
    const hook = SHORT_HOOKS[opening.id]?.find((row) => row.ply === beat.afterPly);
    return hook ? { ...beat, beat: spokenHook(hook) } : beat;
  });
}

/** Apply Memory OS copy onto a compiled opening before professor enrichment. */
export function applyConceptCopy(opening: Opening): Opening {
  const coach = coachFromHooks(opening.id);
  return {
    ...opening,
    chunks: overlayChunks(opening.chunks, opening.id),
    coach: coach ?? opening.coach,
    storyBeats: beatsFromHooks(opening),
  };
}
