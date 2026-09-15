import { subscribeCoachSpeaking } from "@/lib/chess/speak";
import { readFocusMusicOn } from "./prefs";
import {
  FOCUS_DRONE_GAIN,
  FOCUS_DUCK_RATIO,
  FOCUS_FADE_IN_SEC,
  FOCUS_FIFTH_GAIN,
  FOCUS_MASTER_GAIN,
  FOCUS_NOISE_SCALE,
  FOCUS_PULSE_DEPTH,
  focusBedFor,
  type FocusBed,
} from "./focus-beds";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let duck: GainNode | null = null;
let nodes: AudioNode[] = [];
let sources: AudioScheduledSourceNode[] = [];
let currentId: string | null = null;
let graphId: string | null = null;
let wantedOn = false;
let ducked = false;
let startedWhileRunning = false;
let speakingUnsub: (() => void) | null = null;
let lifeHooked = false;
const listeners = new Set<(status: FocusBedStatus) => void>();

export type FocusBedStatus = {
  wanted: boolean;
  running: boolean;
  systemId: string | null;
};

export function getFocusBedStatus(): FocusBedStatus {
  return {
    wanted: wantedOn,
    running: isGraphLive(),
    systemId: currentId,
  };
}

export function subscribeFocusBed(
  listener: (status: FocusBedStatus) => void,
): () => void {
  listeners.add(listener);
  listener(getFocusBedStatus());
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  const status = getFocusBedStatus();
  for (const fn of listeners) fn(status);
}

function isGraphLive(): boolean {
  return Boolean(
    ctx &&
      ctx.state === "running" &&
      master &&
      sources.length > 0 &&
      startedWhileRunning &&
      wantedOn,
  );
}

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  ctx.addEventListener("statechange", () => {
    if (ctx && ctx.state === "running" && wantedOn && currentId) {
      if (master && sources.length > 0) {
        startedWhileRunning = true;
      } else {
        connectBed(ctx, focusBedFor(currentId));
        applyDuck(ducked);
      }
    }
    emit();
  });
  return ctx;
}

function contextNeedsUnlock(ac: AudioContext): boolean {
  const state = ac.state as string;
  return state === "suspended" || state === "interrupted";
}

/** Silent tick + resume must run in the same turn as the user gesture (iOS). */
function kickContext(ac: AudioContext): void {
  if (contextNeedsUnlock(ac)) {
    void ac.resume();
  }
  try {
    const buffer = ac.createBuffer(1, 1, ac.sampleRate);
    const src = ac.createBufferSource();
    src.buffer = buffer;
    src.connect(ac.destination);
    src.start(0);
  } catch {
    /* ignore */
  }
}

function pinkNoiseBuffer(ac: AudioContext, seconds = 2): AudioBuffer {
  const length = Math.floor(ac.sampleRate * seconds);
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.5703 * b2 + white * 1.052691;
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.11;
  }
  return buffer;
}

function connectBed(ac: AudioContext, bed: FocusBed) {
  stopGraph();
  master = ac.createGain();
  master.gain.value = 0.0001;
  duck = ac.createGain();
  duck.gain.value = 1;
  duck.connect(master);
  master.connect(ac.destination);

  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = bed.filterHz;
  filter.Q.value = bed.q;
  filter.connect(duck);

  const lfo = ac.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = bed.lfoHz;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = bed.filterHz * 0.18;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();
  sources.push(lfo);

  const noise = ac.createBufferSource();
  noise.buffer = pinkNoiseBuffer(ac);
  noise.loop = true;
  const noiseGain = ac.createGain();
  noiseGain.gain.value = bed.noise * FOCUS_NOISE_SCALE;
  noise.connect(noiseGain);
  noiseGain.connect(filter);
  noise.start();
  sources.push(noise);

  const drone = ac.createOscillator();
  drone.type = "sine";
  drone.frequency.value = bed.droneHz;
  const droneGain = ac.createGain();
  droneGain.gain.value = FOCUS_DRONE_GAIN;
  const pulse = ac.createOscillator();
  pulse.type = "sine";
  pulse.frequency.value = bed.pulseHz;
  const pulseGain = ac.createGain();
  pulseGain.gain.value = FOCUS_PULSE_DEPTH;
  pulse.connect(pulseGain);
  pulseGain.connect(droneGain.gain);
  drone.connect(droneGain);
  droneGain.connect(duck);
  drone.start();
  pulse.start();
  sources.push(drone, pulse);

  const fifth = ac.createOscillator();
  fifth.type = "triangle";
  fifth.frequency.value = bed.fifthHz;
  const fifthGain = ac.createGain();
  fifthGain.gain.value = FOCUS_FIFTH_GAIN;
  fifth.connect(fifthGain);
  fifthGain.connect(duck);
  fifth.start();
  sources.push(fifth);

  nodes = [filter, lfoGain, noiseGain, droneGain, pulseGain, fifthGain, duck, master];
  graphId = bed.id;
  startedWhileRunning = ac.state === "running";

  const now = ac.currentTime;
  master.gain.exponentialRampToValueAtTime(
    FOCUS_MASTER_GAIN,
    now + FOCUS_FADE_IN_SEC,
  );
}

function stopGraph() {
  for (const src of sources) {
    try {
      src.stop();
    } catch {
      /* already stopped */
    }
    try {
      src.disconnect();
    } catch {
      /* ignore */
    }
  }
  sources = [];
  for (const node of nodes) {
    try {
      node.disconnect();
    } catch {
      /* ignore */
    }
  }
  nodes = [];
  master = null;
  duck = null;
  graphId = null;
  startedWhileRunning = false;
}

function applyDuck(on: boolean) {
  ducked = on;
  if (!duck || !ctx) return;
  const now = ctx.currentTime;
  duck.gain.cancelScheduledValues(now);
  duck.gain.setValueAtTime(duck.gain.value, now);
  duck.gain.exponentialRampToValueAtTime(
    on ? Math.max(0.001, FOCUS_DUCK_RATIO) : 1,
    now + 0.18,
  );
}

function ensureSpeakingHook() {
  if (speakingUnsub) return;
  speakingUnsub = subscribeCoachSpeaking((on) => applyDuck(on));
}

function ensureLifecycleHook() {
  if (lifeHooked || typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  lifeHooked = true;
  const kick = () => {
    if (!wantedOn || !currentId) return;
    if (document.visibilityState === "hidden") return;
    startFocusBed(currentId);
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") kick();
  });
  window.addEventListener("focus", kick);
  window.addEventListener("pageshow", kick);
}

/**
 * Resume AudioContext and start the bed in this turn.
 * Call from user gestures — do not wait for resume() before connecting.
 */
export function startFocusBed(systemId: string): void {
  wantedOn = true;
  currentId = systemId;
  ensureSpeakingHook();
  ensureLifecycleHook();
  const ac = audioContext();
  if (!ac) return;
  kickContext(ac);
  if (isGraphLive() && graphId === systemId) {
    applyDuck(ducked);
    emit();
    return;
  }
  connectBed(ac, focusBedFor(systemId));
  applyDuck(ducked);
  emit();
}

export function resumeFocusBed(): void {
  if (wantedOn && currentId) {
    startFocusBed(currentId);
    return;
  }
  const ac = audioContext();
  if (ac) kickContext(ac);
}

/** Gesture unlock: start the system bed if Music is on (pref default ON). */
export function unlockFocusBed(systemId: string, musicOn = readFocusMusicOn()): void {
  if (!musicOn) return;
  startFocusBed(systemId);
}

export function stopFocusBed(): void {
  wantedOn = false;
  currentId = null;
  if (ctx && master) {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    window.setTimeout(() => {
      if (!wantedOn) {
        stopGraph();
        emit();
      }
    }, 400);
    emit();
    return;
  }
  stopGraph();
  emit();
}

/** Test hook — tears down singleton graph + context. */
export function resetFocusBedForTests(): void {
  wantedOn = false;
  currentId = null;
  ducked = false;
  stopGraph();
  speakingUnsub?.();
  speakingUnsub = null;
  if (ctx) {
    try {
      void ctx.close();
    } catch {
      /* ignore */
    }
  }
  ctx = null;
  lifeHooked = false;
  listeners.clear();
}
