import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NextRequest } from "next/server";
import {
  handleGoogleStart,
  type CreateGoogleStartClient,
} from "./oauth-start";

function request(path: string, headers?: HeadersInit) {
  return new NextRequest(`https://blitzbar.app${path}`, { headers });
}

describe("handleGoogleStart", () => {
  it("redirects to the Google authorize URL and keeps PKCE cookies", async () => {
    const createClient: CreateGoogleStartClient = (_req, response) => ({
      auth: {
        async signInWithOAuth() {
          response.cookies.set("sb-pkce-code-verifier", "verifier", { path: "/" });
          return {
            data: { url: "https://accounts.google.com/o/oauth2/v2/auth?client_id=x" },
            error: null,
          };
        },
      },
    });

    const res = await handleGoogleStart(
      request("/auth/google?next=/theory"),
      createClient,
    );

    assert.equal(
      res.headers.get("location"),
      "https://accounts.google.com/o/oauth2/v2/auth?client_id=x",
    );
    assert.match(res.headers.get("set-cookie") ?? "", /sb-pkce-code-verifier=verifier/);
    assert.match(res.headers.get("cache-control") ?? "", /no-store/);
  });

  it("uses the forwarded host in the OAuth redirectTo", async () => {
    let redirectTo = "";
    const createClient: CreateGoogleStartClient = () => ({
      auth: {
        async signInWithOAuth(args) {
          redirectTo = args.options.redirectTo;
          return {
            data: { url: "https://accounts.google.com/o/oauth2/v2/auth?client_id=x" },
            error: null,
          };
        },
      },
    });

    await handleGoogleStart(
      new NextRequest("https://ply-chess.vercel.app/auth/google?next=/", {
        headers: {
          "x-forwarded-host": "blitzbar.app",
          "x-forwarded-proto": "https",
        },
      }),
      createClient,
    );

    assert.equal(
      redirectTo,
      "https://blitzbar.app/auth/callback?next=%2F",
    );
  });

  it("maps a disabled provider to /login?error=provider", async () => {
    const createClient: CreateGoogleStartClient = () => ({
      auth: {
        async signInWithOAuth() {
          return {
            data: { url: null },
            error: { message: "Unsupported provider: provider is not enabled" },
          };
        },
      },
    });

    const res = await handleGoogleStart(request("/auth/google"), createClient);
    const location = new URL(res.headers.get("location") ?? "");
    assert.equal(location.pathname, "/login");
    assert.equal(location.searchParams.get("error"), "provider");
  });

  it("fails closed when auth is not configured", async () => {
    const res = await handleGoogleStart(request("/auth/google?next=/"), () => null);
    const location = new URL(res.headers.get("location") ?? "");
    assert.equal(location.pathname, "/login");
    assert.equal(location.searchParams.get("error"), "config");
  });

  it("fails closed when Google authorize hangs", async () => {
    const createClient: CreateGoogleStartClient = () => ({
      auth: {
        signInWithOAuth: () => new Promise(() => {}),
      },
    });

    const res = await handleGoogleStart(request("/auth/google"), createClient, 20);
    const location = new URL(res.headers.get("location") ?? "");
    assert.equal(location.pathname, "/login");
    assert.equal(location.searchParams.get("error"), "google");
  });

  it("fails closed when Auth is unreachable before building the IdP URL", async () => {
    const createClient: CreateGoogleStartClient = () => ({
      auth: {
        async signInWithOAuth() {
          return {
            data: { url: "https://accounts.google.com/o/oauth2/v2/auth" },
            error: null,
          };
        },
      },
    });

    const res = await handleGoogleStart(
      request("/auth/google"),
      createClient,
      20,
      () => new Promise(() => {}),
    );
    const location = new URL(res.headers.get("location") ?? "");
    assert.equal(location.pathname, "/login");
    assert.equal(location.searchParams.get("error"), "google");
  });
});

describe("handleGoogleStart cookie copy", () => {
  it("does not drop cookies when swapping to the IdP redirect", async () => {
    const createClient: CreateGoogleStartClient = (_req, response) => ({
      auth: {
        async signInWithOAuth() {
          response.cookies.set("sb-a", "one", { path: "/" });
          response.cookies.set("sb-b", "two", { path: "/" });
          return {
            data: { url: "https://accounts.google.com/o/oauth2/v2/auth" },
            error: null,
          };
        },
      },
    });

    const res = await handleGoogleStart(request("/auth/google"), createClient);
    const cookies = res.headers.getSetCookie();
    assert.equal(cookies.length, 2);
  });
});
