import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("service worker isolation", () => {
  const source = readFileSync(new URL("../../../public/sw.js", import.meta.url), "utf8");
  const register = readFileSync(
    new URL("../../../src/components/pwa/register-sw.tsx", import.meta.url),
    "utf8",
  );

  it("leaves engine assets on the network", () => {
    assert.match(source, /\/engines\//);
    assert.match(source, /request\.mode !== "navigate"/);
    assert.match(source, /bypass\(url\)\) return/);
  });

  it("reloads documents and does not keep an old shell", () => {
    assert.match(source, /cache:\s*"reload"/);
    assert.match(source, /caches\.delete/);
    assert.doesNotMatch(source, /cache\.put/);
  });

  it("reapplies COOP and COEP and degrades offline without a broken shell", () => {
    assert.match(source, /Cross-Origin-Opener-Policy/);
    assert.match(source, /same-origin/);
    assert.match(source, /Cross-Origin-Embedder-Policy/);
    assert.match(source, /require-corp/);
    assert.match(source, /EDGES is offline/);
  });

  it("reloads an open tab when a newer worker takes control", () => {
    assert.match(register, /controllerchange/);
    assert.match(register, /hadController/);
    assert.match(register, /location\.reload/);
  });
});
