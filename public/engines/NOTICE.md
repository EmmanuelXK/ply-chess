# Browser engine

Stockfish is GPL-3.0. The license text is `licenses/COPYING.txt`. Opening Edge does not add Chessable or Chess.com branding to the UI.

## Stockfish 17.1 lite (multithreaded)

- Build: Stockfish.js 17.1 lite, multithreaded (`stockfish-17.1-lite.js` + `stockfish-17.1-lite.wasm`)
- The worker locates its wasm by replacing `.js` with `.wasm` on its own URL.
- License: GPL-3.0
- Upstream: https://github.com/nmrugg/stockfish.js and https://github.com/official-stockfish/Stockfish
- Network: `nn-9067e33176e` (the lite net published with Stockfish.js 17.1)
- Size: about 6.8 MB wasm + 32 KB loader
- Needs cross-origin isolation (`Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`) so the WASM build can use shared memory. Learn and Analyze set `Threads` from the device when `crossOriginIsolated` is true.
- The full Stockfish 17.1 net is about 75 MB. This phone-first notebook ships the lite multithreaded build instead, which is the mobile build stockfish.js recommends when isolation is available. Book evaluations are the stored Stockfish 17.1 depth-22 scores and do not depend on this net.

Lc0 and Fairy-Stockfish are not shipped. No network file is downloaded.
