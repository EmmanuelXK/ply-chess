import { subscribeCoachSpeaking } from "@/lib/chess/speak";
import { FOCUS_DUCK_RATIO, focusBedFor, type FocusBed } from "./focus-beds";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let duck: GainNode | null = null;
let nodes: AudioNode[] = [];
let sources: AudioScheduledSourceNode[] = [];
let currentId: string | null = null;
let wantedOn = false;
let ducked = false;
let speakingUnsub: (() => void) | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
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
  noiseGain.gain.value = bed.noise * 0.22;
  noise.connect(noiseGain);
  noiseGain.connect(filter);
  noise.start();
  sources.push(noise);

  const drone = ac.createOscillator();
  drone.type = "sine";
  drone.frequency.value = bed.droneHz;
  const droneGain = ac.createGain();
  droneGain.gain.value = 0.045;
  const pulse = ac.createOscillator();
  pulse.type = "sine";
  pulse.frequency.value = bed.pulseHz;
  const pulseGain = ac.createGain();
  pulseGain.gain.value = 0.018;
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
  fifthGain.gain.value = 0.012;
  fifth.connect(fifthGain);
  fifthGain.connect(duck);
  fifth.start();
  sources.push(fifth);

  nodes = [filter, lfoGain, noiseGain, droneGain, pulseGain, fifthGain, duck, master];

  const now = ac.currentTime;
  master.gain.exponentialRampToValueAtTime(0.09, now + 1.6);
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

export function resumeFocusBed(): void {
  const ac = audioContext();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();
  if (wantedOn && currentId && !master) {
    connectBed(ac, focusBedFor(currentId));
    applyDuck(ducked);
  }
}

export function startFocusBed(systemId: string): void {
  wantedOn = true;
  currentId = systemId;
  ensureSpeakingHook();
  const ac = audioContext();
  if (!ac) return;
  if (ac.state === "suspended") {
    void ac.resume().then(() => {
      if (wantedOn && currentId === systemId) {
        connectBed(ac, focusBedFor(systemId));
        applyDuck(ducked);
      }
    });
    return;
  }
  connectBed(ac, focusBedFor(systemId));
  applyDuck(ducked);
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
      if (!wantedOn) stopGraph();
    }, 400);
    return;
  }
  stopGraph();
}
