# Knowledge

## Domain Knowledge

### Chess rules handled by the app
- Standard moves, castling, en passant, promotion
- Check, checkmate, stalemate
- Draws: threefold repetition, 50-move rule, insufficient material
- Time controls: Standard, Blitz, Bullet, Rapid, Custom increments

### AI difficulty model
- Beginner / Intermediate / Advanced mapped to Stockfish Skill Level, Depth, and Movetime
- Search capped on mobile to protect battery and responsiveness

## Technical Knowledge

### Architecture (current)
- **Entry:** `index.html` → `js/app.js`
- **Engine layer:** `js/engine/chess.js` (rules) + `js/engine/stockfish.js` (AI worker)
- **UI layer:** `Board.js`, `UIManager.js`, `Timer.js`, `SoundManager.js`
- **Game logic:** `GameController.js` owns state and history
- **PWA:** `manifest.json` + `sw.js`
- **Styles:** `css/main.css`, `board.css`, `components.css` with CSS variables for themes

### Key APIs used
- **Pointer Events** — unified mouse/touch drag-and-drop on the board
- **Web Workers** — `postMessage` / `onmessage` UCI bridge to Stockfish
- **Web Audio API** — move, capture, check, game-over sounds
- **performance.now()** — accurate clock decrements (avoid `setInterval` drift)
- **Service Worker** — cache-first for assets, engine, and offline shell
- **LocalStorage / IndexedDB** — persist settings and in-progress games

### Deployment model
- Static files only → GitHub Pages
- No server-side routing; prefer hash-based or single-page navigation

## Lessons Learned

- Running Stockfish on the main thread freezes the UI — always use a Worker.
- `setInterval` clocks drift; measure elapsed time with `performance.now()`.
- Touch drag needs `touch-action: none` and Pointer Events to avoid scroll conflicts.
- GitHub Pages returns 404 on deep links unless using hash routing or a 404 fallback.

## Resources

- [chess.js](https://github.com/jhlywa/chess.js) — rules engine
- [Stockfish.js / WASM builds](https://github.com/nmrugg/stockfish.js) — browser engine
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Service Worker / Workbox concepts](https://developer.chrome.com/docs/workbox/)
- [GitHub Pages](https://docs.github.com/en/pages)
