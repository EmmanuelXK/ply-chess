import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import test from "node:test";
import { ENGINE_ASSETS, ENGINE_CHOICES } from "./catalog";

test("planted engines stay inside their size bounds and wasm files are wasm", () => {
  for (const asset of ENGINE_ASSETS) {
    const size = statSync(asset.path).size;
    assert.ok(
      size >= asset.min && size <= asset.max,
      `${asset.path} is ${size} bytes, expected ${asset.min}-${asset.max}`,
    );
  }
  for (const path of [
    "public/engines/stockfish-19-lite-single.wasm",
    "public/engines/fairy/stockfish.wasm",
    "public/engines/lc0/lc0.wasm",
  ]) {
    const magic = readFileSync(path).subarray(0, 4).toString("utf8");
    assert.equal(magic, "\0asm", path);
  }
  const weights = readFileSync("public/engines/lc0/weights_9155.txt.gz").subarray(0, 2);
  assert.equal(weights[0], 0x1f);
  assert.equal(weights[1], 0x8b);
});

test("notices name the three GPL engines and Lc0 stays lazy", () => {
  const notice = readFileSync("public/engines/NOTICE.md", "utf8");
  assert.match(notice, /GPL-3\.0/);
  assert.match(notice, /Stockfish\.js 19/);
  assert.match(notice, /fairy-stockfish-nnue\.wasm/);
  assert.match(notice, /lc0-js/);
  assert.match(notice, /only after Lc0 is chosen/);
  const copying = readFileSync("public/engines/licenses/COPYING.txt", "utf8");
  assert.match(copying, /GNU GENERAL PUBLIC LICENSE/);
  assert.match(copying, /Version 3/);
  assert.equal(ENGINE_CHOICES.filter((engine) => engine.lazy).map((engine) => engine.id).join(), "lc0");
  const loader = readFileSync("public/engines/lc0/lc0.js", "utf8");
  assert.equal(loader.includes("cdn.rawgit.com"), false);
  assert.equal(loader.includes("cdn.jsdelivr.net"), false);
  assert.match(loader, /\/engines\/lc0\/vendor\/tf\.min\.js/);
});
