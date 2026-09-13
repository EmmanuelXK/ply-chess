import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizePhone, phoneHint } from "./phone";

describe("normalizePhone", () => {
  it("turns a French national mobile into E.164", () => {
    assert.deepEqual(normalizePhone("FR", "0744899885"), {
      ok: true,
      e164: "+33744899885",
    });
    assert.deepEqual(normalizePhone("FR", "07 44 89 98 85"), {
      ok: true,
      e164: "+33744899885",
    });
    assert.deepEqual(normalizePhone("FR", "744899885"), {
      ok: true,
      e164: "+33744899885",
    });
  });

  it("keeps an already-international number", () => {
    assert.deepEqual(normalizePhone("FR", "+33744899885"), {
      ok: true,
      e164: "+33744899885",
    });
    assert.deepEqual(normalizePhone("FR", "0033744899885"), {
      ok: true,
      e164: "+33744899885",
    });
  });

  it("flags a short French number as incomplete", () => {
    assert.deepEqual(normalizePhone("FR", "0744"), {
      ok: false,
      reason: "incomplete",
    });
    assert.match(phoneHint("FR", "incomplete"), /10 digits/);
  });

  it("normalizes UK and US national numbers", () => {
    assert.deepEqual(normalizePhone("GB", "07911 123456"), {
      ok: true,
      e164: "+447911123456",
    });
    assert.deepEqual(normalizePhone("US", "2025550142"), {
      ok: true,
      e164: "+12025550142",
    });
    assert.deepEqual(normalizePhone("US", "12025550142"), {
      ok: true,
      e164: "+12025550142",
    });
  });

  it("rejects empty and letter-only input", () => {
    assert.deepEqual(normalizePhone("FR", "   "), {
      ok: false,
      reason: "incomplete",
    });
    assert.deepEqual(normalizePhone("FR", "hello"), {
      ok: false,
      reason: "invalid",
    });
  });
});
