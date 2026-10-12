import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  allowance,
  openQuota,
  parisDay,
  quotaBucket,
  rememberCount,
  resetQuotaMemory,
  sealQuota,
} from "./quota";

describe("coach quota", () => {
  it("resets when Paris crosses midnight", () => {
    assert.equal(parisDay(new Date("2026-10-12T21:30:00.000Z")), "2026-10-12");
    assert.equal(parisDay(new Date("2026-10-12T22:30:00.000Z")), "2026-10-13");
  });

  it("keeps the higher of the signed cookie and the memory counter", () => {
    resetQuotaMemory();
    const device = "phone-1";
    const bucket = quotaBucket("203.0.113.4", device);
    const day = parisDay(new Date("2026-10-12T12:00:00.000Z"));
    rememberCount(bucket, day, 4);
    const cookie = openQuota(sealQuota({ day, count: 6, device }));
    assert.ok(cookie);
    assert.equal(allowance(bucket, cookie, device, new Date("2026-10-12T12:00:00.000Z")), 6);
    assert.equal(allowance(bucket, cookie, device, new Date("2026-10-12T22:30:00.000Z")), 0);
    assert.equal(openQuota(`${day}.9.${device}.nope`), null);
    resetQuotaMemory();
  });
});
