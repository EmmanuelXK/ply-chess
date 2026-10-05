/* UCI bridge for Fairy-Stockfish NNUE WASM (GPL-3.0).
   The engine module speaks postMessage; this worker exposes plain UCI lines. */
importScripts("stockfish.js");

let engine = null;
const queue = [];

function forward(line) {
  if (!engine) {
    queue.push(line);
    return;
  }
  engine.postMessage(line);
}

self.onmessage = (event) => {
  const line = typeof event.data === "string" ? event.data.trim() : "";
  if (!line) return;
  forward(line);
};

const scriptUrl = new URL("stockfish.js", self.location.href).href;
const boot = typeof Stockfish === "function"
  ? Stockfish({ mainScriptUrlOrBlob: scriptUrl })
  : Promise.reject(new Error("missing"));

boot
  .then((instance) => {
    engine = instance;
    instance.addMessageListener((line) => {
      postMessage(String(line));
    });
    for (const line of queue) instance.postMessage(line);
    queue.length = 0;
  })
  .catch(() => {
    postMessage("info string Fairy-Stockfish failed to start");
  });
