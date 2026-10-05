import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { PWA_ICONS } from "../version";

function pngHeader(path: string) {
  const buf = readFileSync(path);
  assert.equal(buf.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
    bitDepth: buf[24],
    colorType: buf[25],
  };
}

test("home-screen icons are opaque RGB squares on new URLs", () => {
  assert.equal(PWA_ICONS.appleTouch, "/apple-touch-icon-v2.png");
  assert.equal(PWA_ICONS.favicon.endsWith(".svg"), false);

  const expected = [
    ["public/apple-touch-icon-v2.png", 180],
    ["public/apple-touch-icon.png", 180],
    ["public/icon-192-v2.png", 192],
    ["public/icon-512-v2.png", 512],
    ["public/favicon-32-v2.png", 32],
  ] as const;

  for (const [path, size] of expected) {
    assert.deepEqual(pngHeader(path), {
      width: size,
      height: size,
      bitDepth: 8,
      colorType: 2,
    });
  }
});

test("Next file icons are not the transparent legacy favicon", () => {
  assert.equal(existsSync("src/app/favicon.ico"), false);
  assert.equal(existsSync("src/app/icon.png"), false);
  assert.equal(existsSync("src/app/apple-icon.png"), false);
});
