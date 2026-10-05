import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("service worker isolation", () => {
  const source = readFileSync(new URL("../../../public/sw.js", import.meta.url), "utf8");

  it("leaves engine assets on the network", () => {
    assert.match(source, /\/engines\//);
    assert.match(source, /request\.mode !== "navigate"/);
    assert.match(source, /bypass\(url\)\) return/);
  });

  it("reapplies COOP and COEP on cached documents", () => {
    assert.match(source, /Cross-Origin-Opener-Policy/);
    assert.match(source, /same-origin/);
    assert.match(source, /Cross-Origin-Embedder-Policy/);
    assert.match(source, /require-corp/);
  });
});
