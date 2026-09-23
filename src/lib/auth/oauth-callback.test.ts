import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NextRequest, NextResponse } from "next/server";
import { applyCookiesToResponse } from "../supabase/server";
import { handleAuthCallback, type CreateCallbackClient } from "./oauth-callback";

function request(path: string, headers?: HeadersInit) {
  return new NextRequest(`https://blitzbar.app${path}`, { headers });
}

describe("handleAuthCallback", () => {
  it("sets auth cookies on the dashboard redirect after a successful exchange", async () => {
    const createClient: CreateCallbackClient = (_req, response) => ({
      auth: {
        async exchangeCodeForSession() {
          response.cookies.set("sb-auth-token", "session.jwt", { path: "/" });
          return { error: null };
        },
      },
    });

    const res = await handleAuthCallback(
      request("/auth/callback?code=pkce-code&next=/"),
      createClient,
    );

    assert.equal(res.headers.get("location"), "https://blitzbar.app/");
    assert.match(res.headers.get("set-cookie") ?? "", /sb-auth-token=session\.jwt/);
    assert.match(res.headers.get("cache-control") ?? "", /no-store/);
  });

  it("uses the forwarded host so the dashboard stays on the public domain", async () => {
    const createClient: CreateCallbackClient = () => ({
      auth: {
        async exchangeCodeForSession() {
          return { error: null };
        },
      },
    });

    const res = await handleAuthCallback(
      new NextRequest("https://ply-chess.vercel.app/auth/callback?code=pkce-code", {
        headers: {
          "x-forwarded-host": "blitzbar.app",
          "x-forwarded-proto": "https",
        },
      }),
      createClient,
    );

    assert.equal(res.headers.get("location"), "https://blitzbar.app/");
  });

  it("sends a failed exchange to /login?error=google", async () => {
    const createClient: CreateCallbackClient = () => ({
      auth: {
        async exchangeCodeForSession() {
          return { error: { message: "invalid flow state, no valid verifier" } };
        },
      },
    });

    const res = await handleAuthCallback(
      request("/auth/callback?code=bad&next=/theory"),
      createClient,
    );
    const location = new URL(res.headers.get("location") ?? "");

    assert.equal(location.origin, "https://blitzbar.app");
    assert.equal(location.pathname, "/login");
    assert.equal(location.searchParams.get("error"), "google");
    assert.equal(location.searchParams.get("next"), "/theory");
    assert.equal(res.headers.get("set-cookie"), null);
  });

  it("treats a missing code as a Google failure", async () => {
    const res = await handleAuthCallback(request("/auth/callback?next=/"));
    const location = new URL(res.headers.get("location") ?? "");
    assert.equal(location.pathname, "/login");
    assert.equal(location.searchParams.get("error"), "google");
  });

  it("maps provider-disabled OAuth errors to the friendly login code", async () => {
    const res = await handleAuthCallback(
      request(
        "/auth/callback?error=validation_failed&error_description=Unsupported+provider",
      ),
    );
    const location = new URL(res.headers.get("location") ?? "");
    assert.equal(location.searchParams.get("error"), "provider");
  });

  it("fails closed when auth is not configured", async () => {
    const res = await handleAuthCallback(
      request("/auth/callback?code=pkce-code"),
      () => null,
    );
    const location = new URL(res.headers.get("location") ?? "");
    assert.equal(location.pathname, "/login");
    assert.equal(location.searchParams.get("error"), "config");
  });

  it("fails closed to /login when the code exchange hangs", async () => {
    const createClient: CreateCallbackClient = () => ({
      auth: {
        exchangeCodeForSession: () => new Promise(() => {}),
      },
    });

    const res = await handleAuthCallback(
      request("/auth/callback?code=pkce-code"),
      createClient,
      20,
    );
    const location = new URL(res.headers.get("location") ?? "");
    assert.equal(location.pathname, "/login");
    assert.equal(location.searchParams.get("error"), "google");
  });
});

describe("applyCookiesToResponse", () => {
  it("writes every chunk onto the same redirect", () => {
    const response = NextResponse.redirect("https://blitzbar.app/");
    applyCookiesToResponse(
      response,
      [
        { name: "sb-xx-auth-token.0", value: "chunk-a", options: { path: "/" } },
        { name: "sb-xx-auth-token.1", value: "chunk-b", options: { path: "/" } },
      ],
      { "Cache-Control": "private, no-store" },
    );
    const cookies = response.headers.getSetCookie();
    assert.equal(cookies.length, 2);
    assert.match(cookies[0] ?? "", /chunk-a/);
    assert.match(cookies[1] ?? "", /chunk-b/);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
  });
});
