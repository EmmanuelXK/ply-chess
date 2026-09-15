import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  getFocusBedStatus,
  resetFocusBedForTests,
  resumeFocusBed,
  startFocusBed,
  unlockFocusBed,
} from "./focus-player";

type Fn = (...args: unknown[]) => unknown;

class FakeParam {
  value = 0;
  exponentialRampToValueAtTime() {}
  cancelScheduledValues() {}
  setValueAtTime() {}
}

class FakeNode {
  connect() {
    return this;
  }
  disconnect() {}
}

class FakeOsc extends FakeNode {
  type = "sine";
  frequency = new FakeParam();
  started = false;
  start() {
    this.started = true;
  }
  stop() {}
}

class FakeBufferSource extends FakeNode {
  buffer: unknown = null;
  loop = false;
  started = false;
  start() {
    this.started = true;
  }
  stop() {}
}

class FakeContext {
  state: AudioContextState = "suspended";
  currentTime = 0;
  sampleRate = 44100;
  destination = new FakeNode();
  resumeCalls = 0;
  oscillators: FakeOsc[] = [];
  hangResume = true;
  listeners = new Map<string, Fn[]>();

  addEventListener(type: string, fn: Fn) {
    const list = this.listeners.get(type) ?? [];
    list.push(fn);
    this.listeners.set(type, list);
  }

  createGain() {
    return Object.assign(new FakeNode(), { gain: new FakeParam() });
  }
  createOscillator() {
    const osc = new FakeOsc();
    this.oscillators.push(osc);
    return osc;
  }
  createBiquadFilter() {
    return Object.assign(new FakeNode(), {
      type: "lowpass",
      frequency: new FakeParam(),
      Q: new FakeParam(),
    });
  }
  createBuffer(_channels: number, length: number, _rate: number) {
    return { getChannelData: () => new Float32Array(length) };
  }
  createBufferSource() {
    return new FakeBufferSource();
  }
  resume() {
    this.resumeCalls += 1;
    if (this.hangResume) return new Promise<void>(() => {});
    this.state = "running";
    for (const fn of this.listeners.get("statechange") ?? []) fn();
    return Promise.resolve();
  }
  close() {
    this.state = "closed";
    return Promise.resolve();
  }
}

describe("focus player", () => {
  let ac: FakeContext;

  beforeEach(() => {
    resetFocusBedForTests();
    ac = new FakeContext();
    const g = globalThis as unknown as {
      window: { AudioContext: new () => FakeContext };
    };
    g.window = {
      AudioContext: class {
        constructor() {
          return ac;
        }
      } as unknown as new () => FakeContext,
    };
  });

  afterEach(() => {
    resetFocusBedForTests();
  });

  it("connects the bed without waiting for resume() — iOS gesture turn", () => {
    startFocusBed("london");
    assert.ok(ac.resumeCalls >= 1, "must kick AudioContext.resume in this turn");
    assert.equal(ac.state, "suspended");
    assert.ok(
      ac.oscillators.length >= 3,
      "oscillators start in the gesture, not in resume().then",
    );
    assert.ok(ac.oscillators.every((o) => o.started));
    assert.equal(getFocusBedStatus().wanted, true);
    assert.equal(getFocusBedStatus().systemId, "london");
  });

  it("unlock starts when music is on", () => {
    unlockFocusBed("evans-gambit", true);
    assert.ok(ac.oscillators.length >= 3);
    assert.equal(getFocusBedStatus().wanted, true);
  });

  it("unlock does not start when music is muted", () => {
    unlockFocusBed("london", false);
    assert.equal(ac.oscillators.length, 0);
    assert.equal(getFocusBedStatus().wanted, false);
  });

  it("resumeFocusBed restarts the bed if music was already wanted", () => {
    startFocusBed("dragon");
    const before = ac.oscillators.length;
    resumeFocusBed();
    assert.ok(ac.oscillators.length >= before);
    assert.equal(getFocusBedStatus().systemId, "dragon");
  });
});
