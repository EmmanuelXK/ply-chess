import {
  LIVE_DEPTH,
  LIVE_MOVETIME_MS,
  engineById,
  type AnalysisEngineId,
  type EngineDepth,
} from "./catalog";

export type AnalysisPhase = "loading" | "searching" | "ready" | "stopped" | "error";

type LineListener = (line: string, key: string | null) => void;
type PhaseListener = (phase: AnalysisPhase) => void;

interface SearchRequest {
  id: AnalysisEngineId;
  fen: string;
  run: boolean;
  depth: EngineDepth;
  /** Bumps when the user presses Go again on the same position. */
  nonce: number;
  multipv: number;
}

function normalizeLine(data: unknown): string[] {
  const raw = typeof data === "string"
    ? data
    : Array.isArray(data) && typeof data[0] === "string"
      ? data[0]
      : "";
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

class EngineSession {
  private worker: Worker | null = null;
  private engineId: AnalysisEngineId | null = null;
  private phase: "boot" | "idle" | "searching" = "boot";
  private uiPhase: AnalysisPhase = "loading";
  private listeners = new Set<LineListener>();
  private phaseListeners = new Set<PhaseListener>();
  private req: SearchRequest | null = null;
  private searchingKey: string | null = null;
  private finishedKey: string | null = null;
  /** True after `go` until the matching `bestmove`. A late bestmove must not finish the next search. */
  private awaiting = false;
  private stopSent = false;
  private bootToken = 0;
  private owner: string | null = null;

  subscribe(fn: LineListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  subscribePhase(fn: PhaseListener): () => void {
    this.phaseListeners.add(fn);
    fn(this.uiPhase);
    return () => this.phaseListeners.delete(fn);
  }

  configure(req: SearchRequest, owner: string): void {
    this.owner = owner;
    this.req = req;
    if (this.engineId !== req.id || !this.worker) {
      this.boot(req.id);
      return;
    }
    this.flush();
  }

  halt(owner: string): void {
    if (this.owner !== owner || !this.req) return;
    this.req = { ...this.req, run: false };
    this.flush();
  }

  private setUi(phase: AnalysisPhase): void {
    if (this.uiPhase === phase) return;
    this.uiPhase = phase;
    for (const fn of this.phaseListeners) fn(phase);
  }

  private emit(line: string): void {
    const key = this.searchingKey;
    for (const fn of this.listeners) fn(line, key);
  }

  private keyOf(req: SearchRequest): string {
    return `${req.id}|${req.depth}|${req.multipv}|${req.nonce}|${req.fen}`;
  }

  private post(line: string): void {
    this.worker?.postMessage(line);
  }

  private boot(id: AnalysisEngineId): void {
    const token = ++this.bootToken;
    this.disposeWorker();
    this.engineId = id;
    this.phase = "boot";
    this.searchingKey = null;
    this.finishedKey = null;
    this.awaiting = false;
    this.stopSent = false;
    this.setUi("loading");

    let worker: Worker;
    try {
      worker = new Worker(engineById(id).worker);
    } catch {
      this.setUi("error");
      this.emit("info string engine failed to start");
      return;
    }
    this.worker = worker;
    worker.onmessage = (event: MessageEvent<unknown>) => {
      if (token !== this.bootToken) return;
      for (const line of normalizeLine(event.data)) this.onEngineLine(id, line);
    };
    worker.onerror = () => {
      if (token !== this.bootToken) return;
      this.setUi("error");
      this.emit("info string engine failed to start");
    };

    this.post("uci");
  }

  private onEngineLine(_id: AnalysisEngineId, line: string): void {
    this.emit(line);
    if (line === "uciok" || line.startsWith("uciok ")) {
      this.phase = "idle";
      const cores =
        typeof navigator !== "undefined" && navigator.hardwareConcurrency
          ? navigator.hardwareConcurrency
          : 2;
      const isolated = typeof crossOriginIsolated !== "undefined" && crossOriginIsolated;
      const threads = isolated ? Math.max(2, Math.min(4, cores)) : 1;
      this.post(`setoption name Threads value ${threads}`);
      this.post("setoption name Hash value 32");
      this.flush();
      return;
    }
    if (line.startsWith("bestmove")) {
      if (!this.awaiting) return;
      this.awaiting = false;
      this.stopSent = false;
      this.phase = "idle";
      this.finishedKey = this.searchingKey;
      const req = this.req;
      if (req?.run && this.finishedKey === this.keyOf(req)) this.setUi("ready");
      this.flush();
      return;
    }
    if (line.startsWith("info string") && /fail|error/i.test(line)) {
      this.setUi("error");
    }
  }

  private flush(): void {
    const req = this.req;
    if (!req || this.phase === "boot" || !this.worker) return;
    const key = this.keyOf(req);
    if (this.phase === "searching" || this.awaiting) {
      if (!req.run || key !== this.searchingKey) {
        if (!this.stopSent) {
          this.post("stop");
          this.stopSent = true;
        }
        if (!req.run) this.setUi("stopped");
      }
      return;
    }
    if (!req.run) {
      this.setUi(this.finishedKey === key ? "ready" : "stopped");
      return;
    }
    if (this.finishedKey === key) {
      this.setUi("ready");
      return;
    }
    this.phase = "searching";
    this.awaiting = true;
    this.stopSent = false;
    this.searchingKey = key;
    this.setUi("searching");
    this.post(`setoption name MultiPV value ${req.multipv}`);
    this.post(`position fen ${req.fen}`);
    this.post(`go depth ${LIVE_DEPTH} movetime ${LIVE_MOVETIME_MS}`);
  }

  private disposeWorker(): void {
    const worker = this.worker;
    this.worker = null;
    if (!worker) return;
    try {
      worker.postMessage("quit");
    } catch {
      /* already gone */
    }
    try {
      worker.terminate();
    } catch {
      /* already gone */
    }
  }
}

const sessions = new Map<AnalysisEngineId, EngineSession>();

export function getEngineSession(id: AnalysisEngineId): EngineSession {
  let session = sessions.get(id);
  if (!session) {
    session = new EngineSession();
    sessions.set(id, session);
  }
  return session;
}
