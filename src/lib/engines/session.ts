import {
  LC0_WEIGHTS,
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
  private bootToken = 0;

  subscribe(fn: LineListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  subscribePhase(fn: PhaseListener): () => void {
    this.phaseListeners.add(fn);
    fn(this.uiPhase);
    return () => this.phaseListeners.delete(fn);
  }

  configure(req: SearchRequest): void {
    this.req = req;
    if (this.engineId !== req.id || !this.worker) {
      this.boot(req.id);
      return;
    }
    this.flush();
  }

  halt(): void {
    if (!this.req) return;
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
    return `${req.id}|${req.depth}|${req.nonce}|${req.fen}`;
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

    if (id === "lc0") this.post(`load ${LC0_WEIGHTS}`);
    else this.post("uci");
  }

  private onEngineLine(id: AnalysisEngineId, line: string): void {
    this.emit(line);
    if (line === "uciok" || line.startsWith("uciok ")) {
      this.phase = "idle";
      if (id !== "lc0") {
        this.post("setoption name Hash value 16");
        if (id === "fairy") this.post("setoption name Threads value 1");
      }
      this.flush();
      return;
    }
    if (line.startsWith("bestmove")) {
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
    if (this.phase === "searching") {
      if (!req.run || key !== this.searchingKey) {
        this.post("stop");
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
    this.searchingKey = key;
    this.setUi("searching");
    if (req.id !== "lc0") this.post("setoption name MultiPV value 3");
    this.post(`position fen ${req.fen}`);
    this.post(`go depth ${req.depth}`);
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

let singleton: EngineSession | null = null;

export function getEngineSession(): EngineSession {
  if (!singleton) singleton = new EngineSession();
  return singleton;
}
