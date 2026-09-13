import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { appOrigin, loginErrorUrl, safeInternalPath } from "./redirect";

describe("safeInternalPath", () => {
  it("defaults empty and off-site values to the dashboard", () => {
    assert.equal(safeInternalPath(null), "/");
    assert.equal(safeInternalPath(""), "/");
    assert.equal(safeInternalPath("https://evil.example/"), "/");
    assert.equal(safeInternalPath("//evil.example"), "/");
    assert.equal(safeInternalPath("/\\evil"), "/");
  });

  it("keeps same-origin app paths", () => {
    assert.equal(safeInternalPath("/"), "/");
    assert.equal(safeInternalPath("/theory"), "/theory");
    assert.equal(safeInternalPath("/drill/sicilian"), "/drill/sicilian");
  });
});

describe("appOrigin", () => {
  it("uses the request URL when no forwarded host is present", () => {
    const request = new Request("https://blitzbar.app/auth/callback?code=x");
    assert.equal(appOrigin(request), "https://blitzbar.app");
  });

  it("prefers a sanitized forwarded host over the deployment origin", () => {
    const request = new Request("https://ply-chess.vercel.app/auth/callback", {
      headers: {
        "x-forwarded-host": "blitzbar.app",
        "x-forwarded-proto": "https",
      },
    });
    assert.equal(appOrigin(request), "https://blitzbar.app");
  });

  it("ignores injected hosts", () => {
    const request = new Request("https://blitzbar.app/auth/callback", {
      headers: { "x-forwarded-host": "evil.example/phish" },
    });
    assert.equal(appOrigin(request), "https://blitzbar.app");
  });
});

describe("loginErrorUrl", () => {
  it("sends failed Google exchange to /login?error=google", () => {
    const url = loginErrorUrl(
      "https://blitzbar.app",
      "Invalid login credentials",
      "/",
      () => "google",
    );
    assert.equal(url.pathname, "/login");
    assert.equal(url.searchParams.get("error"), "google");
    assert.equal(url.searchParams.get("next"), "/");
  });
});
