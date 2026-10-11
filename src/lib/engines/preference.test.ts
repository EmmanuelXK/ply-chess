import assert from "node:assert/strict";
import test from "node:test";
import { readEngineChoice, readEngineDepth, writeEngineChoice, writeEngineDepth } from "./preference";

function memory() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

test("engine choice is Stockfish and ignores retired engine names", () => {
  const store = memory();
  assert.equal(readEngineChoice(null), "stockfish");
  assert.equal(readEngineChoice(store), "stockfish");
  store.setItem("oe.engine", "lc0");
  assert.equal(readEngineChoice(store), "stockfish");
  store.setItem("oe.engine", "fairy");
  assert.equal(readEngineChoice(store), "stockfish");
  writeEngineChoice(store, "stockfish");
  assert.equal(readEngineChoice(store), "stockfish");
});

test("live search depth stays at 20", () => {
  const store = memory();
  assert.equal(readEngineDepth(store), 20);
  writeEngineDepth(store, 20);
  assert.equal(readEngineDepth(store), 20);
  store.setItem("oe.engine.depth", "8");
  assert.equal(readEngineDepth(store), 20);
});
