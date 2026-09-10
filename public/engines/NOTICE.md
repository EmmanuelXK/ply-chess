# Browser engines

`stockfish-nnue-16-single.js` + `.wasm` are Stockfish.js 16 (Chess.com / nmrugg), GPLv3.

https://github.com/nmrugg/stockfish.js

Lc0 and Maia neural nets are **not** bundled. The app uses plan / human-policy stand-ins and will pick up WASM/ONNX files here later if added (`lc0.wasm`, `maia.onnx`) without an API change.
