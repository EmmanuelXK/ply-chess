import { Chess } from "chess.js";
import { maiaScore, pickByScore, planScore, staticEvalCp } from "./heuristic";
import { stockfishEval, stockfishSupported, uciToSan } from "./stockfish";
import type { EngineVote, EvalTick, HybridAdvice } from "./types";

function plyFromFen(fen: string): number {
  const parts = fen.split(" ");
  const full = Number(parts[5] ?? 1);
  const turn = parts[1] === "w" ? 0 : 1;
  return Math.max(0, (full - 1) * 2 + turn);
}

export async function hybridAdvice(fen: string): Promise<HybridAdvice> {
  const chess = new Chess(fen);
  const ply = plyFromFen(fen);

  const plan = pickByScore(fen, (g, m) => planScore(g, m));
  const human = pickByScore(fen, (g, m) => maiaScore(g, m, ply));

  let fishSan: string | null = null;
  let fishCp: number | undefined;
  let fishMate: number | undefined;
  let fishUci = "";
  let fishReady = false;
  if (stockfishSupported()) {
    try {
      const coarse =
        typeof navigator !== "undefined" &&
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const { moves, eval: ev } = await stockfishEval(fen, {
        depth: coarse ? 8 : 11,
        movetime: coarse ? 160 : 260,
        multipv: 3,
      });
      const top = moves[0];
      if (top) {
        fishUci = top.uci;
        fishSan = uciToSan(fen, top.uci) ?? top.uci;
        fishCp = top.scoreCp ?? ev.cp ?? undefined;
        fishReady = true;
        const mate = top.mate ?? ev.mate;
        fishMate = mate == null || mate === 0 ? undefined : mate;
      }
    } catch {
      fishReady = false;
    }
  }

  const votes: EngineVote[] = [
    {
      id: "stockfish",
      label: "Stockfish",
      ready: fishReady,
      move: fishSan
        ? { san: fishSan, uci: fishUci, scoreCp: fishCp, mate: fishMate }
        : null,
      note: "Tactical truth. Trust it when something hangs or mates.",
    },
    {
      id: "lc0",
      label: "Lc0-style",
      ready: true,
      move: plan ? { san: plan.san, uci: plan.uci, scoreCp: plan.scoreCp } : null,
      note: "Plan net stand-in: activity, king pressure, pawn storms. Full Lc0 WASM is too heavy for iPhone — see README.",
    },
    {
      id: "maia",
      label: "Maia-style",
      ready: true,
      move: human
        ? { san: human.san, uci: human.uci, scoreCp: human.scoreCp }
        : null,
      note: "Human-trained prior: development, don't hang, no early queen raids. ONNX Maia is a later drop-in.",
    },
  ];

  const sf = votes[0].move?.san;
  const lc = votes[1].move?.san;
  const ma = votes[2].move?.san;
  const disagree = Boolean(sf && lc && ma && new Set([sf, lc, ma]).size > 1);

  const hanging =
    typeof fishCp === "number" &&
    ((chess.turn() === "w" && fishCp > 150) ||
      (chess.turn() === "b" && fishCp < -150));
  const mateish = votes[0].move?.mate != null && votes[0].move.mate !== 0;

  let pickId: HybridAdvice["pickId"] = "blend";
  let pick = votes[2].move ?? votes[1].move ?? votes[0].move;
  let headline = "Think like a human.";
  let detail =
    "When the engines argue, play the developing / plan move unless Stockfish says something is hanging.";

  if (mateish || hanging) {
    pickId = "stockfish";
    pick = votes[0].move;
    headline = "Tactical exception.";
    detail =
      "Stockfish sees a real tactic. Don't 'play human' into a loss — take the forcing move, then go back to plans.";
  } else if (lc && ma && lc === ma && sf && sf !== lc) {
    pickId = "blend";
    pick = votes[2].move;
    headline = "Human-practical choice.";
    detail = `${lc} is what the plan net and the human prior agree on. Stockfish prefers ${sf}, but that's engine-best spam. In this opening, play the human move.`;
  } else if (ma) {
    pickId = "maia";
    pick = votes[2].move;
    headline = "Think like a human.";
    detail = `${ma} is the human-practical choice. ${sf && sf !== ma ? `Stockfish likes ${sf}. ` : ""}${lc && lc !== ma ? `Lc0-style likes ${lc}. ` : ""}Follow the prior unless a tactic appears.`;
  }

  return { votes, pick, pickId, headline, detail, disagree };
}

export function instantEval(fen: string): EvalTick {
  return { cp: staticEvalCp(fen), mate: null, depth: 0 };
}
