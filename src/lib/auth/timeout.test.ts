import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TimeoutError, withTimeout } from "./timeout";

describe("withTimeout", () => {
  it("resolves when the work finishes in time", async () => {
    await assert.doesNotReject(() =>
      withTimeout(Promise.resolve("ok"), 50),
    );
    assert.equal(await withTimeout(Promise.resolve("ok"), 50), "ok");
  });

  it("rejects when the work hangs", async () => {
    await assert.rejects(
      () => withTimeout(new Promise(() => {}), 20),
      (error: unknown) => {
        assert.ok(error instanceof TimeoutError);
        assert.match((error as Error).message, /20ms/);
        return true;
      },
    );
  });

  it("forwards a fast rejection", async () => {
    await assert.rejects(
      () => withTimeout(Promise.reject(new Error("nope")), 50),
      /nope/,
    );
  });
});
