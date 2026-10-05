import assert from "node:assert/strict";
import test from "node:test";
import {
  readEngineChoice,
  readEngineDepth,
  writeEngineChoice,
  writeEngineDepth,
} from "./preference";

function memory() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

test("engine choice defaults to Stockfish and ignores unknown names", () => {
  const store = memory();
  assert.equal(readEngineChoice(null), "stockfish");
  assert.equal(readEngineChoice(store), "stockfish");
  store.setItem("oe.engine", "maia");
  assert.equal(readEngineChoice(store), "stockfish");
  writeEngineChoice(store, "fairy");
  assert.equal(readEngineChoice(store), "fairy");
  writeEngineChoice(store, "lc0");
  assert.equal(readEngineChoice(store), "lc0");
});

test("depth persists only the offered stops", () => {
  const store = memory();
  assert.equal(readEngineDepth(store), 12);
  writeEngineDepth(store, 8);
  assert.equal(readEngineDepth(store), 8);
  store.setItem("oe.engine.depth", "99");
  assert.equal(readEngineDepth(store), 12);
  writeEngineDepth(store, 16);
  assert.equal(readEngineDepth(store), 16);
});
