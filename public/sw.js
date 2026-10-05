/* EDGES shell.
   Documents are network-first so a Vercel deploy shows up on the next open.
   /engines/ is never intercepted. Fairy-Stockfish needs the document to stay
   cross-origin isolated (COOP + COEP / SharedArrayBuffer). Cached documents
   get those headers reapplied so a stored shell cannot drop them. */

const CACHE = "opening-edge-shell-v1";
const ISOLATION = [
  ["Cross-Origin-Opener-Policy", "same-origin"],
  ["Cross-Origin-Embedder-Policy", "require-corp"],
];

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

function bypass(url) {
  return url.pathname.startsWith("/engines/") || url.pathname === "/sw.js";
}

function isolate(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of ISOLATION) headers.set(key, value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok && fresh.type === "basic") {
      await cache.put(request, fresh.clone());
    }
    if (!fresh || fresh.type === "opaqueredirect" || fresh.status === 0) return fresh;
    return isolate(fresh);
  } catch {
    const cached = await cache.match(request);
    if (cached) return isolate(cached);
    return new Response("Offline", {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
    });
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (bypass(url)) return;
  if (request.mode !== "navigate") return;
  event.respondWith(networkFirst(request));
});
