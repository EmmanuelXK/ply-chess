# Browser engines

All three engines are GPL-3.0. The license text is `licenses/COPYING.txt`. Corresponding source is the upstream projects below. Opening Edge does not add Chessable or Chess.com branding to the UI.

## Stockfish lite (default)

- Build: Stockfish.js 19.0.0 lite, single thread (`stockfish-19-lite-single.js` + `.wasm`)
- License: GPL-3.0
- Upstream: https://github.com/nmrugg/stockfish.js and https://github.com/official-stockfish/Stockfish
- Size: about 1.8 MB wasm + 21 KB loader
- Loads with Analyze. No shared-memory headers required.

## Fairy-Stockfish NNUE

- Build: `fairy-stockfish-nnue.wasm` 1.1.12 (`fairy/stockfish.js`, `fairy/stockfish.wasm`, `fairy/stockfish.worker.js`, `fairy/bridge.js`)
- License: GPL-3.0
- Upstream: https://github.com/fairy-stockfish/fairy-stockfish.wasm
- Size: about 1.6 MB wasm
- Needs cross-origin isolation (`Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`) because the WASM build uses shared memory. Threads are pinned to 1.

## Lc0 (opt-in)

- Build: lc0-js release js-v0.1.0 (`lc0/lc0.js` + `lc0/lc0.wasm`) with network id 9155 (6×64), `weights_9155.txt.gz`
- License: GPL-3.0 (Leela Chess Zero)
- Upstream: https://github.com/frpays/lc0-js and https://github.com/LeelaChessZero/lc0
- Engine: about 0.6 MB wasm. Network: about 22 MB, fetched only after Lc0 is chosen.
- Worker dependencies (TensorFlow.js 0.14.1, pako 1.0.3, protobuf.js 6.8.8) are vendored under `lc0/vendor/` so the phone does not call a third-party CDN. The loader URLs inside `lc0.js` point at those files.
