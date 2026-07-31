# Knowledge

## Domain Knowledge

### Chess rules handled by the app
- Standard moves, castling, en passant, promotion (with underpromotion UI)
- Check, checkmate, stalemate
- Draws: threefold repetition, 50-move rule, insufficient material
- Castling rights updated correctly; king path checked for attacks

### AI difficulty model
- Easy / Medium / Hard → minimax depth 1 / 2 / 3 with alpha-beta pruning
- Material evaluation (piece values); piece-square tables deferred
- Search runs on the **main thread** today — known limitation (see Lessons)

## Technical Knowledge

### Architecture (current — as implemented)
- **Entry:** `index.html` → `js/app.js`
- **Rules:** `js/chess.js` — pure FEN state, legal moves, special moves, game-over
- **AI:** `js/ai.js` — minimax + alpha-beta (main thread)
- **UI:** `js/ui.js` — board render, click/drag, undo/redo, modals, captures
- **Audio:** `js/sound.js` — Web Audio API synthesis (no external files)
- **PWA:** `manifest.json` + `sw.js`
- **Styles:** `css/styles.css` — dark/light themes, responsive board

### Key APIs used
- Mouse + touch events for drag-and-drop (`touch-action: none` on board)
- Web Audio API — move, capture, check, game-over sounds
- Service Worker — cache-first for offline play
- FEN string as serializable game state for undo/redo history

### Deployment model
- Static files only → GitHub Pages
- No backend; no server-side move validation needed

## Lessons Learned

- Running minimax on the main thread can freeze the UI on hard difficulty — move AI to a **Web Worker** (planned).
- `setInterval` clocks drift; use `performance.now()` delta timing when clocks are added.
- Touch drag needs `touch-action: none` to avoid scroll conflicts.
- Centralize `isSquareAttacked` once (done in `chess.js`) — avoid copy-paste across check, castling, and legality.
- Prefer immutable-style state updates (new grid via `map`) over mutating shared board references.
- GitHub Pages: hash routing or SPA fallback avoids 404 on deep links.

## Code Review Notes (DeepSeek audit — filtered)

DeepSeek’s review assumed a React/CRA stack. Most of that feedback **does not apply**. Accepted items for this vanilla codebase:

| Finding | Verdict | Action |
|---------|---------|--------|
| AI blocks main thread | **Accepted** | Document Worker migration as next performance step |
| Duplicate attack-check logic | **Already fixed** | Single `isSquareAttacked` in `chess.js` |
| Missing en passant / underpromotion / draws | **Already implemented** | Present in `chess.js` + promotion modal |
| Timer interval leak | **Accepted (future)** | Use cleanup + `performance.now()` when Timer is added |
| React.memo / CRA folder structure | **Rejected** | Not a React app |
| Server-side validation / rate limits | **Rejected** | No backend |
| DOM 64-square re-render cost | **Accepted (monitor)** | Full board rebuild is simple; optimize only if mobile FPS drops |
| a11y gaps (keyboard, stronger ARIA) | **Accepted (backlog)** | Partial ARIA present; keyboard nav still open |

## Resources

- [chess.js](https://github.com/jhlywa/chess.js) — reference rules engine
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Service Worker](https://developer.chrome.com/docs/workbox/)
- [GitHub Pages](https://docs.github.com/en/pages)
- [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) — planned for AI offload
