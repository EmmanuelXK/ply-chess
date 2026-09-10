import { playLine } from "@/lib/chess/line";
import type { HistoryMilestone, Opening } from "./types";

export const HISTORY_OPENER =
  "This is where history kissed the board.";

/** Verified milestones. Every row cites a real URL. No folklore. */
export const HISTORY_PACK: HistoryMilestone[] = [
  // --- King's Gambit ---
  {
    id: "kg-lucena-lopez",
    openingId: "kings-gambit",
    plyOrFen: 3,
    title: "The old king's pawn",
    year: 1561,
    era: "Romantic",
    glyph: "debut",
    summary:
      "The King's Gambit is among the oldest recorded openings. A line appears in a work credited to Luis Ramírez de Lucena, and the Spanish priest Ruy López de Segura was the first to publish analysis of it. Romantic players loved it because White does not merely gambit a pawn — he opens the files that usually hide his own king.",
    whyItMattersHere:
      "2.f4 is the same offer they wrote down in the 16th century. You are not inventing courage. You are joining a very old argument about initiative.",
    sources: [
      { label: "Wikipedia: King's Gambit", url: "https://en.wikipedia.org/wiki/King%27s_Gambit" },
    ],
  },
  {
    id: "kg-immortal",
    openingId: "kings-gambit",
    plyOrFen: 3,
    title: "The Immortal Game",
    year: 1851,
    era: "Romantic",
    glyph: "immortal",
    summary:
      "Adolf Anderssen beat Lionel Kieseritzky in a casual game during the London 1851 tournament, sacrificing both rooks and the queen to mate with minor pieces. Kieseritzky telegraphed the score to Paris; Ernst Falkbeer later named it the Immortal Game. It was a King's Gambit — specifically a Bishop's Gambit (3.Bc4), not this Kieseritzky knight line.",
    whyItMattersHere:
      "Your spine is the Kieseritzky Gambit with 5.Ne5. The Immortal used 3.Bc4. Same contract: give the f-pawn, hunt the king. Do not pretend the games are identical.",
    famousGame: {
      white: "Adolf Anderssen",
      black: "Lionel Kieseritzky",
      year: 1851,
      eco: "C33",
      result: "1-0",
    },
    sources: [
      { label: "Wikipedia: Immortal Game", url: "https://en.wikipedia.org/wiki/Immortal_Game" },
      { label: "Wikipedia: King's Gambit", url: "https://en.wikipedia.org/wiki/King%27s_Gambit" },
      { label: "Chess.com: The Immortal Game", url: "https://www.chess.com/article/view/the-immortal-game" },
    ],
  },
  {
    id: "kg-kieseritzky",
    openingId: "kings-gambit",
    plyOrFen: 9,
    title: "Kieseritzky's knight",
    year: 1840,
    era: "Romantic",
    glyph: "paper",
    summary:
      "After 3.Nf3 g5 4.h4 g4, 5.Ne5 is the Kieseritzky Gambit, popularized by Lionel Kieseritzky in the 1840s and later used by Steinitz. Modern writers such as Shaw and Gallagher still treat it as the main try after 3…g5. Spassky beat Fischer with it at Mar del Plata in 1960.",
    whyItMattersHere:
      "Ne5 is not a random outpost. It is the old main line: hit f7, restrain the g-pawn, and keep the king-hunt legal.",
    famousGame: {
      white: "Boris Spassky",
      black: "Bobby Fischer",
      year: 1960,
      eco: "C39",
      result: "1-0",
    },
    sources: [
      { label: "Wikipedia: King's Gambit", url: "https://en.wikipedia.org/wiki/King%27s_Gambit" },
    ],
  },

  // --- Evans Gambit ---
  {
    id: "evans-captain",
    openingId: "evans-gambit",
    plyOrFen: 7,
    title: "A sea captain's pawn",
    year: 1827,
    era: "Romantic",
    glyph: "debut",
    summary:
      "Welsh captain William Davies Evans is the first player known to have played 4.b4. Wikipedia treats Evans–McDonnell, London 1827, as the first game, though that encounter delayed b4 by a move (4.O-O d6 5.b4). William Lewis published the first analysis in 1832. McDonnell and Labourdonnais then tested it heavily in their 1834 matches.",
    whyItMattersHere:
      "b4 asks their bishop to leave c5 so you can hit the centre with c3 and d4. That is still the whole job of this repertoire move.",
    famousGame: {
      white: "William Davies Evans",
      black: "Alexander McDonnell",
      year: 1827,
      eco: "C51",
    },
    sources: [
      { label: "Wikipedia: Evans Gambit", url: "https://en.wikipedia.org/wiki/Evans_Gambit" },
      { label: "Wikipedia: William Davies Evans", url: "https://en.wikipedia.org/wiki/William_Davies_Evans" },
      { label: "Chess.com: The Evans Gambit, a history", url: "https://www.chess.com/article/view/the-evans-gambit-a-history" },
    ],
  },
  {
    id: "evans-evergreen",
    openingId: "evans-gambit",
    plyOrFen: 7,
    title: "The Evergreen Game",
    year: 1852,
    era: "Romantic",
    glyph: "evergreen",
    summary:
      "Adolf Anderssen's win over Jean Dufresne is the Evergreen Game, an Evans Gambit (ECO C52). Dufresne chose 7…d3, a sideline that has never been popular. The brilliancy is famous; later analysis (Lipke, and then Murey/Fridshtein, Zaitsev, Kasparov) found drawing resources for Black. History can be beautiful and still not engine-perfect.",
    whyItMattersHere:
      "You are drilling the Normal Position path, not Dufresne's 7…d3. The pawn offer is the same. The mating net is a museum, not a forced line.",
    famousGame: {
      white: "Adolf Anderssen",
      black: "Jean Dufresne",
      year: 1852,
      eco: "C52",
      result: "1-0",
    },
    sources: [
      { label: "Wikipedia: Evergreen Game", url: "https://en.wikipedia.org/wiki/Evergreen_Game" },
      { label: "Wikipedia: Evans Gambit", url: "https://en.wikipedia.org/wiki/Evans_Gambit" },
    ],
  },
  {
    id: "evans-kasparov",
    openingId: "evans-gambit",
    plyOrFen: 7,
    title: "Kasparov's revival",
    year: 1995,
    era: "Modern",
    glyph: "revival",
    summary:
      "Lasker's idea of giving the pawn back under good circumstances put the Evans out of fashion for much of the 20th century. In the 1990s Garry Kasparov used it again, including a famous 25-move win over Viswanathan Anand at Riga 1995. That game went 5…Be7, not this spine's 5…Ba5.",
    whyItMattersHere:
      "The revival proves 4.b4 still bites at the top. Your book is the older Ba5 / Normal Position road. Do not mix Anand's move order into this drill.",
    famousGame: {
      white: "Garry Kasparov",
      black: "Viswanathan Anand",
      year: 1995,
      eco: "C51",
      result: "1-0",
    },
    sources: [
      { label: "Wikipedia: Evans Gambit", url: "https://en.wikipedia.org/wiki/Evans_Gambit" },
      { label: "Chess.com: The Evans Gambit, a history", url: "https://www.chess.com/article/view/the-evans-gambit-a-history" },
    ],
  },

  // --- Scotch Gambit ---
  {
    id: "scotch-edinburgh",
    openingId: "scotch-gambit",
    plyOrFen: 5,
    title: "Edinburgh writes to London",
    year: 1824,
    era: "Romantic",
    glyph: "debut",
    summary:
      "The Scotch Game takes its name from the 1824 correspondence match between Edinburgh and London. Ercole del Rio had already mentioned the opening in 1750. Strangely, London used the Scotch Gambit first in that match; Edinburgh liked it enough to adopt it. The opening kept the Scottish name because Edinburgh won the match.",
    whyItMattersHere:
      "3.d4 is the letter they posted by coach. You open the centre at once and refuse to play a slow Italian.",
    sources: [
      { label: "Wikipedia: Scotch Game", url: "https://en.wikipedia.org/wiki/Scotch_Game" },
    ],
  },
  {
    id: "scotch-gambit-bishop",
    openingId: "scotch-gambit",
    plyOrFen: 7,
    title: "Leave the pawn, take f7",
    year: 1824,
    era: "Romantic",
    glyph: "paper",
    summary:
      "4.Bc4 is the Scotch Gambit: bishop on the a2–g8 diagonal instead of recapturing on d4. Wikipedia notes it can transpose toward the Max Lange Attack after 4…Bc5 5.O-O Nf6 6.e5. Your spine goes 4…Nf6 5.e5 d5 6.Bb5 — the Dubov-style wedge, not the Max Lange move order.",
    whyItMattersHere:
      "Do not snatch d4 yet. The bishop's job is f7 and the e5 push. That is why this book hangs the pawn.",
    sources: [
      { label: "Wikipedia: Scotch Game", url: "https://en.wikipedia.org/wiki/Scotch_Game" },
    ],
  },

  // --- Italian / Max Lange / Fried Liver ---
  {
    id: "italian-max-lange",
    openingId: "italian-attack",
    plyOrFen: 7,
    title: "Max Lange's smash",
    year: 1854,
    era: "Romantic",
    glyph: "paper",
    summary:
      "The Italian Game is the old Giuoco Piano bishop to c4. Your attacking spine is the Max Lange: 4.d4 exd4 5.O-O, aiming for e5 against the Two Knights. It is named for the 19th-century German master Max Lange. The quiet Giuoco Pianissimo with c3 and d3 is a different movie, and this book does not play it.",
    whyItMattersHere:
      "d4 is the door. After it, e5 and Re1 are how the Italian becomes a hunt rather than a handshake.",
    sources: [
      { label: "Wikipedia: Italian Game", url: "https://en.wikipedia.org/wiki/Italian_Game" },
      { label: "Wikipedia: Max Lange Attack", url: "https://en.wikipedia.org/wiki/Max_Lange_Attack" },
    ],
  },
  {
    id: "italian-fried-liver",
    openingId: "italian-attack",
    plyOrFen: 11,
    title: "Fegatello — the fried liver",
    year: 1610,
    era: "Romantic",
    glyph: "paper",
    trapId: "fried-liver",
    summary:
      "The Fried Liver Attack (Italian: Fegatello) is 1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5 Nxd5 6.Nxf7. It lives in the Two Knights, analysed since Polerio and Greco. It is a trap off this Italian spine, not the Max Lange main line.",
    whyItMattersHere:
      "When they allow Nxd5, the knight landing on f7 is the whole shot. Do not play it unless the trap pack has that position on the board.",
    sources: [
      { label: "Wikipedia: Fried Liver Attack", url: "https://en.wikipedia.org/wiki/Fried_Liver_Attack" },
      { label: "Wikipedia: Two Knights Defense", url: "https://en.wikipedia.org/wiki/Two_Knights_Defense" },
    ],
  },

  // --- Vienna ---
  {
    id: "vienna-gambit",
    openingId: "vienna-gambit",
    plyOrFen: 5,
    title: "Vienna plays the f-pawn",
    year: 1850,
    era: "Romantic",
    glyph: "paper",
    summary:
      "The Vienna Game (2.Nc3) is named for the city. 3.f4 is the Vienna Gambit — the same idea as the King's Gambit with a knight already on c3. Wikipedia traditionally applies the name to 2…Nc6 3.f4; club players also use it for 2…Nf6 3.f4, which is your spine (the Falkbeer move order). Carl Hamppe's 19th-century Vienna practice is why the line still carries the city's name.",
    whyItMattersHere:
      "f4 after Nc3 means you are not copying 2.f4 blindly. The knight already covers e4 and d5. That is why 3…d5 is their honest answer, and why this book meets it.",
    sources: [
      { label: "Wikipedia: Vienna Game", url: "https://en.wikipedia.org/wiki/Vienna_Game" },
    ],
  },

  // --- Grand Prix ---
  {
    id: "gpa-mcdonnell",
    openingId: "grand-prix",
    plyOrFen: 5,
    title: "McDonnell's f-pawn, later a Grand Prix",
    year: 1834,
    era: "Romantic",
    glyph: "debut",
    summary:
      "2.f4 against the Sicilian is the Grand Prix Attack, also called the McDonnell Attack after the 14th match game of McDonnell–Labourdonnais, London 1834 (Black won). Immediate 2.f4 has declined because of the Tal Gambit 2…d5. Wikipedia says players now usually enter by 2.Nc3 first, then 3.f4 — which is this spine. The modern main line runs 2.Nc3 Nc6 3.f4 g6 4.Nf3 Bg7, then 5.Bb5 or the more aggressive 5.Bc4 you drill.",
    whyItMattersHere:
      "You delay f4 by one knight move so …d5 does not embarrass you. Then Bc4 and the f-file are the same old hunt.",
    famousGame: {
      white: "Alexander McDonnell",
      black: "Louis-Charles Mahé de La Bourdonnais",
      year: 1834,
      eco: "B21",
      result: "0-1",
    },
    sources: [
      { label: "Wikipedia: Sicilian Defence — Grand Prix Attack", url: "https://en.wikipedia.org/wiki/Sicilian_Defence#Grand_Prix_Attack" },
    ],
  },

  // --- Smith-Morra ---
  {
    id: "morra-names",
    openingId: "smith-morra",
    plyOrFen: 5,
    title: "Morra's pawn, Smith's club",
    year: 1950,
    era: "Club-origin",
    glyph: "debut",
    summary:
      "The Smith–Morra is 1.e4 c5 2.d4 cxd4 3.c3. Wikipedia names it for Pierre Morra of France (1900–1969) and Ken Smith of the Dallas Chess Club (1930–1999). Europe often says simply Morra Gambit. Older labels (Tartakower, Matulović) have fallen away. There is no single 'first game' in the article — the naming is 20th-century club practice.",
    whyItMattersHere:
      "c3 is the offer: a pawn for Nxc3, Bc4, and the open c- and d-files. Development speed is the entire compensation.",
    sources: [
      { label: "Wikipedia: Smith–Morra Gambit", url: "https://en.wikipedia.org/wiki/Smith%E2%80%93Morra_Gambit" },
    ],
  },

  // --- French KIA ---
  {
    id: "kia-fischer",
    openingId: "french-kia",
    plyOrFen: 3,
    title: "Fischer's other king's Indian",
    year: 1967,
    era: "Modern",
    glyph: "paper",
    summary:
      "The King's Indian Attack is a setup (Nf3, g3, Bg2, d3, Nbd2, e5) rather than a single move-order. Bobby Fischer used it as a main weapon, including a famous win over Lhamsuren Myagmarsuren at the Sousse Interzonal, 1967. This book chooses the KIA against the French (1.e4 e6 2.d3) instead of the French Advance.",
    whyItMattersHere:
      "2.d3 says you will not debate the French centre on their terms. You build the king's Indian with colours reversed and then storm with e5, Nh2, and the h-pawn.",
    famousGame: {
      white: "Bobby Fischer",
      black: "Lhamsuren Myagmarsuren",
      year: 1967,
      eco: "A08",
      result: "1-0",
    },
    sources: [
      { label: "Wikipedia: King's Indian Attack", url: "https://en.wikipedia.org/wiki/King%27s_Indian_Attack" },
    ],
  },

  // --- Caro Fantasy ---
  {
    id: "caro-name",
    openingId: "caro-fantasy",
    plyOrFen: 2,
    title: "Caro and Kann's defence",
    year: 1886,
    era: "Classical",
    glyph: "debut",
    summary:
      "The Caro–Kann (1.e4 c6) is named for Horatio Caro and Marcus Kann, who analysed it in 1886. It is Black's solid bid to challenge e4 without blocking the light-squared bishop the way the French does. This repertoire does not play the Classical 3.Nc3 or the Advance; it plays the Fantasy.",
    whyItMattersHere:
      "…c6 is their house. Your answer will be 3.f3, not a long theory tree. First understand whose defence you are kicking.",
    sources: [
      { label: "Wikipedia: Caro–Kann Defence", url: "https://en.wikipedia.org/wiki/Caro%E2%80%93Kann_Defence" },
    ],
  },
  {
    id: "caro-fantasy",
    openingId: "caro-fantasy",
    plyOrFen: 5,
    title: "The Fantasy 3.f3",
    year: 1886,
    era: "Romantic",
    glyph: "paper",
    summary:
      "3.f3 is the Fantasy Variation of the Caro–Kann (also called the Maróczy Variation in some older sources). White supports e4 with a pawn and accepts an open f-file if Black takes. It is a minority try compared with 3.Nc3 and 3.e5, which is why this attacking repertoire picked it: the same f-pawn habit as Vienna, King's Gambit, and Grand Prix.",
    whyItMattersHere:
      "f3 is not a beginner's inaccuracy here. It is the system's tell: keep e4, open a file, and refuse to play a slow Caro squeeze.",
    sources: [
      { label: "Wikipedia: Caro–Kann Defence", url: "https://en.wikipedia.org/wiki/Caro%E2%80%93Kann_Defence" },
    ],
  },

  // --- London ---
  {
    id: "london-mason",
    openingId: "london",
    plyOrFen: 3,
    title: "Mason's quiet bishop",
    year: 1882,
    era: "Classical",
    glyph: "debut",
    summary:
      "Irish-American master James Mason was the first player to employ this Bf4 setup regularly at master level, including Vienna 1882. Wikipedia is careful: the opening did not catch on then. Mason sometimes even used Nc3 instead of the later c3 triangle — so the Jobava idea has 19th-century shadows, but it was not yet a named system.",
    whyItMattersHere:
      "2.Bf4 is Mason's bishop. This spine then builds the c3–d4–e3 triangle. Keep Nc3 off this board; that is the other London.",
    sources: [
      { label: "Wikipedia: London System", url: "https://en.wikipedia.org/wiki/London_System" },
    ],
  },
  {
    id: "london-1922",
    openingId: "london",
    plyOrFen: 9,
    title: "Named for London 1922",
    year: 1922,
    era: "Classical",
    glyph: "paper",
    summary:
      "The name London System comes from the opening's reappearance on seven occasions at the very strong London tournament of 1922, including games by Capablanca, Alekhine, and Rubinstein. After that it stayed rare in master play for decades, then became a club and elite staple in the 21st century.",
    whyItMattersHere:
      "c3 completes the triangle they used in 1922. You are playing the named house: d4, Bf4, e3, c3, Nbd2 — not a Jobava storm.",
    sources: [
      { label: "Wikipedia: London System", url: "https://en.wikipedia.org/wiki/London_System" },
    ],
  },

  // --- Jobava London ---
  {
    id: "jobava-rapport",
    openingId: "jobava-london",
    plyOrFen: 5,
    title: "Rapport–Jobava, with older ghosts",
    year: 2010,
    era: "Modern",
    glyph: "revival",
    summary:
      "Wikipedia calls this the Rapport–Jobava System: Bf4 plus Nc3 instead of the London's Nbd2 and c3. It is a 21st-century attacking fashion named for Richárd Rapport and Baadur Jobava. James Mason had already mixed Nc3 into Bf4 setups in the 1880s, so do not claim they invented the piece placement — they named and popularized the modern identity.",
    whyItMattersHere:
      "Nc3 is the tell. You are threatening ideas against c7 and a later e4, not building Mason's quiet triangle. Keep this distinct from classical London.",
    sources: [
      { label: "Wikipedia: London System (Jobava London)", url: "https://en.wikipedia.org/wiki/London_System" },
    ],
  },

  // --- Black Lion ---
  {
    id: "lion-jansen-1967",
    openingId: "black-lion",
    plyOrFen: 6,
    title: "14 January 1967, Dordrecht",
    year: 1967,
    era: "Club-origin",
    glyph: "debut",
    summary:
      "There is no Wikipedia article for the Black Lion. Club sources in Dordrecht and Sliedrecht record the stamp game: on 14 January 1967 Leo Jansen, playing for Schaakclub Dordrecht, drew correspondence grandmaster ir. Anton den Ouden (Dordrecht vs Charlois). The line was first called the Jansen-systeem; the later name De Leeuw nods to Leo. Treat this as local primary history, not an encyclopedia page.",
    whyItMattersHere:
      "3…Nbd7 is the Lion's first claw: Philidor's Hanham shape without yet committing …e5. This is the move-order Jansen built a life on.",
    famousGame: {
      white: "Anton den Ouden",
      black: "Leo Jansen",
      year: 1967,
      result: "½-½",
    },
    sources: [
      { label: "Schaakvereniging Sliedrecht: De Leeuw 50 jaar", url: "https://www.schakendsliedrecht.nl/2017/01/07/schaakopening-de-leeuw-50-jaar/" },
      { label: "Dordrecht.net: geboortedag van De Leeuw", url: "https://www.dordrecht.net/nieuws/53648/2014-08-26-14242-schaakwereld-denkt-na-over-geboorte-dag-opening-in-dordrecht" },
    ],
  },
  {
    id: "lion-van-rekom",
    openingId: "black-lion",
    plyOrFen: 16,
    title: "Van Rekom's books",
    year: 1997,
    era: "Club-origin",
    glyph: "paper",
    summary:
      "Jerry van Rekom, Jansen's student, wrote the opening out. Dutch editions of De Leeuw, hét zwarte wapen began in 1997 (Syntax); an English The Black Lion followed (Schaaknieuws, 2001). Chess.com later carried New in Chess's English edition and a critical review. The Lion is a branded handling of the Hanham Philidor — the books, not folklore, are why the name travelled.",
    whyItMattersHere:
      "…Qc7, …h6, …Re8 is the coil those books taught. Play one square at a time. The roar is a plan, not a single move.",
    sources: [
      { label: "Schaakvereniging Sliedrecht: publication table", url: "https://www.schakendsliedrecht.nl/2017/01/07/schaakopening-de-leeuw-50-jaar/" },
      { label: "Chess.com: The Black Lion (New in Chess)", url: "https://www.chess.com/news/view/new-chess-predators-take-notice" },
      { label: "Chess.com: Review, The Black Lion", url: "https://www.chess.com/news/view/review-the-black-lion" },
    ],
  },

  // --- Pirc ---
  {
    id: "pirc-vasja",
    openingId: "pirc",
    plyOrFen: 6,
    title: "Vasja Pirc's hypermodern",
    year: 1948,
    era: "Hypermodern",
    glyph: "debut",
    summary:
      "The Pirc is named for Yugoslav (Slovenian) grandmaster Vasja Pirc, who played 1.e4 d6 2.d4 Nf6 3.Nc3 g6 regularly from the late 1940s. In former Soviet countries it is often the Ufimtsev or Pirc–Ufimtsev Defence. Paul van der Sterren calls 3…g6 the defining move because the bishop on g7 creates King's Indian tension without White having played c4.",
    whyItMattersHere:
      "…g6 is the Pirc, not a random fianchetto. You are inviting their big centre so you can later chop at it.",
    sources: [
      { label: "Wikipedia: Pirc Defence", url: "https://en.wikipedia.org/wiki/Pirc_Defence" },
    ],
  },
  {
    id: "pirc-fischer-72",
    openingId: "pirc",
    plyOrFen: 6,
    title: "Fischer's only Pirc, Reykjavík",
    year: 1972,
    era: "Modern",
    glyph: "paper",
    summary:
      "The Pirc's first World Championship appearance was game 17 of Fischer–Spassky, Reykjavík 1972. Fischer played it once in his career; Spassky chose the Austrian Attack 4.f4; the game was drawn. This spine is the Classical Two Knights (4.Nf3 / Be2), not that Austrian game — same Black house, different White try.",
    whyItMattersHere:
      "If the greatest classical player needed the Pirc once on the biggest stage, the structure is not a joke. Your book answers the quiet Classical, not 4.f4.",
    famousGame: {
      white: "Boris Spassky",
      black: "Bobby Fischer",
      year: 1972,
      eco: "B09",
      result: "½-½",
    },
    sources: [
      { label: "Wikipedia: Pirc Defence", url: "https://en.wikipedia.org/wiki/Pirc_Defence" },
    ],
  },

  // --- Dragon ---
  {
    id: "dragon-name",
    openingId: "dragon",
    plyOrFen: 10,
    title: "Named for Draco",
    year: 1901,
    era: "Classical",
    glyph: "debut",
    summary:
      "In his 1953 autobiography, Fyodor Dus-Chotimirsky claimed he coined 'Dragon Variation' in 1901 because Black's kingside pawns resembled the constellation Draco. Chess historian Edward Winter found the earliest known print in Wiener Schachzeitung, Jan–Feb 1914. Believe the naming story as a claim, and the 1914 print as the hard date.",
    whyItMattersHere:
      "…g6 is the dragon's spine. The bishop on g7 is the long diagonal they named a constellation after. Do not play a Scheveningen and call it a Dragon.",
    sources: [
      { label: "Wikipedia: Sicilian Dragon", url: "https://en.wikipedia.org/wiki/Sicilian_Defence,_Dragon_Variation" },
      { label: "Wikipedia: Sicilian Defence", url: "https://en.wikipedia.org/wiki/Sicilian_Defence" },
    ],
  },
  {
    id: "dragon-yugoslav-soltis",
    openingId: "dragon",
    plyOrFen: 24,
    title: "Yugoslav Attack, Soltis …h5",
    year: 1970,
    era: "Modern",
    glyph: "paper",
    summary:
      "White's most dangerous try is the Yugoslav Attack: Be3, f3, Qd2, long castle, then a pawn storm. Wikipedia lists 9.O-O-O, 9.Bc4, and 9.g4 as the main branches. The Soltis idea …h5 (as in this spine) is a known way to slow h4–h5. Kasparov used the Dragon as a surprise against Anand in their 1995 title match, then dropped it.",
    whyItMattersHere:
      "…h5 is not panic. It is how this book meets the opposite-side race: hold g4, keep the bishop, and counter on the c-file.",
    sources: [
      { label: "Wikipedia: Sicilian Dragon", url: "https://en.wikipedia.org/wiki/Sicilian_Defence,_Dragon_Variation" },
    ],
  },

  // --- Scandinavian ---
  {
    id: "scandi-lucena",
    openingId: "scandinavian",
    plyOrFen: 2,
    title: "Older than the word opening",
    year: 1497,
    era: "Romantic",
    glyph: "debut",
    summary:
      "The Scandinavian (1.e4 d5) is among the oldest recorded openings. Wikipedia cites a game between Francesc de Castellví and Narcís Vinyoles, Valencia around 1475, and Lucena's 1497 book. Late-19th-century Scandinavian masters, then Blackburne and Mieses, showed it was playable. Alekhine drew Lasker with it at St Petersburg 1914.",
    whyItMattersHere:
      "…d5 on move one is not a club joke. It is a forcing old defence. This spine then puts the queen on a5, not the quiet …Qd8.",
    sources: [
      { label: "Wikipedia: Scandinavian Defense", url: "https://en.wikipedia.org/wiki/Scandinavian_Defense" },
    ],
  },
  {
    id: "scandi-qa5",
    openingId: "scandinavian",
    plyOrFen: 6,
    title: "The queen on a5",
    year: 1914,
    era: "Classical",
    glyph: "paper",
    summary:
      "3…Qa5 is the classical main line of the 2…Qxd5 Scandinavian. Blackburne, Mieses, and later club tradition put the queen off the d-file so White's knight on c3 does not gain a tempo forever. This book's aggressive handling (…Bf5, long castle, sometimes …gxf6) is a modern attacking dress on that old queen move.",
    whyItMattersHere:
      "Qa5 is the fork in the road. From here you are not playing the 2…Nf6 Icelandic or 3…Qd8. Stay on this queen.",
    sources: [
      { label: "Wikipedia: Scandinavian Defense", url: "https://en.wikipedia.org/wiki/Scandinavian_Defense" },
    ],
  },

  // --- Alekhine ---
  {
    id: "alekhine-budapest-1921",
    openingId: "alekhine",
    plyOrFen: 2,
    title: "Alekhine at Budapest, 1921",
    year: 1921,
    era: "Hypermodern",
    glyph: "debut",
    summary:
      "Alexander Alekhine introduced 1.e4 Nf6 to master practice at Budapest 1921, against Endre Steiner and Fritz Sämisch. The idea is hypermodern: let White's pawns chase the knight, then undermine the overextended centre. Allgaier had analysed 1…Nf6 earlier (1819), but the opening carries Alekhine's name because he made it a weapon.",
    whyItMattersHere:
      "…Nf6 on move one is the provocation. Your spine then accepts the Four Pawns (2.e5 Nd5 3.d4 d6 4.c4 Nb6 5.f4) — the most ambitious White try — so you learn the real argument.",
    famousGame: {
      white: "Endre Steiner",
      black: "Alexander Alekhine",
      year: 1921,
      eco: "B02",
    },
    sources: [
      { label: "Wikipedia: Alekhine's Defence", url: "https://en.wikipedia.org/wiki/Alekhine%27s_Defence" },
    ],
  },
  {
    id: "alekhine-four-pawns",
    openingId: "alekhine",
    plyOrFen: 9,
    title: "The Four Pawns Attack",
    year: 1921,
    era: "Hypermodern",
    glyph: "paper",
    summary:
      "5.f4 is the Four Pawns Attack, White's broadest centre against Alekhine's Defence. Wikipedia treats it as the critical ambitious try; quieter systems (4.Nf3 Modern, 4.c5 Chase) are other trees. Alekhine himself showed ways for White to meet the Budapest Gambit with space — here the colours are reversed in spirit: you invited the pawns, now you must chop them.",
    whyItMattersHere:
      "f4 is the moment the centre becomes a target, not a museum. If you wanted a closed Philidor you would not have played 1…Nf6.",
    sources: [
      { label: "Wikipedia: Alekhine's Defence", url: "https://en.wikipedia.org/wiki/Alekhine%27s_Defence" },
    ],
  },

  // --- KID ---
  {
    id: "kid-hypermodern",
    openingId: "kings-indian",
    plyOrFen: 4,
    title: "The King's Indian house",
    year: 1922,
    era: "Hypermodern",
    glyph: "debut",
    summary:
      "The King's Indian Defence (1.d4 Nf6 2.c4 g6) is a hypermodern classic: Black lets White take the centre with pawns and later strikes with …e5 or …c5. It became a main defence in the mid-20th century through Bronstein, Boleslavsky, Geller, Gligorić, Fischer, and Kasparov. Wikipedia is the census; this book chooses one attacking branch, not the whole forest.",
    whyItMattersHere:
      "…g6 here is a King's Indian, not a Grünfeld (which would take …d5). You are building the fianchetto to hit a wide white centre.",
    sources: [
      { label: "Wikipedia: King's Indian Defence", url: "https://en.wikipedia.org/wiki/King%27s_Indian_Defence" },
    ],
  },
  {
    id: "kid-mar-del-plata",
    openingId: "kings-indian",
    plyOrFen: 16,
    title: "Mar del Plata, 1953",
    year: 1953,
    era: "Modern",
    glyph: "paper",
    summary:
      "The Classical Mar del Plata runs 7.O-O Nc6 8.d5 Ne7, named after the 1953 Mar del Plata tournament where the structure was debated in games involving Najdorf, Gligorić, and others. Black storms on the kingside with …f5; White plays on the queenside. That race is the spine of this book. Sämisch, Four Pawns, and Fianchetto systems are other trees.",
    whyItMattersHere:
      "…Ne7 is the Mar del Plata knight: it unblocks the f-pawn. From here the plan is …f5, not a random piece shuffle.",
    sources: [
      { label: "Wikipedia: King's Indian Defence", url: "https://en.wikipedia.org/wiki/King%27s_Indian_Defence" },
    ],
  },

  // --- Modern Benoni ---
  {
    id: "benoni-name",
    openingId: "modern-benoni",
    plyOrFen: 4,
    title: "Ben-Oni, son of my sorrow",
    year: 1825,
    era: "Classical",
    glyph: "debut",
    summary:
      "Aaron Reinganum of Frankfurt published Ben-Oni oder die Vertheidigungen gegen die Gambitzüge im Schache in 1825, analysing 1.d4 c5 among other defences. The Hebrew ben-oni ('son of my sorrow') was a nickname for his writings, not originally an opening name. Staunton later pointed to that book when discussing Saint-Amant's 1…c5. The Modern Benoni (…Nf6, …c5, …e6 against d5) is the 20th-century form.",
    whyItMattersHere:
      "…c5 is the Benoni break. This spine then plays …e6 and takes on d5 — the modern shape Tal made famous — not Old Benoni 1…c5 2.d5 e5.",
    sources: [
      { label: "Wikipedia: Benoni Defense", url: "https://en.wikipedia.org/wiki/Benoni_Defense" },
    ],
  },
  {
    id: "benoni-modern",
    openingId: "modern-benoni",
    plyOrFen: 6,
    title: "The Modern Benoni",
    year: 1953,
    era: "Modern",
    glyph: "paper",
    summary:
      "After 1.d4 Nf6 2.c4 c5 3.d5 e6 Black invites the pawn to d5 and later fianchettoes, accepting a space disadvantage for activity on the queenside and the e-file. Mikhail Tal's 1950s and 1960s practice made the Modern Benoni a serious weapon. This book meets 7.Nf3 / 8.h3 lines; the Flick-Knife 7.f4 lives in the trap pack.",
    whyItMattersHere:
      "…e6 is the modern tell. You are not playing a Czech Benoni with …e5. You will take on d5 and live with the hole on d6.",
    sources: [
      { label: "Wikipedia: Benoni Defense", url: "https://en.wikipedia.org/wiki/Benoni_Defense" },
    ],
  },

  // --- Benko ---
  {
    id: "benko-volga",
    openingId: "benko",
    plyOrFen: 6,
    title: "Volga, then Benko",
    year: 1946,
    era: "Hypermodern",
    glyph: "debut",
    summary:
      "Sacrificing …b5 in this structure is old: Opočenský played the idea in the 1930s; Thorvaldsson–Vaitonis, Munich Olympiad 1936, used the now-standard 1.d4 Nf6 2.c4 c5 3.d5 b5. In Eastern Europe it is the Volga Gambit, after B. Argunow's 1946 article in Shakhmaty v SSSR, named for the Volga river. Pal Benko popularized 3…b5 4.cxb5 a6 in the West and published The Benko Gambit in 1974.",
    whyItMattersHere:
      "…b5 is the offer. This book takes the accepted main line with …Bxa6 and pressure on a and b. Do not mix it up with a random Benoni …b5 break later.",
    sources: [
      { label: "Wikipedia: Benko Gambit", url: "https://en.wikipedia.org/wiki/Benko_Gambit" },
    ],
  },
  {
    id: "benko-1974",
    openingId: "benko",
    plyOrFen: 8,
    title: "Benko's book, 1974",
    year: 1974,
    era: "Modern",
    glyph: "paper",
    summary:
      "Benko distinguished the Volga (3…b5, sometimes with early …e6) from his main line 3…b5 4.cxb5 a6. Today the names are used interchangeably. The point is long-term queenside pressure, not a mating hunt on move ten.",
    whyItMattersHere:
      "…a6 asks them to open the a- and b-files. If they take, your bishop and rooks live on those files for the rest of the game.",
    sources: [
      { label: "Wikipedia: Benko Gambit", url: "https://en.wikipedia.org/wiki/Benko_Gambit" },
    ],
  },

  // --- Dutch Leningrad ---
  {
    id: "dutch-wcc-1951",
    openingId: "dutch-leningrad",
    plyOrFen: 2,
    title: "The Dutch at a world championship",
    year: 1951,
    era: "Hypermodern",
    glyph: "paper",
    summary:
      "1…f5 is the Dutch Defence. Wikipedia notes it has never been a main line against 1.d4, but Botvinnik and Bronstein both used it in their 1951 World Championship match. Morphy, Alekhine, Najdorf, Larsen, and later Nakamura have also played it. This book does not play Stonewall …e6 or Classical …e6; it plays the Leningrad fianchetto.",
    whyItMattersHere:
      "…f5 on move one claims e4. Everything that follows in this spine is a Leningrad dress of that claim, not a Stonewall wall.",
    sources: [
      { label: "Wikipedia: Dutch Defence", url: "https://en.wikipedia.org/wiki/Dutch_Defence" },
    ],
  },
  {
    id: "dutch-leningrad",
    openingId: "dutch-leningrad",
    plyOrFen: 6,
    title: "Leningrad Variation",
    year: 1960,
    era: "Hypermodern",
    glyph: "debut",
    summary:
      "The Leningrad Dutch combines …f5 with …g6 and …Bg7 (ECO A87 when White has c4, g3, Bg2, Nf3). Wikipedia lists it as a named branch of the Dutch, alongside Stonewall and Ilyin–Zhenevsky. The name points to the Leningrad school of players who developed the fianchetto treatment; it is not a single famous game.",
    whyItMattersHere:
      "…g6 here makes a King's Indian with an extra f-pawn. Your storm ideas (…e5, kingside space) come from that bishop, not from a Stonewall clamp.",
    sources: [
      { label: "Wikipedia: Dutch Defence", url: "https://en.wikipedia.org/wiki/Dutch_Defence" },
    ],
  },

  // --- Budapest ---
  {
    id: "budapest-1896",
    openingId: "budapest",
    plyOrFen: 4,
    title: "Adler–Maróczy, 5 March 1896",
    year: 1896,
    era: "Hypermodern",
    glyph: "debut",
    summary:
      "The first known Budapest Gambit was a casual game, Mór Adler vs Géza Maróczy, Budapest, 5 March 1896. Maróczy credited Zsigmond Barász with discovering its playability, and István Abonyi and Gyula Breyer with developing it. Schlechter published optimistic analysis. Alekhine later showed how White could keep a space edge.",
    whyItMattersHere:
      "2…e5 is the Budapest offer. This spine then meets the Rubinstein 4.Bf4, not the Adler 4.Nf3 (that line is in the trap pack).",
    famousGame: {
      white: "Mór Adler",
      black: "Géza Maróczy",
      year: 1896,
      eco: "A52",
    },
    sources: [
      { label: "Wikipedia: Budapest Gambit", url: "https://en.wikipedia.org/wiki/Budapest_Gambit" },
    ],
  },
  {
    id: "budapest-rubinstein",
    openingId: "budapest",
    plyOrFen: 7,
    title: "Rubinstein's 4.Bf4",
    year: 1925,
    era: "Classical",
    glyph: "paper",
    summary:
      "4.Bf4 is the Rubinstein Variation against the Budapest, White's most important try for an edge: keep the extra pawn under observation and restrain …Bb4+. Wikipedia discusses Alekhine's handling of related lines in the 1920s. Black's practical counter is …Nc6, …Bb4+, and …Qe7 — which is this book's spine.",
    whyItMattersHere:
      "When they put the bishop on f4, you do not panic for the e5-pawn. You develop, check on b4, and pile on e5 with the queen.",
    sources: [
      { label: "Wikipedia: Budapest Gambit", url: "https://en.wikipedia.org/wiki/Budapest_Gambit" },
    ],
  },
];

export function baseOpeningId(id: string): string {
  return id.split("--")[0] ?? id;
}

export function trapIdFromOpening(id: string): string | null {
  const parts = id.split("--");
  return parts.length > 1 ? (parts[1] ?? null) : null;
}

export function historyForOpeningId(openingId: string): HistoryMilestone[] {
  const base = baseOpeningId(openingId);
  return HISTORY_PACK.filter((m) => m.openingId === base);
}

export function historyAt(
  opening: Opening,
  ply: number,
): HistoryMilestone[] {
  const trapId = trapIdFromOpening(opening.id);
  return opening.history.filter((m) => {
    if (m.trapId) {
      if (!trapId || m.trapId !== trapId) return false;
    } else if (trapId) {
      // Spine marks still show on a trap if the ply is on the shared prefix.
    }
    if (typeof m.plyOrFen === "number") return m.plyOrFen === ply;
    return false;
  });
}

export function historyFen(
  opening: Opening,
  milestone: HistoryMilestone,
): string {
  if (typeof milestone.plyOrFen === "string") return milestone.plyOrFen;
  const ply = Math.max(0, Math.min(milestone.plyOrFen, opening.moves.length));
  return playLine(opening.moves, ply).fen;
}

export function attachHistory<T extends { id: string; moves: string[] }>(
  opening: T,
): T & { history: HistoryMilestone[] } {
  const trapId = trapIdFromOpening(opening.id);
  const rows = historyForOpeningId(opening.id).filter((m) => {
    if (typeof m.plyOrFen === "number" && m.plyOrFen > opening.moves.length) {
      return false;
    }
    if (m.trapId) return trapId === m.trapId;
    return true;
  });
  return { ...opening, history: rows };
}
