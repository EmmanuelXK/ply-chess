import type { OpeningSpec } from "./types";

/** Production Opening Edge specs — 21 attacking systems. Compiled by makeOpening. */
export const openingSpecs = [
  {
    id: "scotch-gambit",
    name: "Scotch Gambit",
    shortName: "Scotch G",
    side: "white",
    family: "white",
    versus: "1...e5",
    blurb: "Open d4, hang the bishop, sit on e5. They take the pawn. You take the king.",
    story: {
      cast: "You are a sprinter who brought a bishop.",
      conflict: "Black wants to pocket d4 and castle in peace.",
      plan: "e5 wedge, ruin c6, then f4 and the e-file.",
    },
    modelFromPly: 32,
    bookChunks: [
      [
        4,
        "Open the center",
        "e4 e5 Nf3. Then d4.",
      ],
      [
        4,
        "Gambit bishop",
        "Bc4. Don't recapture yet.",
      ],
      [
        4,
        "e5 wedge",
        "e5 d5. Pin on c6.",
      ],
      [
        4,
        "Ruin the pawns",
        "Bxc6. Doubled c-pawns.",
      ],
      [
        4,
        "Castle then kick",
        "O-O. f3 hits Ne4.",
      ],
      [
        4,
        "f4 squeeze",
        "f4. Drive the knight.",
      ],
      [
        4,
        "Trade the jumper",
        "Nd2. Take on d2.",
      ],
      [
        4,
        "c3 and the file",
        "c3. Rooks belong on e.",
      ],
    ],
    pins: [
      {
        afterPly: 3,
        label: "at the d4 break…",
      },
      {
        afterPly: 8,
        label: "at the e5 wedge…",
      },
      {
        afterPly: 15,
        label: "at the c6 wreck…",
      },
      {
        afterPly: 18,
        label: "at the f3 kick…",
      },
      {
        afterPly: 31,
        label: "at the model middlegame…",
      },
    ],
    storyBeats: [
      {
        afterPly: 4,
        beat: "Cast: bishop out. Pawn hanging. That's you.",
      },
      {
        afterPly: 8,
        beat: "Conflict: e5. They don't get to rest.",
      },
      {
        afterPly: 15,
        beat: "Structure wrecked. Now squeeze.",
      },
      {
        afterPly: 31,
        beat: "Plan: e-file and f4. Don't give the wedge back.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "Don't recapture. Develop.",
      },
      {
        afterPly: 0,
        text: "e4. Open game. That's the point.",
      },
      {
        afterPly: 2,
        text: "Knight out. d4 is coming.",
      },
      {
        afterPly: 4,
        text: "d4. Kick the door.",
      },
      {
        afterPly: 6,
        text: "Bc4. f7 is the headline.",
      },
      {
        afterPly: 8,
        text: "e5. Wedge. Sit on it.",
      },
      {
        afterPly: 10,
        text: "Bb5. Pin. That's the Dubov bit.",
      },
      {
        afterPly: 14,
        text: "Take. Ruin the queenside.",
      },
      {
        afterPly: 16,
        text: "Castle. Then kick the knight.",
      },
      {
        afterPly: 18,
        text: "f3. No outpost for them.",
      },
      {
        afterPly: 20,
        text: "f4. Space. That's the squeeze.",
      },
      {
        afterPly: 24,
        text: "Queen centralizes. e-file next.",
      },
      {
        afterPly: 28,
        text: "Rook to e. You asked for this file.",
      },
      {
        afterPly: 31,
        text: "Book's done. Convert the wedge.",
      },
    ],
    traps: [
      {
        id: "bxf7",
        name: "c3 Bxf7+",
        blurb: "They grab c3. You grab the king.",
        san: "e4 e5 Nf3 Nc6 d4 exd4 Bc4 Bc5 c3 dxc3 Bxf7+ Kxf7 Qd5+ Kf8 Qxc5+ d6 Qxc3 Nf6 O-O Qe7 Re1",
        shotPly: 10,
        coach: "Bxf7+. King walked. Queen checks. Loot.",
      },
      {
        id: "ng4",
        name: "Ng4 punished",
        blurb: "e5, they hop Ng4. Same bishop, same king.",
        san: "e4 e5 Nf3 Nc6 d4 exd4 Bc4 Nf6 e5 Ng4 Bxf7+ Kxf7 Ng5+ Kg8 Qxg4 d5 Qf3 Be6 O-O Qd7",
        shotPly: 10,
        coach: "Bxf7+ then Ng5+. Queen loots g4.",
      },
      {
        id: "qh4",
        name: "Queen raid",
        blurb: "…Qh4 is a tourist. Castle and hunt it.",
        san: "e4 e5 Nf3 Nc6 d4 exd4 Bc4 Qh4 O-O Nf6 Re1 d6 Nxd4 Bd7 Nf3 Qh5 e5",
        shotPly: 16,
        coach: "e5. The queen is offside. Open the file.",
      },
    ],
    pillars: {
      pawnStructure: "e5 wedge vs doubled c-pawns. Keep e5. If they take on d4, recapture toward the center and use the e-file.",
      pieceCoordination: "Bc4, Nb1-d2, Qd2, Rae1. Knight belongs on f3 or e4. Don't let …Bg4 freeze you.",
      kingSafety: "Castle short before f4. Their king is usually short too — the race is who opens e/f first.",
      breaksAndStorms: "f4-f5 and e6 as a lever. Queenside b4 chips the doubled pawns.",
      tacticsBank: "Bxf7+ after …dxc3, Ng4 punished by Bxf7+, and the offside …Qh4 raid.",
      attackingPlan: "Aggressive default: f4, Qe2/d2, Rae1, e6 lever. Steady: sit on e5 and squeeze c5. Creative: piece sac on e6 if the king stays.",
    },
    plans: {
      steady: "Hold e5. Trade a pair of bishops. Fix the c-pawns. Don't chase ghosts.",
      creative: "If they sit, lift a rook e4-h4. The London-style squeeze with extra tempo.",
      aggressive: "e6 or f5 when the pieces are ready — not before. One break. All in.",
    },
    depthNote: "21 moves. Core book is the Dubov Scotch Gambit (4.Bc4 Nf6 5.e5 d5 6.Bb5). After ~move 16 this is a model e-file squeeze, not a forced engine tree. 4…Bc5 lines live in the trap pack.",
  },
  {
    id: "evans-gambit",
    name: "Evans Gambit",
    shortName: "Evans",
    side: "white",
    family: "white",
    versus: "1...e5 Italian",
    blurb: "b4. Buy a tempo. Open the center. Hunt f7 while they count pawns.",
    story: {
      cast: "You are the Italian who brought a pawn sacrifice.",
      conflict: "Black wants to pocket b4 and castle.",
      plan: "c3-d4, Ba3, e5. Don't let the bishop breathe.",
    },
    modelFromPly: 32,
    bookChunks: [
      [
        6,
        "Italian then b4",
        "Bc4 Bc5. Then b4.",
      ],
      [
        4,
        "c3 plus d4",
        "Kick the bishop. Open d.",
      ],
      [
        4,
        "Castle, take d4",
        "O-O. Recapture. Bb6.",
      ],
      [
        4,
        "e5 wedge",
        "e5. Open the bishop.",
      ],
      [
        4,
        "Ba3 cuts the king",
        "Ba3. No …O-O for free.",
      ],
      [
        4,
        "Loot the knight",
        "Nxe5 then Qa4+.",
      ],
      [
        6,
        "d5 smash",
        "d5. Trade. Queen central.",
      ],
    ],
    pins: [
      {
        afterPly: 7,
        label: "at the b4 gift…",
      },
      {
        afterPly: 13,
        label: "at the d4 break…",
      },
      {
        afterPly: 20,
        label: "at the e5 wedge…",
      },
      {
        afterPly: 22,
        label: "at the Ba3 cut…",
      },
      {
        afterPly: 31,
        label: "at the model middlegame…",
      },
    ],
    storyBeats: [
      {
        afterPly: 7,
        beat: "Cast: one pawn. Three tempos. That's the Evans.",
      },
      {
        afterPly: 20,
        beat: "Conflict: e5. Their king is still in the shop.",
      },
      {
        afterPly: 31,
        beat: "Plan: open files. Don't take the pawn back.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "b4. Buy the tempo.",
      },
      {
        afterPly: 6,
        text: "This pawn is a ticket, not a donation.",
      },
      {
        afterPly: 8,
        text: "c3. The bishop has no home.",
      },
      {
        afterPly: 10,
        text: "d4. You asked for the center.",
      },
      {
        afterPly: 14,
        text: "Castle. The king is the cheap insurance.",
      },
      {
        afterPly: 20,
        text: "e5. Open Ba3's diagonal.",
      },
      {
        afterPly: 22,
        text: "Ba3. They don't castle for free.",
      },
      {
        afterPly: 24,
        text: "Take e5. Then the check.",
      },
      {
        afterPly: 31,
        text: "Book's done. Keep the initiative.",
      },
    ],
    traps: [
      {
        id: "compromised",
        name: "Compromised",
        blurb: "They grab c3. Qb3 and e5. Hunt the queen.",
        san: "e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4 exd4 O-O dxc3 Qb3 Qf6 e5 Qg6 Nxc3 Nge7 Ba3 O-O Rad1",
        shotPly: 16,
        coach: "Qb3. f7 and b7. They wanted a pawn.",
      },
      {
        id: "f7",
        name: "Qb3 f7",
        blurb: "…d6 without taking. Queen to b3. Bishop takes f7.",
        san: "e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4 d6 Qb3 Qd7 Bxf7+ Qxf7 Qxb7",
        shotPly: 14,
        coach: "Bxf7+. Queen loots b7. Development lead.",
      },
      {
        id: "bg4",
        name: "Pin punished",
        blurb: "Qb3, then e5. The pin on f3 is a lie.",
        san: "e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4 exd4 O-O d6 cxd4 Bb6 Qb3 Qe7 e5 dxe5 Nxe5 Nxe5 Re1",
        shotPly: 20,
        coach: "e5 then Nxe5. Pin dies. File opens.",
      },
    ],
    pillars: {
      pawnStructure: "Open center after c3-d4. You are down a pawn; you are up files.",
      pieceCoordination: "Bc4, Qb3, Ba3, Nb1-d2-c4. Knights hop toward d6 and f7.",
      kingSafety: "Castle first. Their king is often stuck because Ba3 eats the diagonal.",
      breaksAndStorms: "e5 and d5. If they close with …d6, chip with a4 and Ba3.",
      tacticsBank: "Compromised Qb3, Bxf7+ vs …d6, and e5 vs the …Bg4 pin.",
      attackingPlan: "Aggressive: open everything, sack if f7 cracks. Steady: a4-Ba3 bind. Creative: Nxb6 and the a-file.",
    },
    plans: {
      steady: "a4, Ba3, keep the bishop pair. Recoup b6 slowly.",
      creative: "If they castle long, lift a rook and throw the a-pawn.",
      aggressive: "e5-d5. Open f7. Don't count the pawn.",
    },
    depthNote: "21 moves. Normal Position Evans (…d6, cxd4 Bb6) is the spine. Compromised Defense and Qb3 shots are the trap pack. Sidelines after 7…Nge7 are Phase-2 trees.",
  },
  {
    id: "italian-attack",
    name: "Italian attacking",
    shortName: "Max Lange",
    side: "white",
    family: "white",
    versus: "Two Knights",
    blurb: "Max Lange spine. Fried Liver and Lolli in the pack. f7 is the religion.",
    story: {
      cast: "You are an Italian priest with a crowbar.",
      conflict: "Black wants the Two Knights and a safe king.",
      plan: "d4, e5, fxg7. Open the e-file onto the uncastled king.",
    },
    modelFromPly: 32,
    bookChunks: [
      [
        6,
        "Italian two knights",
        "Bc4 Nf6. Not a quiet Giuoco.",
      ],
      [
        4,
        "d4 smash",
        "d4. Open it now.",
      ],
      [
        4,
        "e5 wedge",
        "e5 d5. The Lange.",
      ],
      [
        4,
        "exf6 check",
        "Take, check, Be6.",
      ],
      [
        4,
        "Ng5 plus Nc3",
        "Hop. Queen to f5.",
      ],
      [
        4,
        "Nce4 castle long",
        "They run queenside.",
      ],
      [
        6,
        "g4 and fxg7",
        "Kick the queen. Open g.",
      ],
    ],
    pins: [
      {
        afterPly: 7,
        label: "at the d4 smash…",
      },
      {
        afterPly: 10,
        label: "at the e5 Lange…",
      },
      {
        afterPly: 14,
        label: "at the f6 wreck…",
      },
      {
        afterPly: 24,
        label: "at the long castle…",
      },
      {
        afterPly: 31,
        label: "at the model middlegame…",
      },
    ],
    storyBeats: [
      {
        afterPly: 7,
        beat: "Cast: d4. No Giuoco Pianissimo today.",
      },
      {
        afterPly: 14,
        beat: "Conflict: the f-pawn is a wrecking ball.",
      },
      {
        afterPly: 31,
        beat: "Plan: g-file and the e-file. Their king picked a side.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "Two Knights. You attack.",
      },
      {
        afterPly: 6,
        text: "d4. Not c3. Not a3.",
      },
      {
        afterPly: 10,
        text: "e5. That's the Lange.",
      },
      {
        afterPly: 12,
        text: "Take on f6. Check on e1.",
      },
      {
        afterPly: 16,
        text: "Ng5. Hit e6 and f7.",
      },
      {
        afterPly: 22,
        text: "g4. Queen has no sofa.",
      },
      {
        afterPly: 26,
        text: "fxg7. Open the file they wanted.",
      },
      {
        afterPly: 31,
        text: "Book's done. Hunt the long king.",
      },
    ],
    traps: [
      {
        id: "fried-liver",
        name: "Fried Liver",
        blurb: "Ng5 d5 exd5 Nxd5 Nxf7. Club classic. Legal.",
        san: "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7 Kxf7 Qf3+ Ke6 Nc3 Nb4 a3 Nxc2+ Kd1 Nxa1 Nxd5",
        shotPly: 10,
        coach: "Nxf7. King walks. Qf3+. You hunt.",
      },
      {
        id: "lolli",
        name: "Lolli d4",
        blurb: "Same Ng5, but d4 instead of Nxf7. Sounder, still vicious.",
        san: "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 d4 Bb4+ c3 Be7 Qf3 O-O Qe4 Nf6 Qxe5",
        shotPly: 10,
        coach: "d4. Center first. Then the queen loots e5.",
      },
      {
        id: "traxler",
        name: "Traxler answer",
        blurb: "They sac on f2. You take f7, then the queen check.",
        san: "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 Bc5 Nxf7 Bxf2+ Kf1 Qe7 Nxh8 d5 exd5 Nd4 c3 Bg4 Qa4+",
        shotPly: 8,
        coach: "Nxf7. Don't panic on f2. Queen check later.",
      },
    ],
    pillars: {
      pawnStructure: "Open e-file, pawn on f6/g7 as a wedge. Their d-pawn is often isolated.",
      pieceCoordination: "Bc4, Ng5, Nc3-e4, Qd1-h5/f3. Rooks to e1 and d1.",
      kingSafety: "You castle short. They often castle long. Race the g- and e-files.",
      breaksAndStorms: "g4, fxg7, then h4-h5 if the king is long.",
      tacticsBank: "Fried Liver Nxf7, Lolli d4, Traxler Nxf7 answer.",
      attackingPlan: "Aggressive: open g and e, sac on e6. Steady: trade into a plus pawn. Creative: Nd6+ outpost.",
    },
    plans: {
      steady: "Trade queens if they beg. Keep the e-file. Extra pawn on g7 is a bone in the throat.",
      creative: "If the long king sits, a4-a5 and a rook lift.",
      aggressive: "Open g. Sac on e6. Don't count.",
    },
    depthNote: "21 moves. Max Lange (4.d4 / 5.O-O / 6.e5) is the spine — one attacking system, not a Two Knights tree. Fried Liver, Lolli, and Traxler answers are the trap pack. Quiet Giuoco Pianissimo is out of scope.",
  },
  {
    id: "vienna-gambit",
    name: "Vienna Gambit",
    shortName: "Vienna G",
    side: "white",
    family: "white",
    versus: "1...e5",
    blurb: "Nc3 then f4. Modern: 3…d5, take, develop, and punish the knight on e4.",
    story: {
      cast: "You are King's Gambit with a knight already out.",
      conflict: "Black wants …d5 and a safe extra pawn.",
      plan: "Take on e5, kick Ne4, castle, and play the e-file.",
    },
    modelFromPly: 32,
    bookChunks: [
      [
        4,
        "Vienna knight",
        "Nc3. Then f4.",
      ],
      [
        4,
        "f4 then d5",
        "They break. You take e5.",
      ],
      [
        4,
        "Nf3 Be7",
        "Develop. Cover g5.",
      ],
      [
        4,
        "d4 castle",
        "Center plus king.",
      ],
      [
        4,
        "Bd3 f5",
        "They kick. You take en passant.",
      ],
      [
        4,
        "Trade Ne4",
        "Nxe4. Clean the center.",
      ],
      [
        8,
        "Bishops off",
        "Take on e4. Nxf6. Queen up.",
      ],
    ],
    pins: [
      {
        afterPly: 4,
        label: "at the f4 gambit…",
      },
      {
        afterPly: 7,
        label: "at the d5 break…",
      },
      {
        afterPly: 16,
        label: "at the castle lock…",
      },
      {
        afterPly: 22,
        label: "at the Ne4 trade…",
      },
      {
        afterPly: 31,
        label: "at the model middlegame…",
      },
    ],
    storyBeats: [
      {
        afterPly: 4,
        beat: "Cast: f4 with a knight already developed.",
      },
      {
        afterPly: 16,
        beat: "King tucked. Now the e-file.",
      },
      {
        afterPly: 31,
        beat: "Plan: extra center, extra file. Squeeze.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "Nc3 first. Then f4.",
      },
      {
        afterPly: 4,
        text: "f4. That's the Vienna.",
      },
      {
        afterPly: 6,
        text: "Take on e5. Don't chicken out.",
      },
      {
        afterPly: 8,
        text: "Nf3. Cover g5. No cheap queen checks.",
      },
      {
        afterPly: 16,
        text: "Castle. Then take the knight.",
      },
      {
        afterPly: 22,
        text: "Nxe4. Tension dies on your terms.",
      },
      {
        afterPly: 31,
        text: "Book's done. You have the file.",
      },
    ],
    traps: [
      {
        id: "legal-mate",
        name: "Legal's mate",
        blurb: "Nc3, then the classic queen sac. Bxf7+ and Nd5# is mate.",
        san: "e4 e5 Nc3 d6 Bc4 Nc6 Nf3 Bg4 Nxe5 Bxd1 Bxf7+ Ke7 Nd5#",
        shotPly: 12,
        coach: "Queen gone. Bxf7+. Nd5#. That's Legal.",
      },
      {
        id: "qxe4",
        name: "Qf3 recapture",
        blurb: "They hop Ne4. Queen to f3. Recapture toward the center.",
        san: "e4 e5 Nc3 Nf6 f4 d5 fxe5 Nxe4 Qf3 Nxc3 dxc3 Be7 Bf4 c6 O-O-O Be6 Ne2 Nd7 Nd4",
        shotPly: 8,
        coach: "Qf3. Recapture dxc3. Long castle. Attack.",
      },
      {
        id: "qh4",
        name: "…Qh4 tour",
        blurb: "They check on h4. Ke2 is fine. Then Nf3 and the queen runs.",
        san: "e4 e5 Nc3 Nc6 f4 exf4 d4 Qh4+ Ke2 d6 Nf3 Bg4 Bxf4 O-O-O Qd2",
        shotPly: 8,
        coach: "Ke2. Not a panic. Nf3 next. Queen offside.",
      },
    ],
    pillars: {
      pawnStructure: "e5 pawn vs …d5. After trades you often have a c3/d4 or open e-file.",
      pieceCoordination: "Nc3, Nf3, Bd3, Qe2. Knights want e4 and d4.",
      kingSafety: "Short castle is default. Legal's mate is the exception — their king in the center.",
      breaksAndStorms: "f4 already happened. Next is e5-e6 or c4-d5.",
      tacticsBank: "Legal's mate, Qf3 recapture, and Ke2 vs …Qh4.",
      attackingPlan: "Aggressive: open e, lift rooks, f-file leftovers. Steady: extra center pawn. Creative: O-O-O if they castle short.",
    },
    plans: {
      steady: "Hold e5/c3. Trade a pair. Play against the isolated pawn if they get one.",
      creative: "Long castle if their queen is offside. Storm h4-g4.",
      aggressive: "Open e. Sac on f7 if Legal's pattern echoes.",
    },
    depthNote: "21 moves. Modern Vienna Gambit 3.f4 d5 4.fxe5 Nxe4 5.Nf3 is the spine. Legal's mate (Nc3 then the queen sac) and 3…exf4 …Qh4 are pack shots. Quiet 3.g3 Vienna is out of scope.",
  },
  {
    id: "kings-gambit",
    name: "King's Gambit",
    shortName: "KG",
    side: "white",
    family: "white",
    versus: "1...e5",
    blurb: "f4. Modern attacking: Kieseritzky 3.Nf3 g5 4.h4 g4 5.Ne5. Hunt the king, not the pawn.",
    story: {
      cast: "You are a romantic who read a modern book.",
      conflict: "Black wants to keep f4 and kick the knight with …g5-g4.",
      plan: "Ne5, Bc4, d4. Castle through the fire. Take on f3 later.",
    },
    modelFromPly: 32,
    bookChunks: [
      [
        4,
        "f4 gift",
        "f4. Take it. We wanted that.",
      ],
      [
        4,
        "Nf3 g5 h4",
        "Kieseritzky. Kick g5.",
      ],
      [
        4,
        "Ne5 Nf6",
        "Outpost. They poke e4.",
      ],
      [
        4,
        "Bc4 d5",
        "Bishop out. They break.",
      ],
      [
        4,
        "d4 Nh5",
        "Center. Knight offside.",
      ],
      [
        4,
        "Nc3 castle",
        "Develop. King in.",
      ],
      [
        8,
        "Ne4 and g3",
        "Kick f3. Cover the king.",
      ],
    ],
    pins: [
      {
        afterPly: 2,
        label: "at the f4 gift…",
      },
      {
        afterPly: 8,
        label: "at the Ne5 outpost…",
      },
      {
        afterPly: 16,
        label: "at the castle lock…",
      },
      {
        afterPly: 31,
        label: "at the model middlegame…",
      },
    ],
    storyBeats: [
      {
        afterPly: 2,
        beat: "Cast: f4. The king file is a weapon.",
      },
      {
        afterPly: 8,
        beat: "Conflict: Ne5. Their g-pawn is committed.",
      },
      {
        afterPly: 31,
        beat: "Plan: take f3 on your terms. Then the e-file.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "f4. Don't play scared.",
      },
      {
        afterPly: 2,
        text: "There it is. The King's Gambit.",
      },
      {
        afterPly: 4,
        text: "Nf3. Stop …Qh4.",
      },
      {
        afterPly: 6,
        text: "h4. Kieseritzky. Kick g5.",
      },
      {
        afterPly: 8,
        text: "Ne5. Best square on the board.",
      },
      {
        afterPly: 10,
        text: "Bc4. Same religion as the Evans.",
      },
      {
        afterPly: 16,
        text: "Castle. Through the fire.",
      },
      {
        afterPly: 22,
        text: "g3. Cover. Then take f3.",
      },
      {
        afterPly: 31,
        text: "Book's done. Convert the outpost.",
      },
    ],
    traps: [
      {
        id: "cunningham",
        name: "Cunningham",
        blurb: "…Be7-h4+. g3, castle into it, then Bxf7+.",
        san: "e4 e5 f4 exf4 Nf3 Be7 Bc4 Bh4+ g3 fxg3 O-O gxh2+ Kh1 d5 Bxd5 Nf6 Bxf7+ Kxf7 Ne5+",
        shotPly: 16,
        coach: "Bxf7+. King walked. Ne5+ next.",
      },
      {
        id: "bishop",
        name: "Bishop's Gambit",
        blurb: "3.Bc4 Qh4+. Kf1. Then d4. The king is fine.",
        san: "e4 e5 f4 exf4 Bc4 Qh4+ Kf1 d6 d4 Bg4 Nf3 Qh5 Bxf4 Nc6 Nc3 O-O-O Be2",
        shotPly: 6,
        coach: "Kf1. Not a panic. d4 and Nf3. Queen runs.",
      },
      {
        id: "qh4-early",
        name: "Early …Qh4",
        blurb: "2…Qh4+. g3. Then fxe5. Queen tours, you develop.",
        san: "e4 e5 f4 Qh4+ g3 Qe7 fxe5 Qxe5 Nf3 Qe7 Nc3 Nf6 d4 d6 Bf4",
        shotPly: 4,
        coach: "g3. Queen check is a tourist. Take e5.",
      },
    ],
    pillars: {
      pawnStructure: "Open f-file vs their g4/f3 wedge. d4-e4 center. Don't recapture f4 too early.",
      pieceCoordination: "Ne5, Bc4, Nc3, Qd3. Rooks to e1 and f1.",
      kingSafety: "Castle short anyway. Kf1 in Bishop's Gambit is a known, safe exception.",
      breaksAndStorms: "h4 already happened. Next is g3xf3 and e5-e6.",
      tacticsBank: "Cunningham Bxf7+, Bishop's Gambit Kf1, early …Qh4.",
      attackingPlan: "Aggressive: Ne5-g4, Qh5 ideas, Bxf7. Steady: recoup f4 and play a plus center. Creative: long castle vs their short.",
    },
    plans: {
      steady: "Take f3, recoup f4, trade a pair. Extra center pawn is enough.",
      creative: "If they keep the king in the center, Rhf1 and a rook lift.",
      aggressive: "Bxf7 patterns. Qh5. Don't count the g-pawn.",
    },
    depthNote: "21 moves. Kieseritzky (3.Nf3 g5 4.h4 g4 5.Ne5) is the modern attacking spine. Bishop's Gambit and Cunningham are pack shots. Fischer 3…d6 is a later tree.",
  },
  {
    id: "grand-prix",
    name: "Grand Prix Attack",
    shortName: "Grand Prix",
    side: "white",
    family: "white",
    versus: "Sicilian",
    blurb: "Nc3 f4 vs the Sicilian. Bc4, f5, Qh5. You don't play Open Sicilian theory.",
    story: {
      cast: "You are a Closed Sicilian that learned to punch.",
      conflict: "Black wants …d6 …g6 and a queenside minority.",
      plan: "f5, Qh5, Bh6. Mate the fianchetto before …b5 matters.",
    },
    modelFromPly: 32,
    bookChunks: [
      [
        4,
        "Nc3 f4",
        "Not Nf3. Grand Prix.",
      ],
      [
        4,
        "Nf3 Bc4",
        "Bishop to c4. Aim f7.",
      ],
      [
        4,
        "f5 lever",
        "f5. Open the f-file.",
      ],
      [
        4,
        "Take e6",
        "fxe6. Ruin the center.",
      ],
      [
        4,
        "d3 Bg5",
        "Pin. Then Bh4-g3.",
      ],
      [
        4,
        "Castle hops",
        "O-O. Knights to e5.",
      ],
      [
        8,
        "Trade and Qh5",
        "Take e5. Queen to h5.",
      ],
    ],
    pins: [
      {
        afterPly: 4,
        label: "at the f4 Grand Prix…",
      },
      {
        afterPly: 10,
        label: "at the f5 lever…",
      },
      {
        afterPly: 20,
        label: "at the e5 hop…",
      },
      {
        afterPly: 26,
        label: "at the Qh5 raid…",
      },
      {
        afterPly: 31,
        label: "at the model middlegame…",
      },
    ],
    storyBeats: [
      {
        afterPly: 4,
        beat: "Cast: f4 vs a Sicilian. No Open theory.",
      },
      {
        afterPly: 10,
        beat: "Conflict: f5. They wanted a slow game.",
      },
      {
        afterPly: 26,
        beat: "Plan: Qh5. The fianchetto is a target.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "Nc3. Then f4. Not Open Sicilian.",
      },
      {
        afterPly: 4,
        text: "f4. That's the Prix.",
      },
      {
        afterPly: 8,
        text: "Bc4. Same f7 religion.",
      },
      {
        afterPly: 10,
        text: "f5. Open it.",
      },
      {
        afterPly: 20,
        text: "Knights hop e5. Trade toward the king.",
      },
      {
        afterPly: 26,
        text: "Qh5. Look at h6 and f7.",
      },
      {
        afterPly: 31,
        text: "Book's done. Storm the fianchetto.",
      },
    ],
    traps: [
      {
        id: "f5-sac",
        name: "f5 sac",
        blurb: "f5 even if they can take. Open f. Queen swing.",
        san: "e4 c5 Nc3 Nc6 f4 g6 Nf3 Bg7 Bc4 e6 f5 exf5 d3 Nge7 O-O O-O Qe1",
        shotPly: 10,
        coach: "f5. File over pawn. Qe1-h4 next.",
      },
      {
        id: "nd4",
        name: "Bb5 vs …Nd4",
        blurb: "They hop Nd4. Take, c3, and the bishop sits on d3.",
        san: "e4 c5 Nc3 Nc6 f4 g6 Nf3 Bg7 Bb5 Nd4 Nxd4 cxd4 Ne2 Qb6 Bd3 d6 c3",
        shotPly: 10,
        coach: "Take on d4. c3. Bishop to d3. You still storm.",
      },
      {
        id: "early-f5",
        name: "…d6 f5",
        blurb: "Same Prix vs …d6. f5, take e6, ruin the bishops.",
        san: "e4 c5 Nc3 d6 f4 Nc6 Nf3 g6 Bc4 Bg7 O-O e6 f5 Nge7 fxe6 Bxe6 Bxe6 fxe6",
        shotPly: 12,
        coach: "f5 then take e6. Their structure is toast.",
      },
    ],
    pillars: {
      pawnStructure: "f-file vs …e6/…g6. After fxe6 the d-pawn can become backward. You don't care — you attack.",
      pieceCoordination: "Bc4, Qh5, Bg5-h4-g3, Nc3, Rf3-f1 doubled.",
      kingSafety: "Short castle. Their king is short behind a fianchetto you want to rip.",
      breaksAndStorms: "f5 is the break. Then h4 if they play …g5.",
      tacticsBank: "f5 sac, Bb5 vs …Nd4, fxe6 structure wreck.",
      attackingPlan: "Aggressive: Qh5, Bh6, Nd5. Steady: take e5 and play a plus center. Creative: rook lift Rf3-h3.",
    },
    plans: {
      steady: "Trade dark bishops. Sit on e5. Don't sac if Qh5 is kicked.",
      creative: "Rf3-h3. Queen to h4. Same idea, slower.",
      aggressive: "Nd5, Qh5, Bh6. Mate the g7 bishop.",
    },
    depthNote: "21 moves. Bc4 Grand Prix vs 2…Nc6 / …g6 is the spine (not the slower Bb5-only system). Open Sicilian trees are out of scope on purpose.",
  },
  {
    id: "smith-morra",
    name: "Smith-Morra Gambit",
    shortName: "Morra",
    side: "white",
    family: "white",
    versus: "Sicilian",
    blurb: "d4 c3. One pawn for three tempos. Bc4, Qe2, Rad1. They never finish developing.",
    story: {
      cast: "You are Open Sicilian without the theory tax.",
      conflict: "Black wants to pocket c3 and castle.",
      plan: "Bc4, Qe2, Rad1, Nd5. Pressure d6 until it cracks.",
    },
    modelFromPly: 32,
    bookChunks: [
      [
        6,
        "d4 c3 gift",
        "d4 cxd4 c3. That's the Morra.",
      ],
      [
        4,
        "Nxc3 Bc4",
        "Tempos. Aim f7 and d5.",
      ],
      [
        4,
        "O-O Nf6",
        "Castle. They develop.",
      ],
      [
        4,
        "Bf4 e6",
        "Hit d6. They blunt c4.",
      ],
      [
        4,
        "Qe2 Be7",
        "Queen up. Rook wants d1.",
      ],
      [
        4,
        "Rad1 e5",
        "They grab space. You sit Nd5.",
      ],
      [
        6,
        "Nd5 trades",
        "Outpost. Bishops recapture.",
      ],
    ],
    pins: [
      {
        afterPly: 5,
        label: "at the c3 gift…",
      },
      {
        afterPly: 10,
        label: "at the Bc4 aim…",
      },
      {
        afterPly: 22,
        label: "at the d-file…",
      },
      {
        afterPly: 24,
        label: "at the Nd5 outpost…",
      },
      {
        afterPly: 31,
        label: "at the model middlegame…",
      },
    ],
    storyBeats: [
      {
        afterPly: 5,
        beat: "Cast: one pawn. Three developing moves.",
      },
      {
        afterPly: 22,
        beat: "Conflict: the d-file. Their d6 is a patient.",
      },
      {
        afterPly: 31,
        beat: "Plan: Nd5 and the c-file. Don't take the pawn back.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "d4. Then c3. Don't recapture with the queen.",
      },
      {
        afterPly: 4,
        text: "c3. That's the whole opening.",
      },
      {
        afterPly: 8,
        text: "Bc4. Tempos on f7.",
      },
      {
        afterPly: 16,
        text: "Bf4. d6 is the patient.",
      },
      {
        afterPly: 18,
        text: "Qe2. Rook to d1 next.",
      },
      {
        afterPly: 24,
        text: "Nd5. Best square. Sit.",
      },
      {
        afterPly: 31,
        text: "Book's done. Keep the bind.",
      },
    ],
    traps: [
      {
        id: "e5-push",
        name: "e5 lever",
        blurb: "They develop …Nf6 too slow. e5, queens off, Nxe5.",
        san: "e4 c5 d4 cxd4 c3 dxc3 Nxc3 Nc6 Nf3 d6 Bc4 Nf6 e5 dxe5 Qxd8+ Nxd8 Nxe5 e6 O-O",
        shotPly: 12,
        coach: "e5. Queens off. You still have the lead.",
      },
      {
        id: "nb5",
        name: "Nb5 raid",
        blurb: "…Qc7 and …e6. Nb5 hits the queen. Bf4 next.",
        san: "e4 c5 d4 cxd4 c3 dxc3 Nxc3 Nc6 Nf3 e6 Bc4 Qc7 Qe2 Nf6 Nb5 Qb8 Bf4 e5 Bg3 a6 Nc3",
        shotPly: 14,
        coach: "Nb5. Queen to b8. Bf4. You own the diagonals.",
      },
      {
        id: "siberian",
        name: "Siberian answer",
        blurb: "They decline with …Nf6. e5, Bc4, you still develop fast.",
        san: "e4 c5 d4 cxd4 c3 Nf6 e5 Nd5 Nf3 Nc6 Bc4 Nb6 Bb3 d5 exd6 Qxd6 O-O",
        shotPly: 6,
        coach: "e5. Decline isn't free. Bishop to c4.",
      },
    ],
    pillars: {
      pawnStructure: "Open c and d files. Their …e5 leaves d6 weak. You are down a pawn on purpose.",
      pieceCoordination: "Bc4, Qe2, Rad1, Rc1, Nd5. Every piece looks at d6 or f7.",
      kingSafety: "Castle short before Nd5. Their king is usually short — attack it only after d6 cracks.",
      breaksAndStorms: "e5 lever if …Nf6 is loose. f4-f5 as a second wave.",
      tacticsBank: "e5 vs …Nf6, Nb5 vs …Qc7, Siberian 3…Nf6 answer.",
      attackingPlan: "Aggressive: Nd5, Bxe6 sacs, f4. Steady: recoup d6. Creative: a3-b4 minority with Rc1.",
    },
    plans: {
      steady: "Sit on d5. Trade into a plus d6 pressure. Don't sac if they're developed.",
      creative: "b4-a4 and Rc1. The c-file is yours too.",
      aggressive: "Nd5, f4-f5, Bxe6 if the king is the target.",
    },
    depthNote: "21 moves. Accepted Morra 4…Nc6 5.Nf3 d6 6.Bc4 is the spine. Declined 3…Nf6 (Siberian) is a pack shot, not a second repertoire tree.",
  },
  {
    id: "french-kia",
    name: "French KIA",
    shortName: "French KIA",
    side: "white",
    family: "white",
    versus: "French",
    blurb: "Vs French: King's Indian Attack. Same house every time, then h4 and the kingside storm.",
    story: {
      cast: "You are a King's Indian with the white pieces.",
      conflict: "Black wants …c5 …b5 and a queenside squeeze.",
      plan: "e5, Nf1-h2-g4, h4-h5. Mate the short king while they loot the queenside.",
    },
    modelFromPly: 32,
    bookChunks: [
      [
        4,
        "d3 KIA house",
        "d3. Not d4. System.",
      ],
      [
        4,
        "Nf3 g3",
        "Fianchetto. The long bishop.",
      ],
      [
        4,
        "Bg2 castle",
        "King in. Then the storm.",
      ],
      [
        4,
        "Re1 b5",
        "They expand. You wait.",
      ],
      [
        4,
        "e5 Nd7",
        "Wedge. Knight reroutes.",
      ],
      [
        4,
        "Nf1 a5",
        "The KIA hop. h4 next.",
      ],
      [
        8,
        "h4 and Ng4",
        "Storm. Bishop to f4. Queen to d2.",
      ],
    ],
    pins: [
      {
        afterPly: 2,
        label: "at the d3 house…",
      },
      {
        afterPly: 14,
        label: "at the e5 wedge…",
      },
      {
        afterPly: 18,
        label: "at the Nf1 hop…",
      },
      {
        afterPly: 22,
        label: "at the h4 storm…",
      },
      {
        afterPly: 31,
        label: "at the model middlegame…",
      },
    ],
    storyBeats: [
      {
        afterPly: 2,
        beat: "Cast: KIA house. You don't debate French trees.",
      },
      {
        afterPly: 14,
        beat: "Conflict: e5. They can have the queenside.",
      },
      {
        afterPly: 22,
        beat: "Plan: h4. The king is the only target.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "d3. System. Don't play 3.Nc3 theory.",
      },
      {
        afterPly: 2,
        text: "That's the KIA. Same house vs the French.",
      },
      {
        afterPly: 8,
        text: "Fianchetto. This bishop is the soul.",
      },
      {
        afterPly: 14,
        text: "e5. Wedge. Now the hop.",
      },
      {
        afterPly: 16,
        text: "Nf1. This knight wants g4.",
      },
      {
        afterPly: 22,
        text: "h4. Storm. Don't get distracted by …b4.",
      },
      {
        afterPly: 28,
        text: "Ng4. Look at h6 and f6.",
      },
      {
        afterPly: 31,
        text: "Book's done. Mate the short king.",
      },
    ],
    traps: [
      {
        id: "nh4-storm",
        name: "Nh2-g4",
        blurb: "The classic KIA hop. Don't meet …b4 with panic.",
        san: "e4 e6 d3 d5 Nd2 Nf6 Ngf3 c5 g3 Nc6 Bg2 Be7 O-O O-O Re1 b5 e5 Nd7 Nf1 a5 h4 b4 N1h2",
        shotPly: 22,
        coach: "N1h2. g4 is the square. h-pawn already running.",
      },
      {
        id: "qe2-e5",
        name: "Qe2 e5",
        blurb: "Queen to e2 supports e5. Same storm, extra cover.",
        san: "e4 e6 d3 d5 Nd2 Nf6 Ngf3 c5 g3 Nc6 Bg2 Be7 O-O O-O Re1 Qc7 e5 Nd7 Qe2 b5 h4",
        shotPly: 16,
        coach: "e5 then Qe2. The wedge holds. h4 next.",
      },
      {
        id: "h-file",
        name: "h4-h5",
        blurb: "If they fianchetto, h4-h5 rips g6.",
        san: "e4 e6 d3 d5 Nd2 c5 Ngf3 Nc6 g3 Nge7 Bg2 g6 O-O Bg7 Re1 O-O e5 Qc7 Qe2 Bd7 h4",
        shotPly: 20,
        coach: "h4. Their fianchetto asked for this.",
      },
    ],
    pillars: {
      pawnStructure: "e5 wedge vs …c5/…d5. You are a King's Indian reversed. Queenside pawns can fall — ignore them.",
      pieceCoordination: "Bg2, Nf1-h2-g4, Bf4, Qd2, Re1. The a1 rook often stays until the storm lands.",
      kingSafety: "Short castle. Their king is short. The race is h-pawn vs …b-pawn.",
      breaksAndStorms: "e5 is the first break. h4-h5 is the storm. f4 as a second wave.",
      tacticsBank: "N1h2-g4 hop, Qe2+e5, h4 vs a fianchetto.",
      attackingPlan: "Aggressive: h4-h5, Ng4, Qh6. Steady: sit on e5, trade the bad bishop. Creative: c3-d4 if they overextend.",
    },
    plans: {
      steady: "Hold e5. Trade a pair of minor pieces. Don't chase …b4.",
      creative: "If the h-file dies, play c3 and a d4 break. Same bishop, new file.",
      aggressive: "h5, Ng4, Qh6. Sac on h6 if they hide.",
    },
    depthNote: "21 moves. Chose the King's Indian Attack over the French Advance: one repeatable attacking system (Nf3-g3-Bg2-d3-Nbd2-e5, then Nh2/g4 and h4) instead of an Advance variation tree. Milner-Barry ideas can wait for Phase-2.",
  },
  {
    id: "caro-fantasy",
    name: "Caro-Kann Fantasy",
    shortName: "Fantasy",
    side: "white",
    family: "white",
    versus: "Caro-Kann",
    blurb: "3.f3 vs the Caro. Same f-pawn habit as Vienna / KG / Grand Prix. Keep e4 and attack.",
    story: {
      cast: "You are a King's Gambiteer vs the Caro wall.",
      conflict: "Black wants …dxe4 and a safe …e5 break.",
      plan: "Take toward the center, Bd3, Qe1-h4, and the f-file leftovers.",
    },
    modelFromPly: 28,
    bookChunks: [
      [
        4,
        "Fantasy f3",
        "f3. Keep e4. That's the point.",
      ],
      [
        4,
        "Take e4, …e5",
        "fxe4. They break e5.",
      ],
      [
        4,
        "Nf3 Be6",
        "Cover. Don't grab d4 yet.",
      ],
      [
        4,
        "c3 Bd3",
        "Triangle. Aim h7.",
      ],
      [
        4,
        "Castle Bd6",
        "King in. They copy.",
      ],
      [
        4,
        "Qe1 Qc7",
        "Queen swing. Kh1 first.",
      ],
      [
        4,
        "Nb3 a5",
        "Chip. Bishop pin next.",
      ],
      [
        4,
        "Bg5 h6",
        "Pin. They kick. You sit.",
      ],
    ],
    pins: [
      {
        afterPly: 4,
        label: "at the f3 Fantasy…",
      },
      {
        afterPly: 8,
        label: "at the e5 break…",
      },
      {
        afterPly: 16,
        label: "at the castle lock…",
      },
      {
        afterPly: 18,
        label: "at the queen swing…",
      },
      {
        afterPly: 27,
        label: "at the model middlegame…",
      },
    ],
    storyBeats: [
      {
        afterPly: 4,
        beat: "Cast: f3. You refuse to give e4 away.",
      },
      {
        afterPly: 8,
        beat: "Conflict: they want …e5. You develop around it.",
      },
      {
        afterPly: 27,
        beat: "Plan: f-file and Qh4. The Caro wall has a crack.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "f3. Not Two Knights. Same f-pawn as the rest.",
      },
      {
        afterPly: 4,
        text: "Fantasy. Keep the big center.",
      },
      {
        afterPly: 6,
        text: "Take toward the center.",
      },
      {
        afterPly: 12,
        text: "Bd3. Look at h7.",
      },
      {
        afterPly: 16,
        text: "Castle. Kh1 next. Queen swing.",
      },
      {
        afterPly: 18,
        text: "Qe1. That's the Fantasy queen.",
      },
      {
        afterPly: 27,
        text: "Book's done. Open f. Storm h.",
      },
    ],
    traps: [
      {
        id: "ng5",
        name: "Ng5 loot",
        blurb: "They take on d4 too soon. Bc4, Ng5, hit e6.",
        san: "e4 c6 d4 d5 f3 dxe4 fxe4 e5 Nf3 exd4 Bc4 Be6 Bxe6 fxe6 Ng5 Qd6 O-O",
        shotPly: 14,
        coach: "Bxe6 then Ng5. e6 is a wound.",
      },
      {
        id: "qh4",
        name: "…Qh4 tour",
        blurb: "They grab e4 and check. g3, queen tours, you develop.",
        san: "e4 c6 d4 d5 f3 e6 Nc3 Nf6 Be3 dxe4 fxe4 Nxe4 Nxe4 Qh4+ g3 Qxe4 Qe2",
        shotPly: 14,
        coach: "g3. Queen check is a tourist. Qe2 next.",
      },
      {
        id: "qb6",
        name: "…Qb6 line",
        blurb: "Early …Qb6. Nc3, develop, ignore b2.",
        san: "e4 c6 d4 d5 f3 Qb6 Nc3 e6 Be3 Nf6 Qd2 Be7 O-O-O O-O Nge2",
        shotPly: 6,
        coach: "Nc3. Don't defend b2. Develop and castle long.",
      },
    ],
    pillars: {
      pawnStructure: "e4+d4 vs a Caro …c6. After …e5 the f-file opens. Don't let …Bg4 freeze Nf3 without Qe1.",
      pieceCoordination: "Bd3, Qe1-h4, Nb1-d2-b3, Bg5. Rooks to f1 and e1.",
      kingSafety: "Kh1 before the f-file opens. Long castle is a pack idea vs …Qb6, not the spine.",
      breaksAndStorms: "f-file leftovers and h4 if they kick Bh4. d5 as a central lever.",
      tacticsBank: "Ng5 vs early …exd4, g3 vs …Qh4+, ignore …Qb6.",
      attackingPlan: "Aggressive: Qh4, Ng5, f-file. Steady: extra center, trade into a plus e-pawn. Creative: O-O-O vs a slow …Qc7.",
    },
    plans: {
      steady: "Hold e4. Trade a pair. Play against the hole on f7.",
      creative: "If they sit, g4-g5 with the queen on e2.",
      aggressive: "Qh4, Ng5, f-file. One break.",
    },
    depthNote: "21 moves. Chose Fantasy (3.f3) over Two Knights: it matches the f-pawn attacking habit of Vienna / King's Gambit / Grand Prix and fights for e4 immediately. Two Knights is the Phase-2 backup vs Caro specialists.",
  },
  {
    id: "london",
    name: "London System",
    shortName: "London",
    side: "white",
    family: "white",
    versus: "1...d5 / 1...Nf6",
    blurb: "Triangle, keep the bishop, sit on e5. You squeeze. They suffocate.",
    story: {
      cast: "You are a wall with a poison bishop on f4.",
      conflict: "Black wants …c5 and to take your London bishop.",
      plan: "Keep the bishop, park Ne5, clamp with f4. Squeeze before they start a fight.",
    },
    modelFromPly: 32,
    bookChunks: [
      [
        6,
        "London triangle",
        "d4 Bf4 e3. Same house every game.",
      ],
      [
        6,
        "Knights vs c5",
        "c3 Nf3 Nbd2. Meet …c5. Keep developing.",
      ],
      [
        4,
        "Keep the bishop",
        "Bg3. That bishop is the London.",
      ],
      [
        6,
        "Ne5 outpost",
        "Ne5. Sit. f4 clamps.",
      ],
      [
        6,
        "Castle then clamp",
        "O-O. Queen to e2. Don't donate e5.",
      ],
      [
        6,
        "Take the tension",
        "Bxe4 if they hop. Recycle Nd2.",
      ],
      [
        8,
        "Pin and trade",
        "Bh4. Trade the defender. Rooks to the files.",
      ],
    ],
    pins: [
      {
        afterPly: 8,
        label: "at the London triangle…",
      },
      {
        afterPly: 12,
        label: "at keeping the bishop…",
      },
      {
        afterPly: 16,
        label: "at the Ne5 outpost…",
      },
      {
        afterPly: 22,
        label: "at the castle clamp…",
      },
      {
        afterPly: 31,
        label: "at the model squeeze…",
      },
    ],
    storyBeats: [
      {
        afterPly: 8,
        beat: "Cast: triangle is up. Same as yesterday.",
      },
      {
        afterPly: 12,
        beat: "Conflict: they hit the bishop. You keep it.",
      },
      {
        afterPly: 16,
        beat: "Plan: Ne5. Sit. Squeeze. Don't look for a tactic yet.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "Bf4. Triangle. Don't play Jobava Nc3 here.",
      },
      {
        afterPly: 2,
        text: "That's the London bishop. Guard it.",
      },
      {
        afterPly: 4,
        text: "e3. The triangle starts here.",
      },
      {
        afterPly: 8,
        text: "c3. Same house every game.",
      },
      {
        afterPly: 12,
        text: "Bg3. Keep the bishop. That's the whole opening.",
      },
      {
        afterPly: 16,
        text: "Ne5. Sit on their throat.",
      },
      {
        afterPly: 18,
        text: "f4. Clamp. They cannot breathe.",
      },
      {
        afterPly: 22,
        text: "Castle. Then squeeze. Don't donate e5.",
      },
      {
        afterPly: 31,
        text: "Book's done. Keep the squeeze. Play the plan.",
      },
    ],
    traps: [
      {
        id: "qb6",
        name: "…Qb6 grab",
        blurb: "Black goes pawn hunting. You keep developing. Their queen looks stupid.",
        san: "d4 d5 Bf4 c5 e3 Nc6 c3 Qb6 Qb3 c4 Qc2 Nf6 Nd2 g6 Ngf3 Bf5 Qd1",
        shotPly: 8,
        coach: "Qb3. Don't grab b2. Offer the trade.",
      },
      {
        id: "bd6",
        name: "…Bd6 trade",
        blurb: "They take your London bishop. Recapture toward the center. The h-file is yours.",
        san: "d4 d5 Bf4 Nf6 e3 e6 Nf3 c5 c3 Nc6 Nbd2 Bd6 Bg3 Bxg3 hxg3 Qb6 Qc2",
        shotPly: 14,
        coach: "hxg3. Recapture toward the center. The h-file opened.",
      },
      {
        id: "h7",
        name: "Greek Gift",
        blurb: "If they castle into your bishop, take h7. Knight and queen finish it.",
        san: "d4 d5 Bf4 Nf6 e3 e6 Bd3 c5 c3 Nc6 Nf3 Bd6 Bg3 O-O Ne5 Qc7 Bxh7+ Kxh7 Qh5+ Kg8 Ng6",
        shotPly: 16,
        coach: "Bxh7+. They castled into it. Qh5 and Ng6 finish.",
      },
    ],
    pillars: {
      pawnStructure: "d4-e3-c3 triangle. f4 clamps once Ne5 is in. Don't wreck your own wall with a bored c4 unless pieces are ready.",
      pieceCoordination: "Bf4-g3, Nbd2, Nf3-e5, Bd3, Qf3-e2. Rooks to d1 and e1 after the triangle is built.",
      kingSafety: "Short castle. Their king is usually short. Bxh7+ is the pack idea if they castle into Bd3.",
      breaksAndStorms: "Ne5 is the first squeeze. f4 is the clamp. c4 or e4 only when the minors are ready.",
      tacticsBank: "…Qb6 ignore-b2, …Bd6 recapture hxg3, Greek Gift Bxh7+.",
      attackingPlan: "Aggressive: Ne5, f4, Qf3, look at h7. Steady: keep the triangle, trade the right minors, leave them the bad bishop. Creative: h-file if they took on g3.",
    },
    plans: {
      steady: "Keep the triangle. Trade the right minor pieces. Leave them with the bad bishop.",
      creative: "If they took on g3, use the h-file. Rh1-h5 is not a joke.",
      aggressive: "Park Ne5. f4 then Qf3. If they castle into Bd3, look at Bxh7+.",
    },
    depthNote: "21 moves. Classical London (2.Bf4, c3 triangle, Ne5). Jobava London is a different system — keep both. Sidelines after …Qb6 / …Bd6 live in the trap pack.",
  },
  {
    id: "jobava-london",
    name: "Jobava London",
    shortName: "Jobava",
    side: "white",
    family: "white",
    versus: "1...d5 / 1...Nf6",
    blurb: "London bishop, Jobava knight. 2.Nc3 and f3-g4-h4. Same bishop, no c3 — this one hunts the king.",
    story: {
      cast: "You are a London player who learned to throw pawns.",
      conflict: "Black wants a normal …Bf5 / …e6 Slav and a safe king.",
      plan: "f3 g4 h4, Qd2, O-O-O. Storm the bishop, then the king.",
    },
    modelFromPly: 30,
    bookChunks: [
      [
        4,
        "Jobava Nc3",
        "Nc3 then Bf4. Not c3 London.",
      ],
      [
        4,
        "f3 e6 g4",
        "Kick Bf5. That's Jobava.",
      ],
      [
        4,
        "h4 h6 h5",
        "Trap the bishop. Space.",
      ],
      [
        4,
        "e3 c5 Bd3",
        "Trade the h7 bishop.",
      ],
      [
        4,
        "Qxd3 Nc6",
        "Queen up. Knight out.",
      ],
      [
        4,
        "Nge2 Bd6",
        "Cover. They challenge.",
      ],
      [
        6,
        "Long castle",
        "O-O-O. King opposite. Storm.",
      ],
    ],
    pins: [
      {
        afterPly: 4,
        label: "at the Jobava Nc3…",
      },
      {
        afterPly: 8,
        label: "at the g4 kick…",
      },
      {
        afterPly: 12,
        label: "at the h5 trap…",
      },
      {
        afterPly: 24,
        label: "at the long castle…",
      },
      {
        afterPly: 29,
        label: "at the model middlegame…",
      },
    ],
    storyBeats: [
      {
        afterPly: 4,
        beat: "Cast: London bishop, Jobava knight. Different religion.",
      },
      {
        afterPly: 8,
        beat: "Conflict: g4. Their bishop is the patient.",
      },
      {
        afterPly: 24,
        beat: "Plan: opposite castling. You storm first.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "Nc3. Jobava. Not the quiet c3 London.",
      },
      {
        afterPly: 2,
        text: "Nc3. Jobava's knight. London keeps c3.",
      },
      {
        afterPly: 4,
        text: "Bf4. Same bishop, new partner.",
      },
      {
        afterPly: 6,
        text: "f3. g4 is coming.",
      },
      {
        afterPly: 8,
        text: "g4. Kick it. That's Jobava.",
      },
      {
        afterPly: 10,
        text: "h4. Don't let …h5 freeze you.",
      },
      {
        afterPly: 16,
        text: "Bd3. Trade their bishop. You keep the storm.",
      },
      {
        afterPly: 24,
        text: "O-O-O. Opposite. Now race.",
      },
      {
        afterPly: 29,
        text: "Book's done. g5 and the c-file.",
      },
    ],
    traps: [
      {
        id: "nb5",
        name: "Nb5 raid",
        blurb: "…e6 without …c6. Nb5 hits c7. They park Na6.",
        san: "d4 Nf6 Nc3 d5 Bf4 e6 Nb5 Na6 e3 c6 Nc3 Nc7 Nf3 Bd6 Ne5 O-O Bd3",
        shotPly: 6,
        coach: "Nb5. c7 is hanging. They waste two moves.",
      },
      {
        id: "e4-smash",
        name: "e4 smash",
        blurb: "…c5 too early. e4, open, queen to e2, long castle.",
        san: "d4 Nf6 Nc3 d5 Bf4 c5 e4 Nxe4 Nxe4 dxe4 d5 a6 Qe2 Bf5 O-O-O",
        shotPly: 6,
        coach: "e4. Open it. Queen to e2. Long castle.",
      },
      {
        id: "g4-storm",
        name: "g4 vs …a6",
        blurb: "They wait with …a6. You still throw g4-g5.",
        san: "d4 Nf6 Nc3 d5 Bf4 a6 e3 e6 g4 Bd6 Nge2 Bxf4 Nxf4 c5 h4 Nc6 g5",
        shotPly: 8,
        coach: "g4 anyway. Jobava doesn't wait for permission.",
      },
    ],
    pillars: {
      pawnStructure: "d4 plus f3-g4-h4 chain. c-pawn stays back so Nc3 is free. After …c5, take toward the center or close with d5.",
      pieceCoordination: "Bf4, Nc3, Qd3, Nge2-f4, O-O-O. Knights want b5/c5 and f4.",
      kingSafety: "Long castle is the attacking setup. Short castle is the backup if they open c too fast.",
      breaksAndStorms: "g4-g5 and h4-h5. e4 as a central smash vs …c5.",
      tacticsBank: "Nb5 vs …e6, e4 vs early …c5, g4 anyway vs …a6.",
      attackingPlan: "Aggressive: pawn storm + Nd5. Steady: take on d6, play a London squeeze with extra space. Creative: Nb5-c7 ideas even after they castle.",
    },
    plans: {
      steady: "Trade dark bishops. Sit on e5. The g-pawn is space, not a sac.",
      creative: "If they castle short, lift a rook on the h-file. If they castle long, open c.",
      aggressive: "g5, h6, Qg3. Opposite-side race. You started first.",
    },
    depthNote: "21 moves. Jobava London (2.Nc3 d5 3.Bf4 with f3-g4-h4 vs …Bf5) is a sibling of the classical London (`london`), not a replacement. Keep both on the home list.",
  },
  {
    id: "black-lion",
    name: "Black Lion",
    shortName: "Lion",
    side: "black",
    family: "black-e4",
    versus: "1.e4 Bc4 shell",
    blurb: "Philidor teeth. Hide the king, coil …e5, then the Lion yawns on the e-file.",
    story: {
      cast: "You are a lion that looks like a house cat.",
      conflict: "White wants a cheap Italian attack on f7.",
      plan: "Coil, castle, …Nf8-g6, then …e4 or a queenside yawn.",
    },
    modelFromPly: 32,
    bookChunks: [
      [
        8,
        "Lion e5 break",
        "…d6 …Nf6 …Nbd7 …e5",
      ],
      [
        4,
        "Hide then castle",
        "…Be7 …c6. Then O-O.",
      ],
      [
        4,
        "Coil the queen",
        "…Qc7 …h6 …Re8",
      ],
      [
        4,
        "Kill the jumper",
        "…Nf8. Take Nf5. Push …e4.",
      ],
      [
        4,
        "Close the center",
        "…c5. Queen tucks. …a6.",
      ],
      [
        4,
        "Lion yawn",
        "Rooks. Bishop slides to c7.",
      ],
      [
        4,
        "Reload the hops",
        "Queen to e7. …N8d7-e5.",
      ],
    ],
    pins: [
      {
        afterPly: 7,
        label: "at the e5 pin…",
      },
      {
        afterPly: 13,
        label: "at the castle lock…",
      },
      {
        afterPly: 21,
        label: "at the Nf8 coil…",
      },
      {
        afterPly: 25,
        label: "at the e4 wedge…",
      },
      {
        afterPly: 31,
        label: "at the model middlegame…",
      },
    ],
    storyBeats: [
      {
        afterPly: 7,
        beat: "Cast: the Lion is in the center.",
      },
      {
        afterPly: 13,
        beat: "King hidden. They have no cheap mate.",
      },
      {
        afterPly: 25,
        beat: "Conflict: you shove …e4 in their face.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "Lion sleeps. Then bites.",
      },
      {
        afterPly: 1,
        text: "…d6. Same house. Different teeth.",
      },
      {
        afterPly: 5,
        text: "…Nbd7. Not a Pirc. Not yet.",
      },
      {
        afterPly: 7,
        text: "…e5. The Lion is awake.",
      },
      {
        afterPly: 9,
        text: "…Be7. Cover f7. No drama.",
      },
      {
        afterPly: 11,
        text: "…c6. The Lion's spine.",
      },
      {
        afterPly: 21,
        text: "…Nf8. This hop is the Lion.",
      },
      {
        afterPly: 25,
        text: "…e4. Shove. That's the bite.",
      },
      {
        afterPly: 31,
        text: "Coil complete. Now the yawn.",
      },
    ],
    traps: [
      {
        id: "f7",
        name: "Bxf7+ greedy",
        blurb: "They sac on f7 too early. King walks, then you trap the knight.",
        san: "e4 d6 d4 Nf6 Nc3 Nbd7 Nf3 e5 Bc4 Be7 Bxf7+ Kxf7 Ng5+ Kg8 Ne6 Qe8 Nxc7",
        shotPly: 10,
        coach: "Take it. Then …Qe8. The knight on c7 is hanging out.",
      },
      {
        id: "nh4",
        name: "…Nxe4 vs Nh4",
        blurb: "Nh4 without cover. Take e4. The Lion bites the center.",
        san: "e4 d6 d4 Nf6 Nc3 Nbd7 Nf3 e5 Bc4 Be7 O-O c6 a4 O-O Re1 Qc7 h3 h6 Nh4 Nxe4",
        shotPly: 19,
        coach: "…Nxe4. Nh4 left e4. That's the tax.",
      },
      {
        id: "b5",
        name: "…b5 yawn",
        blurb: "If they sit, …b5 kicks Bc4. Queenside yawn.",
        san: "e4 d6 d4 Nf6 Nc3 Nbd7 Nf3 e5 Bc4 Be7 O-O c6 a4 O-O Re1 b5 Bb3 a6 h3 Qc7",
        shotPly: 15,
        coach: "…b5. Kick the Italian bishop. The Lion has two jaws.",
      },
    ],
    pillars: {
      pawnStructure: "Philidor …e5 / …c6. After …e4 the wedge closes the center in your favor. d-pawn can become a passer in the model.",
      pieceCoordination: "Be7, Qc7, Nf8-g6, bishop slide to c7. Knights want e5.",
      kingSafety: "Short castle after …Be7 covers f7. …h6 stops Bg5/Ng5.",
      breaksAndStorms: "…e4 is the bite. …b5 is the yawn. …c4-…Nd3 in the model.",
      tacticsBank: "Greedy Bxf7+, …Nxe4 vs Nh4, …b5 kick.",
      attackingPlan: "Aggressive: …e4 and the d-pawn. Steady: sit on e5. Creative: …b5 and the c-file.",
    },
    plans: {
      steady: "Knights on e5. Trade queens if they offer. Don't rush the d-pawn.",
      creative: "If the d-pawn dies, …b5 and a rook on the c-file.",
      aggressive: "Pass the d-pawn. Queen it. Then loot f5.",
    },
    depthNote: "21 moves. Migrated from the v1 Lion vs Bc4 / O-O / a4. Setup through …Nf8 / …e4 stays core book. 150 Attack and Austrian-style f4 are pack/Phase-2.",
  },
  {
    id: "pirc",
    name: "Pirc Defense",
    shortName: "Pirc",
    side: "black",
    family: "black-e4",
    versus: "1.e4 Classical",
    blurb: "Give them the center. Fianchetto. Then …e5 and hop knights. Same house, better teeth.",
    story: {
      cast: "You are the counterpuncher in a small house.",
      conflict: "White wants space, then a kingside smash.",
      plan: "…e5, hop …Nc5, then …f5 when the king is ready.",
    },
    modelFromPly: 32,
    bookChunks: [
      [
        8,
        "Pirc house",
        "…d6 …Nf6 …g6 …Bg7",
      ],
      [
        4,
        "Castle plus c6",
        "King in. …c6 blunts d5.",
      ],
      [
        4,
        "Lion strike e5",
        "…e5. That's the break.",
      ],
      [
        4,
        "Knight to c5",
        "Hop. Queen eyes b6.",
      ],
      [
        4,
        "Reload the hops",
        "…Nfd7-e5. Dual outposts.",
      ],
      [
        4,
        "Develop and wait",
        "…Be6. Don't rush …f5.",
      ],
      [
        4,
        "Trade the jumper",
        "Take on d3. Recycle.",
      ],
    ],
    pins: [
      {
        afterPly: 9,
        label: "at the castle lock…",
      },
      {
        afterPly: 15,
        label: "at the e5 pin…",
      },
      {
        afterPly: 21,
        label: "at the c5 hop…",
      },
      {
        afterPly: 31,
        label: "at the e5 outpost…",
      },
    ],
    storyBeats: [
      {
        afterPly: 7,
        beat: "Cast: small house. Long bishop.",
      },
      {
        afterPly: 15,
        beat: "Conflict: you take the center back.",
      },
      {
        afterPly: 31,
        beat: "Plan: hops now, …f5 later.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "Let them have the center.",
      },
      {
        afterPly: 1,
        text: "…d6. The house starts here.",
      },
      {
        afterPly: 5,
        text: "Fianchetto. This bishop is the soul.",
      },
      {
        afterPly: 9,
        text: "Castle. Then the break.",
      },
      {
        afterPly: 11,
        text: "…c6. Blunt d5.",
      },
      {
        afterPly: 15,
        text: "There it is. The Pirc strike.",
      },
      {
        afterPly: 21,
        text: "…Nc5. Hop. Eye e4 and a4.",
      },
      {
        afterPly: 31,
        text: "Outpost. Sit. …f5 is coming.",
      },
    ],
    traps: [
      {
        id: "nxe4",
        name: "…Nxe4 trick",
        blurb: "If they leave e4 loose after a4, take it. …d5 forks.",
        san: "e4 d6 d4 Nf6 Nc3 g6 Nf3 Bg7 Be2 O-O O-O c6 a4 Nxe4 Nxe4 d5 Bd3 dxe4 Bxe4",
        shotPly: 13,
        coach: "…Nxe4. Then …d5. Fork. That's the tax.",
      },
      {
        id: "150",
        name: "150 Attack",
        blurb: "Be3 Qd2 f3. You expand …c6 …b5 and don't castle into a mate.",
        san: "e4 d6 d4 Nf6 Nc3 g6 Be3 Bg7 Qd2 c6 f3 b5 Nge2 Nbd7 h4 h5 O-O-O",
        shotPly: 10,
        coach: "…c6 …b5. Don't castle into Qh6. Meet h4 with …h5.",
      },
      {
        id: "austrian",
        name: "Austrian f4",
        blurb: "4.f4. You castle, …Nc6, and meet e5 with …Nh5.",
        san: "e4 d6 d4 Nf6 Nc3 g6 f4 Bg7 Nf3 O-O Bd3 Nc6 e5 dxe5 fxe5 Nh5 Be3 Bg4",
        shotPly: 14,
        coach: "…Nh5. The f-pawn overextended. Pin next.",
      },
    ],
    pillars: {
      pawnStructure: "Hypermodern. You let e4-d4 exist, then …e5 or …c5. After …exd4 the d-file opens onto their queen.",
      pieceCoordination: "Bg7, Nbd7-c5, Nf6-d7-e5. Queen on c7/b6. Don't block the long bishop.",
      kingSafety: "Short castle is the spine. Vs 150 Attack, delay castle and throw …b5 …h5.",
      breaksAndStorms: "…e5 first. …f5 when pieces are ready. …c5 if the d-file dies.",
      tacticsBank: "…Nxe4 fork, 150 Attack …h5, Austrian …Nh5.",
      attackingPlan: "Aggressive: …f5, g-file, …Kh8. Steady: sit on e5. Creative: …c5 and the long bishop.",
    },
    plans: {
      steady: "Hold e5. Keep the long bishop. Improve …Kh8 and a rook to e8.",
      creative: "…c5 later if the d-file dies. Knights want d3 or f3 holes.",
      aggressive: "Stack the g-file. …Kh8, …Rg8, throw the f-pawn.",
    },
    depthNote: "21 moves. Migrated from the v1 Classical Pirc (Be2 / O-O). Moves 1–16 stay core book; the rest is the hop-and-…f5 model. Austrian and 150 Attack live in the trap pack, not a second spine.",
  },
  {
    id: "dragon",
    name: "Sicilian Dragon",
    shortName: "Dragon",
    side: "black",
    family: "black-e4",
    versus: "1.e4 Open Sicilian",
    blurb: "Yugoslav Dragon. …h5 Soltis. Opposite-side race. You sac on c3 if they blink.",
    story: {
      cast: "You are a dragon on the long diagonal.",
      conflict: "White wants Be3-Qd2-Bh6 and mate on h7.",
      plan: "…Rc8, …Ne5, …h5, then …Nc4 or …Rxc3.",
    },
    modelFromPly: 32,
    bookChunks: [
      [
        8,
        "Dragon house",
        "…c5 …d6 …Nf6 …g6 …Bg7",
      ],
      [
        4,
        "Yugoslav f3",
        "They castle long. You knew.",
      ],
      [
        4,
        "Bc4 Bd7",
        "Bishop out. Rook wants c8.",
      ],
      [
        4,
        "O-O-O Rc8",
        "Opposite. Race starts.",
      ],
      [
        4,
        "Ne5 h4",
        "Hop. They throw h.",
      ],
      [
        4,
        "Soltis h5",
        "…h5. Freeze g4.",
      ],
      [
        4,
        "Bg5 Rc5",
        "Rook lift. Chinese / Soltis mix.",
      ],
    ],
    pins: [
      {
        afterPly: 11,
        label: "at the Dragon house…",
      },
      {
        afterPly: 16,
        label: "at the long castle…",
      },
      {
        afterPly: 22,
        label: "at the Ne5 hop…",
      },
      {
        afterPly: 24,
        label: "at the Soltis h5…",
      },
      {
        afterPly: 31,
        label: "at the model middlegame…",
      },
    ],
    storyBeats: [
      {
        afterPly: 11,
        beat: "Cast: long bishop. That's the Dragon.",
      },
      {
        afterPly: 16,
        beat: "Conflict: opposite kings. Race.",
      },
      {
        afterPly: 24,
        beat: "Plan: …h5. Their g4 is slower now.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "Dragon. Fianchetto. Then race.",
      },
      {
        afterPly: 1,
        text: "…c5. Sicilian. That's the door.",
      },
      {
        afterPly: 9,
        text: "…g6. This bishop is the soul.",
      },
      {
        afterPly: 16,
        text: "They went long. You asked for this.",
      },
      {
        afterPly: 20,
        text: "…Rc8. The c-file is the Dragon's breath.",
      },
      {
        afterPly: 22,
        text: "…Ne5. Hop. Eye c4 and c4-sac.",
      },
      {
        afterPly: 24,
        text: "…h5. Soltis. Freeze g4.",
      },
      {
        afterPly: 31,
        text: "Book's done. Sac on c3 or hop c4.",
      },
    ],
    traps: [
      {
        id: "rxc3",
        name: "…Rxc3 sac",
        blurb: "The Dragon tax. Rook for knight, queen to a5, the king is open.",
        san: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 Bc4 Bd7 O-O-O Rc8 Bb3 Ne5 Bh6 Bxh6 Qxh6 Rxc3 bxc3 Qa5",
        shotPly: 26,
        coach: "…Rxc3. Structure wrecked. …Qa5. Race.",
      },
      {
        id: "soltis",
        name: "Soltis …h5",
        blurb: "…h5 before they play g4. The storm needs a ticket.",
        san: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 Bc4 Bd7 O-O-O Rc8 Bb3 Ne5 h4 h5",
        shotPly: 23,
        coach: "…h5. g4 costs a pawn now. That's Soltis.",
      },
      {
        id: "nc4",
        name: "…Nc4 trade",
        blurb: "Hop to c4, take the bishop, open c. Same race, less blood.",
        san: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 Bc4 Bd7 O-O-O Rc8 Bb3 Ne5 Kb1 Nc4 Bxc4 Rxc4",
        shotPly: 24,
        coach: "…Nc4. Trade the Italian bishop. c-file is yours.",
      },
    ],
    pillars: {
      pawnStructure: "Sicilian …d6/…g6. After …Rxc3 the c-pawns are wrecked — that's the point. Soltis …h5 freezes g4.",
      pieceCoordination: "Bg7, Bd7, Rc8, Ne5-c4. Queen on a5 after the sac.",
      kingSafety: "Short castle vs their long. The race is real. Don't play …h6 into Bh6 unless you mean it.",
      breaksAndStorms: "…b5, …Nc4, …Rxc3. …d5 if they delay O-O-O.",
      tacticsBank: "…Rxc3, Soltis …h5, …Nc4 trade.",
      attackingPlan: "Aggressive: sac c3, open a/b/c. Steady: …Nc4 trade and squeeze. Creative: …Qa5 and …Rfc8 without the sac.",
    },
    plans: {
      steady: "…Nc4, take the bishop, sit on the c-file. Don't sac if their king has air.",
      creative: "…a6 …b5 and a minority. Same file, slower.",
      aggressive: "…Rxc3 then …Qa5. Throw the a-pawn. Don't count.",
    },
    depthNote: "21 moves. Yugoslav Attack with Soltis …h5 is the spine — one opposite-side system. Classical 9.O-O and 9.g4 are Phase-2 trees.",
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    shortName: "Scandi",
    side: "black",
    family: "black-e4",
    versus: "1.e4",
    blurb: "…d5 day one. Qa5, Bf5, …c6. If they hop Nd5, take and open the g-file.",
    story: {
      cast: "You are a center striker who brought a queen.",
      conflict: "White wants tempos on the queen and a free d4.",
      plan: "…Bf5, …e6, …c6, castle long, then the g-file if they take on f6.",
    },
    modelFromPly: 32,
    bookChunks: [
      [
        4,
        "…d5 strike",
        "Take on d5. Queen out.",
      ],
      [
        4,
        "Qa5 plus d4",
        "Queen to a5. They take space.",
      ],
      [
        4,
        "Bf5 develop",
        "Bishop out before …e6.",
      ],
      [
        4,
        "Nd5 Qd8",
        "They hop. Queen tucks.",
      ],
      [
        4,
        "gxf6 wreck",
        "Take with the pawn. G-file.",
      ],
      [
        4,
        "Long castle",
        "…O-O-O. Opposite if they go long too.",
      ],
      [
        8,
        "Opposite kings",
        "Long castle. Then …f5 on the g-file.",
      ],
    ],
    pins: [
      {
        afterPly: 1,
        label: "at the d5 strike…",
      },
      {
        afterPly: 5,
        label: "at the Qa5 pin…",
      },
      {
        afterPly: 14,
        label: "at the gxf6 wreck…",
      },
      {
        afterPly: 18,
        label: "at the long castle…",
      },
      {
        afterPly: 31,
        label: "at the model middlegame…",
      },
    ],
    storyBeats: [
      {
        afterPly: 1,
        beat: "Cast: …d5. You don't wait.",
      },
      {
        afterPly: 14,
        beat: "Conflict: g-file. That's the aggressive Scandi.",
      },
      {
        afterPly: 18,
        beat: "Plan: long king, then the f-pawn storm.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "…d5. Don't flinch.",
      },
      {
        afterPly: 1,
        text: "There it is. Scandinavian.",
      },
      {
        afterPly: 5,
        text: "…Qa5. Pin ideas. Don't get trapped.",
      },
      {
        afterPly: 9,
        text: "…Bf5. Out before …e6.",
      },
      {
        afterPly: 14,
        text: "gxf6. Ugly. Open. That's the point.",
      },
      {
        afterPly: 18,
        text: "Long castle. You asked for a race.",
      },
      {
        afterPly: 31,
        text: "Book's done. Use the g-file.",
      },
    ],
    traps: [
      {
        id: "icelandic",
        name: "Icelandic",
        blurb: "2…Nf6 3.c4 e6. Gambit back. Develop and hit d4.",
        san: "e4 d5 exd5 Nf6 c4 e6 dxe6 Bxe6 Nf3 c5 d4 cxd4 Nxd4 Qb6 Nb5 a6 N5c3",
        shotPly: 6,
        coach: "…e6. Icelandic. Tempos for the pawn.",
      },
      {
        id: "qe5",
        name: "…Qe5+",
        blurb: "Queen check on e5. They block, you pin …Bg4, castle long.",
        san: "e4 d5 exd5 Qxd5 Nc3 Qe5+ Be2 Bg4 Nf3 Nc6 d4 O-O-O Be3 Nf6 Qd2",
        shotPly: 5,
        coach: "…Qe5+. Pin next. Long castle. Race.",
      },
      {
        id: "qa5-main",
        name: "Qa5 main",
        blurb: "The spine's sister: no Nd5. …Bg6, …Nbd7, same setup.",
        san: "e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 Bf5 Bd2 e6 Bd3 Bg6 O-O Nbd7",
        shotPly: 5,
        coach: "…Qa5. If they don't hop Nd5, this is the house.",
      },
    ],
    pillars: {
      pawnStructure: "After …gxf6 you have an open g-file and a fat center. …c6 blunts Nb5. Don't fear doubled f-pawns — they're a weapon.",
      pieceCoordination: "Bf5/g6, Nd7, Bd6, queen on c7. Rooks to d and g.",
      kingSafety: "Long castle is the aggressive main. Short castle is possible if they go long first.",
      breaksAndStorms: "…e5 or …c5 in the center. …f5-f4 with the g-file.",
      tacticsBank: "Icelandic …e6, …Qe5+ pin, Qa5 without Nd5.",
      attackingPlan: "Aggressive: g-file and …f5. Steady: …c6 and a plus structure. Creative: …Qa5-h5 swing.",
    },
    plans: {
      steady: "…c6, sit, trade a pair. The doubled pawns cover e5.",
      creative: "Queen swing …Qa5-h5. Bishop to d6. Same file, prettier.",
      aggressive: "Stack g. …f5. Throw the h-pawn back.",
    },
    depthNote: "21 moves. Aggressive main is 3…Qa5 with Nd5xf6 gxf6 and long castle — not the quiet 3…Qd8. Icelandic 2…Nf6 is a pack gambit, not a second spine.",
  },
  {
    id: "alekhine",
    name: "Alekhine Defense",
    shortName: "Alekhine",
    side: "black",
    family: "black-e4",
    versus: "1.e4 Four Pawns",
    blurb: "Provoke e5. Vs the Four Pawns, …f6 rips the center. You wanted the overextension.",
    story: {
      cast: "You are a provocateur with a knight.",
      conflict: "White wants four pawns and a steamroller.",
      plan: "…Nc6, …Bf5, …Be7, castle, then …f6. The center collapses on them.",
    },
    modelFromPly: 30,
    bookChunks: [
      [
        4,
        "Provoke e5",
        "…Nf6. Knight hops d5.",
      ],
      [
        4,
        "Four pawns",
        "c4 f4. They took the bait.",
      ],
      [
        4,
        "Take e5 Nc6",
        "Open. Develop. Hit d4.",
      ],
      [
        4,
        "Bf5 e6",
        "Bishop out. Blunt e5.",
      ],
      [
        4,
        "Be7 castle",
        "King in. Then the break.",
      ],
      [
        4,
        "…f6 rip",
        "That's the Alekhine tax.",
      ],
      [
        6,
        "Queen and pins",
        "…Qe7. Bg4. Rooks to d.",
      ],
    ],
    pins: [
      {
        afterPly: 1,
        label: "at the Nf6 poke…",
      },
      {
        afterPly: 8,
        label: "at the four pawns…",
      },
      {
        afterPly: 20,
        label: "at the castle lock…",
      },
      {
        afterPly: 22,
        label: "at the f6 rip…",
      },
      {
        afterPly: 29,
        label: "at the model middlegame…",
      },
    ],
    storyBeats: [
      {
        afterPly: 1,
        beat: "Cast: poke e4. Make them overextend.",
      },
      {
        afterPly: 8,
        beat: "Conflict: four pawns. You wanted this fight.",
      },
      {
        afterPly: 22,
        beat: "Plan: …f6. The center is a piñata.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "…Nf6. Poke. Don't play scared.",
      },
      {
        afterPly: 1,
        text: "Alekhine. They push, you hop.",
      },
      {
        afterPly: 8,
        text: "Four pawns. Perfect. That's the spine.",
      },
      {
        afterPly: 14,
        text: "…Bf5. Out before …e6.",
      },
      {
        afterPly: 20,
        text: "Castle. Then rip f6.",
      },
      {
        afterPly: 22,
        text: "…f6. The whole opening.",
      },
      {
        afterPly: 29,
        text: "Book's done. Take on e5. Use the files.",
      },
    ],
    traps: [
      {
        id: "chase",
        name: "Chase 4.c5",
        blurb: "They chase the knight to d5 again. …e6 …d6, you develop, they overextend.",
        san: "e4 Nf6 e5 Nd5 c4 Nb6 c5 Nd5 Bc4 e6 d4 d6 cxd6 cxd6 Nf3 Be7 O-O O-O",
        shotPly: 6,
        coach: "…e6. The chase gained space and lost time. Develop.",
      },
      {
        id: "bg4",
        name: "Modern …Bg4",
        blurb: "Vs 4.Nf3, pin, …e6, castle. Same idea, calmer White.",
        san: "e4 Nf6 e5 Nd5 d4 d6 Nf3 Bg4 Be2 e6 O-O Be7 c4 Nb6 Nc3 O-O Be3",
        shotPly: 7,
        coach: "…Bg4. Pin. This is the Modern if they don't play Four Pawns.",
      },
      {
        id: "f6-long",
        name: "…O-O-O f6",
        blurb: "Same Four Pawns, you castle long and rip …f6 anyway.",
        san: "e4 Nf6 e5 Nd5 d4 d6 c4 Nb6 f4 dxe5 fxe5 Bf5 Nc3 e6 Nf3 Nc6 Be2 Qd7 O-O O-O-O",
        shotPly: 19,
        coach: "Long castle. Same …f6 idea. Race.",
      },
    ],
    pillars: {
      pawnStructure: "White's e5-d4-c4-f4 mass. …f6 rips it. After trades you often get an isolated d-pawn to attack.",
      pieceCoordination: "Nb6, Nc6, Bf5, Be7. Queen on e7. Rooks to d and e/f.",
      kingSafety: "Short castle is the spine. Long castle is a pack race vs slow Four Pawns.",
      breaksAndStorms: "…f6 is the break. …c5 later if the d-file dies.",
      tacticsBank: "Chase 4.c5, Modern …Bg4, long-castle …f6.",
      attackingPlan: "Aggressive: …f6 and the e-file. Steady: sit on d4. Creative: …Bg4 and pressure d4.",
    },
    plans: {
      steady: "Take on e5, trade a pair, play vs the leftover d-pawn.",
      creative: "…c5 and Nb6-a4 ideas if they over-push c4.",
      aggressive: "…f6, open e and f, throw the h-pawn if they castle short.",
    },
    depthNote: "21 moves. Spine is the Four Pawns (the most ambitious White try) so you learn the attacking counter. 4.Nf3 Modern and 4.c5 Chase live in the pack. Exchange 4.c4 Nb6 5.exd6 is Phase-2.",
  },
  {
    id: "kings-indian",
    name: "King's Indian Defense",
    shortName: "KID",
    side: "black",
    family: "black-d4",
    versus: "1.d4 Classical",
    blurb: "Mar del Plata. Close the center, …f5-f4, then the kingside storm. You don't play for a draw.",
    story: {
      cast: "You are a King's Indian attacker with a closed center.",
      conflict: "White wants the queenside and a passed c-pawn.",
      plan: "…f5-f4, …g5, …Rf7-g7, …h5. Mate before c6 queens.",
    },
    modelFromPly: 32,
    bookChunks: [
      [
        8,
        "KID house",
        "…Nf6 …g6 …Bg7 …d6 …O-O",
      ],
      [
        4,
        "…e5 close",
        "…e5. They push d5.",
      ],
      [
        4,
        "Ne7 Nd7",
        "Reroute. f5 is coming.",
      ],
      [
        4,
        "f5 f4",
        "Storm starts. Lock the center.",
      ],
      [
        4,
        "c5 g5",
        "They chip queenside. You ignore it.",
      ],
      [
        4,
        "Ng6 Rf7",
        "Lift. g-file next.",
      ],
      [
        4,
        "h5 Bf8",
        "Air. Bishop tucks. Then …g4.",
      ],
    ],
    pins: [
      {
        afterPly: 11,
        label: "at the KID house…",
      },
      {
        afterPly: 12,
        label: "at the e5 break…",
      },
      {
        afterPly: 20,
        label: "at the f5 storm…",
      },
      {
        afterPly: 22,
        label: "at the f4 lock…",
      },
      {
        afterPly: 39,
        label: "at the model middlegame…",
      },
    ],
    storyBeats: [
      {
        afterPly: 11,
        beat: "Cast: small house. Same bishop as the Pirc.",
      },
      {
        afterPly: 22,
        beat: "Conflict: f4. The center is closed. Race.",
      },
      {
        afterPly: 39,
        beat: "Plan: …g4. Their queenside can wait.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "Let them have d4. You want the king.",
      },
      {
        afterPly: 5,
        text: "Fianchetto. This bishop is the soul.",
      },
      {
        afterPly: 12,
        text: "…e5. Close it. Then storm.",
      },
      {
        afterPly: 16,
        text: "…Ne7. This knight wants g6.",
      },
      {
        afterPly: 20,
        text: "…f5. That's the KID.",
      },
      {
        afterPly: 22,
        text: "…f4. Lock. Now the pawns run.",
      },
      {
        afterPly: 26,
        text: "…g5. Don't look at the queenside.",
      },
      {
        afterPly: 32,
        text: "Rook lift. g7 is the square.",
      },
      {
        afterPly: 39,
        text: "Book's done. …g4. Mate the short king.",
      },
    ],
    traps: [
      {
        id: "nxe4",
        name: "…Nxe4 trick",
        blurb: "If they take on e5 too soon, …Nxe4 ideas appear. Don't panic, recapture.",
        san: "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 Nxe5 dxe5 dxe5 Ng4 e6 Bxe6",
        shotPly: 12,
        coach: "…Ng4. The extra pawn is hanging. You develop.",
      },
      {
        id: "petrosian",
        name: "Petrosian …g5",
        blurb: "Bg5. Kick …h6 …g5 …Nh5. Same storm, earlier.",
        san: "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 d5 a5 Bg5 h6 Bh4 g5 Bg3 Nh5",
        shotPly: 20,
        coach: "…g5 …Nh5. The pin died. Storm anyway.",
      },
      {
        id: "bayonet",
        name: "Bayonet …Nh5",
        blurb: "b4. You hop …Nh5 and still throw …f5.",
        san: "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7 b4 Nh5 Re1 f5",
        shotPly: 18,
        coach: "…Nh5. Bayonet doesn't cancel the storm.",
      },
    ],
    pillars: {
      pawnStructure: "Closed: d5 vs …d6. You storm g/h/f. They storm a/b/c. The first one to open the king file wins.",
      pieceCoordination: "Ne7-g6, Nd7-f6, Rf7-g7, Bf8-e7. Queen often to e8-h5.",
      kingSafety: "Short castle. Your king is behind the storm — that's normal. Don't open the long diagonal for no reason.",
      breaksAndStorms: "…f5-f4 then …g5-g4. …h5 as a hook. Ignore c5-c6 until you must.",
      tacticsBank: "…Ng4 vs Nxe5, Petrosian …g5, Bayonet …Nh5.",
      attackingPlan: "Aggressive: pawn storm + …g4 sac. Steady: …f5 without f4, piece play. Creative: …c5 if they delay d5.",
    },
    plans: {
      steady: "…f5 without locking f4. Trade a pair. Play vs e4.",
      creative: "…c5 and the long bishop if they never close.",
      aggressive: "…g4, …h4, queen to h4. Don't look at b5.",
    },
    depthNote: "21 moves. Mar del Plata Classical (7.O-O Nc6 8.d5 Ne7) is the spine. Sämisch, Four Pawns, and Fianchetto vs KID are Phase-2 trees.",
  },
  {
    id: "modern-benoni",
    name: "Modern Benoni",
    shortName: "Benoni",
    side: "black",
    family: "black-d4",
    versus: "1.d4",
    blurb: "…c5, take on d5, …g6. You get a queenside majority and a long bishop. Then …b5.",
    story: {
      cast: "You are a Benoni sprinter with a passed-looking queenside.",
      conflict: "White wants e4-e5 and a kingside crush.",
      plan: "…a6 …Nbd7 …Re8 …b5. Chip e4. Run the majority.",
    },
    modelFromPly: 32,
    bookChunks: [
      [
        6,
        "…c5 Benoni",
        "…c5 d5 …e6. Take on d5.",
      ],
      [
        4,
        "…d6 g6",
        "House. Fianchetto next.",
      ],
      [
        4,
        "Bg7 castle",
        "King in. Long bishop lives.",
      ],
      [
        4,
        "h3 a6",
        "They stop …Bg4. You prep …b5.",
      ],
      [
        4,
        "Nbd7 Re8",
        "Hit e4. Rook on the file.",
      ],
      [
        4,
        "Rb8 Ne5",
        "b-file. Hop. Trade a knight.",
      ],
      [
        6,
        "…g5 Nh5",
        "Kingside chip. Knight to f4.",
      ],
    ],
    pins: [
      {
        afterPly: 3,
        label: "at the c5 Benoni…",
      },
      {
        afterPly: 11,
        label: "at the long bishop…",
      },
      {
        afterPly: 20,
        label: "at the Re8 hit…",
      },
      {
        afterPly: 24,
        label: "at the Ne5 hop…",
      },
      {
        afterPly: 31,
        label: "at the model middlegame…",
      },
    ],
    storyBeats: [
      {
        afterPly: 3,
        beat: "Cast: …c5. You unbalance on move two.",
      },
      {
        afterPly: 20,
        beat: "Conflict: e4 is the patient. Hit it.",
      },
      {
        afterPly: 31,
        beat: "Plan: …b5 and the majority. Don't fear e5.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "…c5. Unbalance. That's the Benoni.",
      },
      {
        afterPly: 3,
        text: "Take on d5. You wanted this structure.",
      },
      {
        afterPly: 11,
        text: "Fianchetto. The long bishop is the soul.",
      },
      {
        afterPly: 16,
        text: "…a6. Prep …b5. Don't rush it.",
      },
      {
        afterPly: 20,
        text: "…Re8. e4 is hanging in the air.",
      },
      {
        afterPly: 24,
        text: "…Ne5. Hop. Trade toward the majority.",
      },
      {
        afterPly: 31,
        text: "Book's done. …b5. Run the pawns.",
      },
    ],
    traps: [
      {
        id: "b5-nxe4",
        name: "…b5 Nxe4",
        blurb: "Taimanov …b5. If they take, …Nxe4 forks.",
        san: "d4 Nf6 c4 c5 d5 e6 Nc3 exd5 cxd5 d6 e4 g6 Nf3 Bg7 h3 O-O Bd3 b5 Bxb5 Nxe4",
        shotPly: 19,
        coach: "…Nxe4. Fork. That's why …b5 is legal.",
      },
      {
        id: "flick-knife",
        name: "Flick-Knife",
        blurb: "7.f4. You castle, …Re8, and hit e4 before f5 lands.",
        san: "d4 Nf6 c4 c5 d5 e6 Nc3 exd5 cxd5 d6 e4 g6 f4 Bg7 Nf3 O-O Bd3 Re8 O-O",
        shotPly: 16,
        coach: "…Re8. Hit e4. Don't let f5 be free.",
      },
      {
        id: "ne5",
        name: "…Ne5 hop",
        blurb: "Classical. …Nbd7-e5, trade, then the majority.",
        san: "d4 Nf6 c4 c5 d5 e6 Nc3 exd5 cxd5 d6 e4 g6 Nf3 Bg7 Be2 O-O O-O Re8 Nd2 Nbd7 a4 Ne5",
        shotPly: 21,
        coach: "…Ne5. Outpost. Trade. Then …b5.",
      },
    ],
    pillars: {
      pawnStructure: "Asymmetric: White extra center (d5/e4), you extra queenside (…c5 and …b5). Don't play as if it's a King's Indian.",
      pieceCoordination: "Bg7, Nbd7-e5, Re8, Rb8, queen on e7/c7. The long bishop must stay alive.",
      kingSafety: "Short castle. Their e5 push is the danger — meet it with …Re8 and pieces, not panic.",
      breaksAndStorms: "…b5 is the break. …f5 is rare. …g5-Nh5 vs a slow setup.",
      tacticsBank: "…b5 Nxe4, Flick-Knife …Re8, …Ne5 hop.",
      attackingPlan: "Aggressive: …b5 and the a/b pawns. Steady: sit on e5, trade. Creative: …g5 kingside chip.",
    },
    plans: {
      steady: "…Ne5, trade, hold …b5 as a threat.",
      creative: "…g5 Nh5 Nf4. Dual-wing chaos.",
      aggressive: "…b5-b4. Run the majority. Don't count e5.",
    },
    depthNote: "21 moves. Modern Benoni vs 7.Nf3 / 8.h3 (not the Flick-Knife as the spine). 7.f4 Flick-Knife is in the pack. Old Benoni 1…c5 2.d5 e5 is out of scope.",
  },
  {
    id: "benko",
    name: "Benko Gambit",
    shortName: "Benko",
    side: "black",
    family: "black-d4",
    versus: "1.d4",
    blurb: "…b5. One pawn for the a- and b-files. You don't want a middlegame attack so much as a permanent bind.",
    story: {
      cast: "You are a positional gambiteer.",
      conflict: "White wants to pocket b5 and castle.",
      plan: "…Bxa6, …Bg7, …Qa5, …Rfb8. Pressure a2/b2 until they crack.",
    },
    modelFromPly: 32,
    bookChunks: [
      [
        6,
        "…b5 gift",
        "…c5 d5 …b5. That's the Benko.",
      ],
      [
        4,
        "Take a6 g6",
        "…Bxa6 coming. Fianchetto.",
      ],
      [
        4,
        "Bxf1 Kf1",
        "They take. King walks. You smile.",
      ],
      [
        4,
        "…d6 Nf3",
        "Center. They cover e5.",
      ],
      [
        4,
        "Bg7 castle",
        "House. King in.",
      ],
      [
        4,
        "Qa5 Re1",
        "Queen up. Files next.",
      ],
      [
        6,
        "Rfb8 Ne8",
        "Double the b-file. Knight reroutes.",
      ],
    ],
    pins: [
      {
        afterPly: 5,
        label: "at the b5 gift…",
      },
      {
        afterPly: 12,
        label: "at the Bxf1 walk…",
      },
      {
        afterPly: 20,
        label: "at the castle lock…",
      },
      {
        afterPly: 22,
        label: "at the Qa5 pin…",
      },
      {
        afterPly: 31,
        label: "at the model middlegame…",
      },
    ],
    storyBeats: [
      {
        afterPly: 5,
        beat: "Cast: …b5. The files are worth the pawn.",
      },
      {
        afterPly: 12,
        beat: "Conflict: their king walked. You develop for free.",
      },
      {
        afterPly: 31,
        beat: "Plan: a- and b-files. Don't take the pawn back.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "…b5. Buy the files.",
      },
      {
        afterPly: 5,
        text: "There it is. The Benko.",
      },
      {
        afterPly: 12,
        text: "King walked. You got the bishop pair's ghost.",
      },
      {
        afterPly: 20,
        text: "Castle. Then the files.",
      },
      {
        afterPly: 22,
        text: "…Qa5. Pin. Pressure a2.",
      },
      {
        afterPly: 26,
        text: "…Rfb8. That's the whole opening.",
      },
      {
        afterPly: 31,
        text: "Book's done. Sit on the files.",
      },
    ],
    traps: [
      {
        id: "e3",
        name: "Declined e3",
        blurb: "They decline with e3. You still fianchetto and take on b5 later.",
        san: "d4 Nf6 c4 c5 d5 b5 cxb5 a6 e3 g6 Nc3 Bg7 a4 O-O Nf3 d6 Be2 axb5 Bxb5",
        shotPly: 8,
        coach: "…g6. Decline isn't free. Same bishop, same files.",
      },
      {
        id: "b6",
        name: "b6 wedge",
        blurb: "5.b6. Take on d5. Queen loots. You develop with tempos.",
        san: "d4 Nf6 c4 c5 d5 b5 cxb5 a6 b6 e6 Nc3 Nxd5 Nxd5 exd5 Qxd5 Nc6 Nf3 Rb8",
        shotPly: 8,
        coach: "…e6 …Nxd5. The wedge gave you the center.",
      },
      {
        id: "main-files",
        name: "Accepted files",
        blurb: "The spine's sister: same files, king already on g2.",
        san: "d4 Nf6 c4 c5 d5 b5 cxb5 a6 bxa6 Bxa6 Nc3 d6 e4 Bxf1 Kxf1 g6 Nf3 Bg7 g3 O-O Kg2",
        shotPly: 12,
        coach: "King on g2. Files still yours. …Qa5 next.",
      },
    ],
    pillars: {
      pawnStructure: "You are down a pawn, up files. White's a2/b2/c3 complex is the patient. Don't play for a mating attack unless they blunder.",
      pieceCoordination: "Bxa6 gone, Bg7, Qa5, Rfb8, Ne8-c7-b5. Knights want b5 and d3.",
      kingSafety: "Short castle. Their king often walked via f1-g2 — that's time you already cashed.",
      breaksAndStorms: "…e6 sometimes. Mostly piece pressure, not pawn storms.",
      tacticsBank: "e3 decline, b6 wedge, accepted king-walk.",
      attackingPlan: "Aggressive: …Nb5 and …c4 ideas. Steady: sit on the files, recoup a2. Creative: …e6 central break.",
    },
    plans: {
      steady: "Double on b. Sit. Recoup a2. Don't rush …e6.",
      creative: "…e6 if they over-protect the queenside.",
      aggressive: "…Nb5-c3 holes. Queen to a4. Take everything on the files.",
    },
    depthNote: "21 moves. Accepted Benko with …Bxf1 Kxf1 is the spine (the most common club try). 5.e3 and 5.b6 are pack answers, not a second system.",
  },
  {
    id: "dutch-leningrad",
    name: "Dutch Leningrad",
    shortName: "Leningrad",
    side: "black",
    family: "black-d4",
    versus: "1.d4",
    blurb: "…f5 and a King's Indian house. …Qe8, …Na6, then …e5. You attack with the f-pawn already gone.",
    story: {
      cast: "You are a Dutch attacker who fianchettoed.",
      conflict: "White wants e4 and a hole on e6.",
      plan: "…Qe8-h5, …e5, and the f-file. Don't let e4 be free.",
    },
    modelFromPly: 32,
    bookChunks: [
      [
        4,
        "…f5 Dutch",
        "…f5. That's the door.",
      ],
      [
        4,
        "Leningrad house",
        "…Nf6 …g6 …Bg7",
      ],
      [
        4,
        "Castle plus d6",
        "King in. …d6 covers e5.",
      ],
      [
        4,
        "Qe8 d5",
        "Queen swing. They close.",
      ],
      [
        4,
        "…a5 Na6",
        "Stop b4. Knight to c5.",
      ],
      [
        4,
        "…c6 take",
        "Blunt d5. Recapture toward center.",
      ],
      [
        8,
        "…e5 break",
        "Queen to b7. Then …e5.",
      ],
    ],
    pins: [
      {
        afterPly: 1,
        label: "at the f5 Dutch…",
      },
      {
        afterPly: 7,
        label: "at the Leningrad house…",
      },
      {
        afterPly: 14,
        label: "at the Qe8 swing…",
      },
      {
        afterPly: 31,
        label: "at the e5 break…",
      },
    ],
    storyBeats: [
      {
        afterPly: 1,
        beat: "Cast: …f5. You unbalance on move one.",
      },
      {
        afterPly: 14,
        beat: "Conflict: queen to e8. She wants h5.",
      },
      {
        afterPly: 31,
        beat: "Plan: …e5. The Dutch break. Then the f-file.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "…f5. Don't play a quiet KID.",
      },
      {
        afterPly: 1,
        text: "Dutch. The f-pawn is the weapon.",
      },
      {
        afterPly: 5,
        text: "Fianchetto. Leningrad, not Stonewall.",
      },
      {
        afterPly: 14,
        text: "…Qe8. That's the Leningrad queen.",
      },
      {
        afterPly: 18,
        text: "…a5. Stop b4. Knight to a6.",
      },
      {
        afterPly: 31,
        text: "…e5. The break. Book's done. Use the f-file.",
      },
    ],
    traps: [
      {
        id: "staunton",
        name: "Staunton",
        blurb: "2.e4. Take, develop, …Bf5. You wanted an open game anyway.",
        san: "d4 f5 e4 fxe4 Nc3 Nf6 Bg5 g6 h4 d5 h5 Bf5 hxg6 Bxg6 Qd2 Nbd7 O-O-O",
        shotPly: 2,
        coach: "Take on e4. Staunton isn't free. Develop and castle.",
      },
      {
        id: "bg5",
        name: "2.Bg5",
        blurb: "They pin. …g6, …Bg7, meet h4 with the long bishop.",
        san: "d4 f5 Bg5 g6 Nc3 d5 e3 Bg7 h4 c6 h5 Qb6 Rb1 Nf6 hxg6 hxg6 Rxh8 Bxh8",
        shotPly: 2,
        coach: "…g6. Leningrad vs Bg5. Don't play …h6 into the pin.",
      },
      {
        id: "ne4",
        name: "…Ne4 hop",
        blurb: "If they go slow, …Ne4 sits in the hole. Queen pressure on b3.",
        san: "d4 f5 g3 Nf6 Bg2 e6 Nh3 d5 O-O Bd6 c4 c6 Nc3 O-O Qb3 Ne4",
        shotPly: 15,
        coach: "…Ne4. Outpost. That's the slow Dutch bite.",
      },
    ],
    pillars: {
      pawnStructure: "…f5 / …g6 / …d6. After …e5 the f-file opens. e6 is a hole — cover it with pieces, not with …e6 (that's Stonewall).",
      pieceCoordination: "Bg7, Qe8-h5, Na6-c5, Bd7. Rooks to e and f.",
      kingSafety: "Short castle. The f-pawn is gone, so don't open the a2-g8 diagonal for free.",
      breaksAndStorms: "…e5 is the main break. …c6-c5 as a second. …f4 sometimes as a wedge.",
      tacticsBank: "Staunton 2.e4, 2.Bg5, …Ne4 hop.",
      attackingPlan: "Aggressive: …Qh5 and the f-file. Steady: …e5 and a plus center. Creative: …c5 Benoni mix.",
    },
    plans: {
      steady: "…e5, trade a pair, play vs e3. Don't throw f4 too early.",
      creative: "…c5 and Na6-b4. Dual wing.",
      aggressive: "…Qh5, …f4, g-file. The Leningrad mate patterns.",
    },
    depthNote: "21 moves. Leningrad (…g6) is the spine, not Stonewall or Classical …e6. Staunton and 2.Bg5 are pack answers.",
  },
  {
    id: "budapest",
    name: "Budapest Gambit",
    shortName: "Budapest",
    side: "black",
    family: "black-d4",
    versus: "1.d4 Nf6 2.c4",
    blurb: "…e5. One pawn for tempos and the Kieninger mate if they get greedy on b4.",
    story: {
      cast: "You are a d4-killer with a check on b4.",
      conflict: "White wants to pocket e5 and keep the bishop pair.",
      plan: "…Bb4+, …Qe7, recoup e5, then pressure c4 and the king file.",
    },
    modelFromPly: 30,
    bookChunks: [
      [
        4,
        "…e5 gift",
        "…e5. Budapest. That's the door.",
      ],
      [
        4,
        "Ng4 Bf4",
        "Hop. They cover e5.",
      ],
      [
        4,
        "Bb4+ Qe7",
        "Check. Pin. Recoup next.",
      ],
      [
        4,
        "Take e5",
        "Nxe5. You got the pawn back.",
      ],
      [
        4,
        "Castle d6",
        "King in. …d6 holds e5.",
      ],
      [
        4,
        "…b6 Bc5",
        "They hop Nb3. You keep the bishop.",
      ],
      [
        6,
        "…a5 files",
        "Open a. Rooks. Bf5 next.",
      ],
    ],
    pins: [
      {
        afterPly: 3,
        label: "at the e5 gift…",
      },
      {
        afterPly: 9,
        label: "at the Bb4 pin…",
      },
      {
        afterPly: 14,
        label: "at the e5 recoup…",
      },
      {
        afterPly: 18,
        label: "at the castle lock…",
      },
      {
        afterPly: 29,
        label: "at the model middlegame…",
      },
    ],
    storyBeats: [
      {
        afterPly: 3,
        beat: "Cast: …e5 vs 2.c4. You don't play a quiet Nimzo.",
      },
      {
        afterPly: 9,
        beat: "Conflict: Bb4+. The king file is already a story.",
      },
      {
        afterPly: 29,
        beat: "Plan: recouped pawn, extra development. Squeeze c4.",
      },
    ],
    coach: [
      {
        afterPly: -1,
        text: "…e5. vs 2.c4. Don't play scared.",
      },
      {
        afterPly: 3,
        text: "Budapest. One pawn. Three tempos.",
      },
      {
        afterPly: 5,
        text: "…Ng4. Recoup e5. That's the deal.",
      },
      {
        afterPly: 9,
        text: "…Bb4+. Pin the knight. Queen to e7.",
      },
      {
        afterPly: 13,
        text: "Take e5. You cashed the gambit.",
      },
      {
        afterPly: 18,
        text: "Castle. Then …d6. Nothing hanging.",
      },
      {
        afterPly: 29,
        text: "Book's done. Files and the e5 outpost.",
      },
    ],
    traps: [
      {
        id: "kieninger",
        name: "Kieninger mate",
        blurb: "They take on b4 too soon. …Nd3#. Club famous. Engine-legal.",
        san: "d4 Nf6 c4 e5 dxe5 Ng4 Bf4 Nc6 Nf3 Bb4+ Nbd2 Qe7 a3 Ngxe5 axb4 Nd3#",
        shotPly: 15,
        coach: "…Nd3#. That's why axb4 is illegal in this position.",
      },
      {
        id: "adler",
        name: "Adler 4.Nf3",
        blurb: "They don't play Bf4. …Bc5, castle, …Re8, recoup e5.",
        san: "d4 Nf6 c4 e5 dxe5 Ng4 Nf3 Bc5 e3 Nc6 Be2 O-O O-O Re8 Nc3 Ngxe5 Nxe5 Nxe5",
        shotPly: 8,
        coach: "…Bc5. Adler. Same recoup, bishop on the diagonal.",
      },
      {
        id: "kieninger-late",
        name: "Late Kieninger",
        blurb: "Same mate after Nxe5. If they take b4 now, …Nd3# still lands.",
        san: "d4 Nf6 c4 e5 dxe5 Ng4 Bf4 Nc6 Nf3 Bb4+ Nbd2 Qe7 a3 Ngxe5 Nxe5 Nxe5 axb4 Nd3#",
        shotPly: 17,
        coach: "Still …Nd3#. Don't get bored of this mate.",
      },
    ],
    pillars: {
      pawnStructure: "You recoup e5. Then …d6 / …c5. Their c4 can become a target. Don't play as if you're still down a pawn.",
      pieceCoordination: "Bb4, Qe7, Ng4-e5, Nc6. After the trade, Bf5 and rooks on a/d.",
      kingSafety: "Short castle. Kieninger is their king in the center — only if they grab b4.",
      breaksAndStorms: "…a5 opening the a-file. …f5 later. …c5 vs a slow setup.",
      tacticsBank: "Kieninger …Nd3#, Adler …Bc5, late Kieninger after Nxe5.",
      attackingPlan: "Aggressive: Kieninger patterns and …Qe4. Steady: recoup, sit on e5. Creative: …a5 and the a-file.",
    },
    plans: {
      steady: "You recouped. Sit on e5. Trade a pair. Play vs c4.",
      creative: "…a5 and Ra6-g6. Dual wing.",
      aggressive: "If they still have a king in the center, open e. The mate patterns don't expire.",
    },
    depthNote: "21 moves. Rubinstein 4.Bf4 with …Bb4+ …Qe7 is the spine (critical and practical). Adler 4.Nf3 is in the pack. Fajarowicz 3…Ne4 is Phase-2.",
  },
] as OpeningSpec[];

