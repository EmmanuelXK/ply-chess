import type { PositionalQuiz, ProfessorScript } from "./types";

export const authoredProfessor: Record<string, ProfessorScript[]> = {
  "black-lion": [
    {
      afterPly: 1,
      concept:
        "…d6 — this is the Lion house, not a Pirc yet. The pawn holds e5 and keeps the dark bishop's door closed until you're ready.",
      why: "In the Lion you want a Philidor center, not a fianchetto. …d6 lets …e5 come in one breath and stops White's e5 wedge from landing cheap.",
      plan: "Next is …Nf6 and …Nbd7. Don't rush …g6. The long bishop is not this system's soul.",
      whyLesson: {
        title: "Lion house",
        intro:
          "…d6. Same first move as a Pirc — different teeth. Watch the squares this pawn owns.",
        startPly: 2,
        branch: [
          {
            san: "d4",
            narrate: "They take the center. Fine. You asked them to.",
            arrows: [{ orig: "d2", dest: "d4", brush: "blue" }],
          },
          {
            san: "Nf6",
            narrate:
              "…Nf6. The knight should pressure e4. That's essential in this opening — you poke the head of their pawn chain before you lock the center.",
            glyph: "!",
            arrows: [
              { orig: "g8", dest: "f6", brush: "green" },
              { orig: "f6", dest: "e4", brush: "yellow" },
            ],
            circles: ["e4", "d5"],
          },
        ],
      },
    },
    {
      afterPly: 5,
      concept:
        "…Nbd7 — the other knight. This is the tell. Not …Nc6, not …g6. The Lion develops behind the e-pawn.",
      why: "…Nbd7 supports …e5 and keeps c6 free for the spine pawn. If you develop the queen's knight to c6 you lose the Lion's c6-c5 ideas.",
      plan: "Now …e5. That's the break. After that, …Be7 covers f7 so their Italian bishop looks silly.",
      whyLesson: {
        title: "Not a Pirc",
        intro:
          "…Nbd7. This hop is how you tell a Lion from a Pirc. Let me show the e5 break it prepares.",
        startPly: 6,
        branch: [
          {
            san: "Nf3",
            narrate: "They develop. Natural.",
            arrows: [{ orig: "g1", dest: "f3", brush: "blue" }],
          },
          {
            san: "e5",
            narrate:
              "…e5. The Lion is awake. This pawn should control d4 and f4, and it asks their bishop on c4 what it's doing.",
            glyph: "!",
            arrows: [
              { orig: "e7", dest: "e5", brush: "green" },
              { orig: "e5", dest: "d4", brush: "yellow" },
              { orig: "e5", dest: "f4", brush: "yellow" },
            ],
            circles: ["e5", "d4", "f4"],
          },
        ],
      },
    },
    {
      afterPly: 7,
      concept:
        "…e5 — the knight and pawns should own these central squares. It's essential in this opening.",
      why: "Without …e5 you're a passive Philidor. With it you have a stake in d4, a later …e4 wedge, and you blunt Bc4's stare at f7.",
      plan: "Cover f7 with …Be7, then …c6 — the Lion's spine — then castle. Don't hunt ghosts on the queenside yet.",
      whyLesson: {
        title: "The e5 pin",
        intro:
          "…e5. Why this square? Because the Lion's whole attack later — …e4, …Nf8-g6 — is built on this stake.",
        startPly: 8,
        branch: [
          {
            san: "Bc4",
            narrate:
              "Italian bishop. They want f7. That's the conflict. You don't panic.",
            arrows: [
              { orig: "f1", dest: "c4", brush: "red" },
              { orig: "c4", dest: "f7", brush: "red" },
            ],
            circles: ["f7"],
          },
          {
            san: "Be7",
            narrate:
              "…Be7. Cover f7. No drama. The bishop should sit here so you can castle without a cheap Bxf7+ story.",
            glyph: "!",
            arrows: [
              { orig: "f8", dest: "e7", brush: "green" },
              { orig: "e7", dest: "f6", brush: "yellow" },
            ],
            circles: ["f7"],
          },
        ],
      },
    },
    {
      afterPly: 11,
      concept:
        "…c6 — the Lion's spine. This pawn should blunt d5 and give the queen a path to c7.",
      why: "c6 is how the Lion stays compact. It stops Nb5 and Nd5 cheap shots, and it prepares the queenside yawn …b5 if they sit.",
      plan: "Castle. Then coil: …Qc7, …h6, …Re8. Queen first — not the whole list at once.",
    },
    {
      afterPly: 13,
      concept:
        "Castle. The king should leave the center now that f7 is covered. They wanted a cheap mate. Missed.",
      why: "In the Bc4 shell, every delay is an invitation to Bxf7+ or Ng5. Castling closes that chapter so you can coil.",
      plan: "Queen to c7. Then …h6 so Bg5 never pins you. Then rook to e8 — you want …e4.",
    },
    {
      afterPly: 15,
      concept:
        "…Qc7 — the queen should sit on c7. Coil square, not a raid. It eyes e5 and the c-file, and it unblocks the rook.",
      why: "If the queen stays on d8, the rook can't reach e8 without a traffic jam. c7 is the Lion's battery square for later …c7-bishop and …e4.",
      plan: "…h6 next — air, and no Bg5. Then …Re8. That's the coil. Then the hop …Nf8-g6.",
      whyLesson: {
        title: "Coil the queen",
        intro:
          "Queen to c7. Why this square? Watch the file it opens and the squares it watches. Then the rest of the coil.",
        startPly: 16,
        branch: [
          {
            san: "h3",
            narrate: "They make luft. Fine. You don't copy them yet.",
            arrows: [{ orig: "h2", dest: "h3", brush: "blue" }],
          },
          {
            san: "h6",
            narrate:
              "…h6. This pawn should keep Bg5 and Ng5 off you. Air for the king. Essential prophylaxis in the Lion.",
            glyph: "!",
            arrows: [
              { orig: "h7", dest: "h6", brush: "green" },
              { orig: "c1", dest: "g5", brush: "red" },
            ],
            circles: ["g5", "h7"],
          },
          {
            san: "Be3",
            narrate: "They develop. You finish the coil.",
            arrows: [{ orig: "c1", dest: "e3", brush: "blue" }],
          },
          {
            san: "Re8",
            narrate:
              "Rook to e8. The rook should support …e4. That's the bite you've been building since …e5.",
            glyph: "!",
            arrows: [
              { orig: "f8", dest: "e8", brush: "green" },
              { orig: "e8", dest: "e5", brush: "yellow" },
            ],
            circles: ["e4", "e5"],
          },
        ],
      },
    },
    {
      afterPly: 21,
      concept:
        "…Nf8 — this hop is the Lion. The knight should reroute to g6, covering e5 and looking at f4/h4.",
      why: "The d7 knight did its job (supporting …e5). Now it must not sit in the way of the c-pawn and the c8 rook. f8-g6 is the classic Lion maneuver.",
      plan: "If they jump Nf5, take it. Then shove …e4. That's the bite.",
      whyLesson: {
        title: "The Nf8 coil",
        intro:
          "…Nf8. Why this ugly-looking hop? Because g6 is the attacking square, and d7 is now a traffic jam.",
        startPly: 22,
        branch: [
          {
            san: "Nf5",
            narrate:
              "They plant a jumper on f5. That's their only idea. You don't have to live with it.",
            glyph: "!?",
            arrows: [
              { orig: "h4", dest: "f5", brush: "red" },
              { orig: "f5", dest: "g7", brush: "red" },
            ],
            circles: ["f5", "g7", "d6"],
          },
          {
            san: "Bxf5",
            narrate:
              "Take it. That knight was the only attacking piece. The Lion trades when the trade kills their plan.",
            glyph: "!",
            arrows: [{ orig: "e7", dest: "f5", brush: "green" }],
          },
          {
            san: "exf5",
            narrate: "They recapture. The e-file is yours now.",
            arrows: [{ orig: "e4", dest: "f5", brush: "blue" }],
          },
          {
            san: "e4",
            narrate:
              "…e4. Shove. That's the bite. The pawn should wedge their pieces and free e5 for a knight.",
            glyph: "!!",
            arrows: [
              { orig: "e5", dest: "e4", brush: "green" },
              { orig: "e4", dest: "d3", brush: "yellow" },
              { orig: "e4", dest: "f3", brush: "yellow" },
            ],
            circles: ["e4", "d3", "f3"],
          },
        ],
      },
    },
    {
      afterPly: 25,
      concept:
        "…e4 — the wedge. This pawn should cramp their pieces and hand you e5 as an outpost.",
      why: "The Lion isn't a slow squeeze like the London. Once Nf5 is gone, …e4 is how you take the center on your terms.",
      plan: "Close with …c5 if they push d5. Queen tucks. Then the yawn: rooks, bishop to c7, knights back to e5.",
    },
  ],
  london: [
    {
      afterPly: 0,
      concept:
        "d4 — you own the dark squares. This pawn should be a rock, not a battering ram.",
      why: "The London is a system, not a one-move attack. d4 plus Bf4 plus e3 is the triangle that lets you play the same house against almost anything.",
      plan: "Bf4 next. Don't play Nc3 here — that's Jobava, a different hunt.",
    },
    {
      afterPly: 2,
      concept:
        "Bf4 — this bishop should breathe on the h2-b8 diagonal. It's the soul of the London.",
      why: "If you lose this bishop cheaply, you have a boring Queen's Pawn Game. Keep it. Recapture toward the center if they take.",
      plan: "e3, Nf3, c3. Triangle. Meet …c5 by guarding d4, not by panicking.",
      whyLesson: {
        title: "London bishop",
        intro:
          "Bf4. Why this diagonal? Because Ne5 later sits in front of it, and h7 is a long-term target.",
        startPly: 3,
        branch: [
          {
            san: "Nf6",
            narrate: "Natural development. You don't rush.",
            arrows: [{ orig: "g8", dest: "f6", brush: "blue" }],
          },
          {
            san: "e3",
            narrate:
              "e3. Triangle locked. This pawn should support d4 and free the light-squared bishop.",
            glyph: "!",
            arrows: [
              { orig: "e2", dest: "e3", brush: "green" },
              { orig: "e3", dest: "d4", brush: "yellow" },
            ],
            circles: ["d4", "f4"],
          },
        ],
      },
    },
    {
      afterPly: 8,
      concept:
        "c3 — d4 is a rock. This pawn should overprotect the center so the knights can hop.",
      why: "c3 is how you refuse Jobava. It blunts …Nb4 and …Bb4, and it lets you recapture on d4 with a pawn.",
      plan: "Both knights, then Bg3 if they hit Bd6. Keep the bishop.",
    },
    {
      afterPly: 12,
      concept:
        "Bg3 — they wanted the London bishop. You said no. It should sit on g3, still biting.",
      why: "…Bd6 is the amateur's attempt to kill your opening. Retreating to g3 keeps the diagonal and dares them to wreck their own kingside with …Bxg3 hxg3.",
      plan: "Ne5. Sit on their throat. Then f4 clamps.",
    },
    {
      afterPly: 16,
      concept:
        "Ne5 — the knight should sit here. Control f7, d7, c6, g6. Don't hop off.",
      why: "Ne5 is the London's attacking outpost. It frees f4, eyes h7 with the bishop battery, and makes …c5 less comfortable.",
      plan: "f4 next — space, that's the squeeze. Queen lifts. Castle. Don't donate the outpost.",
      whyLesson: {
        title: "Ne5 outpost",
        intro:
          "Ne5. Why this square? Watch the squares the knight should control. Then the f4 clamp.",
        startPly: 17,
        branch: [
          {
            san: "Bb7",
            narrate: "They fianchetto. Slow. You squeeze.",
            arrows: [{ orig: "c8", dest: "b7", brush: "blue" }],
          },
          {
            san: "f4",
            narrate:
              "f4. This pawn should clamp e5 and start a kingside storm. Space. That's the squeeze.",
            glyph: "!",
            arrows: [
              { orig: "f2", dest: "f4", brush: "green" },
              { orig: "f4", dest: "e5", brush: "yellow" },
            ],
            circles: ["e5", "f4"],
          },
          {
            san: "Ne7",
            narrate: "They reshuffle. The outpost stays.",
            arrows: [{ orig: "c6", dest: "e7", brush: "blue" }],
          },
          {
            san: "Qf3",
            narrate:
              "Queen lifts. She should look at h5 and f5. The battery is the next attacking plan.",
            glyph: "!",
            arrows: [
              { orig: "d1", dest: "f3", brush: "green" },
              { orig: "f3", dest: "h5", brush: "yellow" },
            ],
            circles: ["h5", "h7"],
          },
        ],
      },
    },
    {
      afterPly: 22,
      concept:
        "Castle. King tucked. Now you squeeze — you don't look for a one-move mate unless they castle into Bd3.",
      why: "The London wins by suffocation. Castling is how you tell yourself the setup is done and the plan starts.",
      plan: "Hold e5. Reload Ndf3. If they hop …Ne4, take on your terms. Then chip c4 or park a knight on c5.",
    },
  ],
};

export const authoredQuizzes: Record<string, PositionalQuiz[]> = {
  "black-lion": [
    {
      id: "lion-e5",
      fromPly: 0,
      toPly: 7,
      prompt:
        "You're building the Lion. What is …e5 actually for — the concept, not the move name?",
      choices: [
        {
          id: "a",
          text: "To trade pawns fast and open the queen's file.",
          correct: false,
          reaction:
            "No. This is not a Scandinavian. …e5 is a stake, not a trade offer.",
        },
        {
          id: "b",
          text: "To own d4 and f4, blunt Bc4, and prepare the later …e4 wedge.",
          correct: true,
          reaction:
            "Yes. …e5 — the pawn should control those squares. It's essential in this opening. The bite later is …e4.",
        },
        {
          id: "c",
          text: "To castle queenside and launch a pawn storm.",
          correct: false,
          reaction:
            "No. The Lion hides the king short behind …Be7. Opposite-side races are a different movie.",
        },
      ],
    },
    {
      id: "lion-coil",
      fromPly: 14,
      toPly: 19,
      prompt: "The queen goes to c7. What's the positional job of that square?",
      choices: [
        {
          id: "a",
          text: "Grab b2 and force them to defend the rook.",
          correct: false,
          reaction:
            "No. c7 is a coil square, not a raid. Pawn-hunting is how amateurs ruin the Lion.",
        },
        {
          id: "b",
          text: "Prepare queenside castling and a minority attack.",
          correct: false,
          reaction:
            "No. You already castled short. The queen on c7 is for the e-file and the c-file, not O-O-O.",
        },
        {
          id: "c",
          text: "Clear the rook's path to e8, watch e5, and build the …e4 bite.",
          correct: true,
          reaction:
            "Yes. Queen first, then …h6, then …Re8. Don't dump the whole sequence as one idea — each square has a job.",
        },
      ],
    },
    {
      id: "lion-nf8",
      fromPly: 20,
      toPly: 25,
      prompt: "Why does the knight hop …Nf8 instead of staying on d7?",
      choices: [
        {
          id: "a",
          text: "d7 is a traffic jam. f8-g6 reroutes onto e5, f4, and h4.",
          correct: true,
          reaction:
            "Yes. This hop is the Lion. The knight should control those attacking squares, then you take Nf5 and shove …e4.",
        },
        {
          id: "b",
          text: "You're running from a pin and heading back to b8.",
          correct: false,
          reaction:
            "No. This is not a retreat to the first rank to stay. It's a transfer to g6.",
        },
        {
          id: "c",
          text: "You want to trade both knights as fast as possible.",
          correct: false,
          reaction:
            "No. You trade the jumper on f5 because that piece is their plan. Your knights want e5.",
        },
      ],
    },
  ],
  london: [
    {
      id: "london-triangle",
      fromPly: 0,
      toPly: 8,
      prompt: "What's the job of the London triangle (d4-Bf4-e3 / c3)?",
      choices: [
        {
          id: "a",
          text: "A waiting setup so you can transpose into a Queen's Gambit.",
          correct: false,
          reaction:
            "No. If you wanted a Queen's Gambit you'd have played c4. The triangle is the house.",
        },
        {
          id: "b",
          text: "Overprotect d4, keep the dark-squared bishop, and play the same house every game.",
          correct: true,
          reaction:
            "Yes. Triangle first. Don't rush. Don't play Nc3 — that's Jobava, a different hunt.",
        },
        {
          id: "c",
          text: "Sacrifice the c-pawn to open the c-file immediately.",
          correct: false,
          reaction:
            "No. You are not playing a Smith-Morra. The London keeps the wall and squeezes.",
        },
      ],
    },
    {
      id: "london-ne5",
      fromPly: 16,
      toPly: 22,
      prompt: "Ne5 is in. What should that knight actually control — and why keep it?",
      choices: [
        {
          id: "a",
          text: "It's a cheap fork trick. Hop off as soon as they kick it.",
          correct: false,
          reaction:
            "No. If you hop off, you donated the opening. Sit. f4 clamps behind it.",
        },
        {
          id: "b",
          text: "It should sit on e5, eye f7/d7/c6/g6, free f4, and make …c5 uncomfortable.",
          correct: true,
          reaction:
            "Yes. Ne5 — the knight should control those squares. It's essential in this opening. Then f4, then the queen lift.",
        },
        {
          id: "c",
          text: "It's there to trade for their light-squared bishop.",
          correct: false,
          reaction:
            "No. You already kept your London bishop. This knight is an outpost, not a swap-meet.",
        },
      ],
    },
  ],
};
