import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { authIsRequired } from "@/lib/supabase/env";

const KEY = "OPENING_EDGE_REQUIRE_AUTH";

describe("authIsRequired", () => {
  const previous = process.env[KEY];
  const previousVercel = process.env.VERCEL_ENV;

  afterEach(() => {
    if (previous === undefined) delete process.env[KEY];
    else process.env[KEY] = previous;
    if (previousVercel === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previousVercel;
  });

  it("stays off for personal use, including production", () => {
    delete process.env[KEY];
    process.env.VERCEL_ENV = "production";
    assert.equal(authIsRequired(), false);
  });

  it("turns the login wall back on only when asked", () => {
    process.env[KEY] = "1";
    assert.equal(authIsRequired(), true);
    process.env[KEY] = "true";
    assert.equal(authIsRequired(), true);
    process.env[KEY] = "0";
    assert.equal(authIsRequired(), false);
  });
});
