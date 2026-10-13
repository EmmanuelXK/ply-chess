/* EDGES shell.
   Navigations always ask the network with cache: "reload", so a deploy
   cannot be hidden behind an old cached document. Engine files are never
   intercepted. Stockfish threads need the document to stay cross-origin
   isolated (COOP + COEP / SharedArrayBuffer). When the network is down,
   a small offline page is returned instead of a cached shell whose
   scripts are no longer on disk. */

const ISOLATION = [
  ["Cross-Origin-Opener-Policy", "same-origin"],
  ["Cross-Origin-Embedder-Policy", "require-corp"],
];

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>EDGES</title>
<style>
  html, body { margin: 0; height: 100%; background: #040406; color: #f3ebe0; font: 16px/1.45 system-ui, sans-serif; }
  main { min-height: 100%; display: flex; flex-direction: column; justify-content: center; padding: calc(env(safe-area-inset-top) + 1.5rem) 1.25rem calc(env(safe-area-inset-bottom) + 1.5rem); }
  h1 { font-size: 1.4rem; margin: 0 0 0.4rem; }
  p { margin: 0; max-width: 28rem; color: #d9cbb8; }
</style>
</head>
<body>
<main>
  <h1>EDGES is offline</h1>
  <p>This phone does not have a connection. Reopen the app when you are back online. Lines you already saved stay on this device.</p>
</main>
</body>
</html>`;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
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

function offlinePage() {
  const headers = new Headers({
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });
  for (const [key, value] of ISOLATION) headers.set(key, value);
  return new Response(OFFLINE_HTML, { status: 503, headers });
}

async function networkFirst(request) {
  try {
    const fresh = await fetch(request, { cache: "reload" });
    if (!fresh || fresh.type === "opaqueredirect" || fresh.status === 0) return fresh;
    return isolate(fresh);
  } catch {
    return offlinePage();
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
