import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import test from "node:test";
import { ENGINE_ASSETS, ENGINE_CHOICES, STOCKFISH_WORKER } from "./catalog";

test("planted engines stay inside their size bounds and wasm files are wasm", () => {
  for (const asset of ENGINE_ASSETS) {
    const size = statSync(asset.path).size;
    assert.ok(
      size >= asset.min && size <= asset.max,
      `${asset.path} is ${size} bytes, expected ${asset.min}-${asset.max}`,
    );
  }
  const magic = readFileSync("public/engines/stockfish-17.1-lite.wasm").subarray(0, 4).toString("utf8");
  assert.equal(magic, "\0asm");
});

test("notices name Stockfish 17.1 GPL and do not ship Lc0 or Fairy", () => {
  const notice = readFileSync("public/engines/NOTICE.md", "utf8");
  assert.match(notice, /GPL-3\.0/);
  assert.match(notice, /Stockfish\.js 17\.1/);
  assert.match(notice, /lite/);
  assert.match(notice, /are not shipped/);
  assert.doesNotMatch(notice, /weights_9155/);
  const copying = readFileSync("public/engines/licenses/COPYING.txt", "utf8");
  assert.match(copying, /GNU GENERAL PUBLIC LICENSE/);
  assert.match(copying, /Version 3/);
  assert.deepEqual(
    ENGINE_CHOICES.map((engine) => engine.id),
    ["stockfish"],
  );
  assert.equal(STOCKFISH_WORKER, "/engines/stockfish-17.1-lite.js");
  const loader = readFileSync("public/engines/stockfish-17.1-lite.js", "utf8");
  assert.match(loader, /Stockfish\.js 17\.1/);
  assert.match(loader, /GPL/);
  assert.equal(loader.includes("weights_9155"), false);
  assert.equal(loader.includes("cdn.jsdelivr.net"), false);
});
