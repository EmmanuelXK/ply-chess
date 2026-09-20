import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isPublicPath,
  shouldSkipAuthSession,
  signedInFromClaims,
} from "./session-gate";

describe("session gate paths", () => {
  it("skips session work on login and oauth public routes", () => {
    for (const path of [
      "/login",
      "/login/",
      "/auth/callback",
      "/auth/callback/extra",
      "/auth/sign-out",
      "/auth/google",
      "/auth/google/status",
    ]) {
      assert.equal(isPublicPath(path), true, path);
      assert.equal(shouldSkipAuthSession(path), true, path);
    }
  });

  it("still gates the club app surfaces", () => {
    for (const path of ["/", "/theory", "/settings", "/drill/sicilian"]) {
      assert.equal(isPublicPath(path), false, path);
      assert.equal(shouldSkipAuthSession(path), false, path);
    }
  });
});

describe("signedInFromClaims", () => {
  it("reads a subject claim as signed-in", async () => {
    const signedIn = await signedInFromClaims(async () => ({
      data: { claims: { sub: "user-1" } },
    }));
    assert.equal(signedIn, true);
  });

  it("treats a missing session as signed-out", async () => {
    const signedIn = await signedInFromClaims(async () => ({ data: { claims: null } }));
    assert.equal(signedIn, false);
  });

  it("treats a hang as signed-out instead of blocking", async () => {
    const signedIn = await signedInFromClaims(() => new Promise(() => {}), 20);
    assert.equal(signedIn, false);
  });

  it("treats a thrown probe as signed-out", async () => {
    const signedIn = await signedInFromClaims(async () => {
      throw new Error("dns");
    });
    assert.equal(signedIn, false);
  });
});
