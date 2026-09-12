import { Chess } from "chess.js";
import type { EvalTick, EngineMove } from "./types";

type Listener = (line: string) => void;

let worker: Worker | null = null;
let boot: Promise<Worker> | null = null;
let dead = false;
const listeners = new Set<Listener>();

function markDead() {
  dead = true;
  boot = null;
  try {
    worker?.terminate();
  } catch {
    /* ignore */
  }
  worker = null;
}

function onMessage(ev: MessageEvent<string>) {
  const line = typeof ev.data === "string" ? ev.data : String(ev.data ?? "");
  for (const fn of listeners) fn(line);
}

export function stockfishSupported(): boolean {
  return typeof Worker !== "undefined" && !dead;
}

export async function getStockfish(): Promise<Worker> {
  if (worker) return worker;
  if (boot) return boot;
  boot = new Promise<Worker>((resolve, reject) => {
    try {
      const w = new Worker("/engines/stockfish-nnue-16-single.js");
      const ready = (ev: MessageEvent<string>) => {
        const line = typeof ev.data === "string" ? ev.data : "";
        if (line === "uciok" || line.includes("uciok")) {
          w.removeEventListener("message", ready);
          w.addEventListener("message", onMessage);
          worker = w;
          resolve(w);
        }
      };
      w.addEventListener("message", ready);
      w.addEventListener("error", (err) => {
        markDead();
        reject(err);
      });
      w.postMessage("uci");
      window.setTimeout(() => {
        if (!worker) {
          // Some builds speak after isready.
          w.postMessage("isready");
        }
      }, 400);
      window.setTimeout(() => {
        if (worker) return;
        w.addEventListener("message", onMessage);
        worker = w;
        resolve(w);
      }, 1800);
    } catch (err) {
      markDead();
      reject(err);
    }
  });
  return boot;
}

export async function stockfishEval(
  fen: string,
  opts?: { depth?: number; movetime?: number; multipv?: number },
): Promise<{ eval: EvalTick; moves: EngineMove[] }> {
  const coarse =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const depth = opts?.depth ?? (coarse ? 8 : 12);
  const movetime = opts?.movetime ?? (coarse ? 160 : 280);
  const multipv = opts?.multipv ?? 3;

  if (!stockfishSupported()) {
    return { eval: { cp: null, mate: null, depth: 0 }, moves: [] };
  }

  let w: Worker;
  try {
    w = await Promise.race([
      getStockfish(),
      new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error("stockfish boot timeout")), 2400);
      }),
    ]);
  } catch {
    return { eval: { cp: null, mate: null, depth: 0 }, moves: [] };
  }
  const collected: EngineMove[] = [];
  let tick: EvalTick = { cp: 0, mate: null, depth: 0 };

  const done = new Promise<{ eval: EvalTick; moves: EngineMove[] }>((resolve) => {
    const onLine = (line: string) => {
      if (line.startsWith("info ") && line.includes(" pv ")) {
        const depthM = / depth (\d+)/.exec(line);
        const mateM = / score mate (-?\d+)/.exec(line);
        const cpM = / score cp (-?\d+)/.exec(line);
        const pvM = / pv (.+)$/.exec(line);
        const mpv = / multipv (\d+)/.exec(line);
        const idx = mpv ? Number(mpv[1]) - 1 : 0;
        const pv = pvM?.[1]?.trim().split(/\s+/) ?? [];
        const uci = pv[0] ?? "";
        const move: EngineMove = {
          san: uci,
          uci,
          pv,
          scoreCp: cpM ? Number(cpM[1]) : undefined,
          mate: mateM ? Number(mateM[1]) : undefined,
        };
        collected[idx] = move;
        if (idx === 0) {
          tick = {
            cp: cpM ? Number(cpM[1]) : null,
            mate: mateM ? Number(mateM[1]) : null,
            depth: depthM ? Number(depthM[1]) : tick.depth,
            best: uci,
          };
        }
      }
      if (line.startsWith("bestmove")) {
        listeners.delete(onLine);
        const uci = line.split(/\s+/)[1] ?? "";
        if (uci && uci !== "(none)" && !collected[0]) {
          collected[0] = { san: uci, uci };
        }
        resolve({ eval: tick, moves: collected.filter(Boolean) });
      }
    };
    listeners.add(onLine);
    window.setTimeout(() => {
      if (listeners.has(onLine)) {
        listeners.delete(onLine);
        resolve({ eval: tick, moves: collected.filter(Boolean) });
      }
    }, movetime + 1600);
  });

  w.postMessage("stop");
  w.postMessage("ucinewgame");
  w.postMessage(`setoption name MultiPV value ${multipv}`);
  w.postMessage(`position fen ${fen}`);
  w.postMessage(`go depth ${depth} movetime ${movetime}`);
  return done;
}

export function uciToSan(fen: string, uci: string): string | null {
  if (!uci || uci === "(none)") return null;
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci[4] as "q" | "r" | "b" | "n" | undefined;
  try {
    const g = new Chess(fen);
    const move = g.move({ from, to, promotion: promotion ?? "q" });
    return move?.san ?? null;
  } catch {
    return null;
  }
}
