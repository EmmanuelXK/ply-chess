import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyAuthError,
  friendlyAuthMessage,
  isProviderDisabledError,
  noteFromSearchParams,
} from "./errors";

const PROVIDER_JSON =
  '{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}';

describe("auth error mapping", () => {
  it("detects the live Supabase provider-disabled JSON", () => {
    assert.equal(isProviderDisabledError(PROVIDER_JSON), true);
    assert.equal(classifyAuthError(PROVIDER_JSON), "provider");
    assert.match(friendlyAuthMessage(PROVIDER_JSON), /not switched on/);
    assert.doesNotMatch(friendlyAuthMessage(PROVIDER_JSON), /validation_failed/);
  });

  it("maps login query params to a short Google message", () => {
    const params = new URLSearchParams(
      "error=access_denied&error_description=Unsupported+provider%3A+provider+is+not+enabled",
    );
    assert.match(noteFromSearchParams(params), /not switched on/);
    assert.equal(
      noteFromSearchParams(new URLSearchParams("error=google")),
      "Google sign-in did not finish. Try again.",
    );
  });

  it("never returns raw JSON for Google failures", () => {
    const message = friendlyAuthMessage(PROVIDER_JSON);
    assert.match(message, /Google sign-in/);
    assert.doesNotMatch(message, /\{/);
  });
});
