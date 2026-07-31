# Architecture

## System Overview

AI-Chess is a fully client-side Single Page Application designed for free hosting on GitHub Pages. There is no backend. All game logic, AI evaluation, audio, and UI state run in the browser.

**Core principles:**
- Zero server dependencies
- Offline-first (PWA)
- Mobile-first responsive design
- Clear module boundaries (rules / AI / UI / audio)
- AI search should not block the UI thread (Worker migration planned)

## Folder Structure (as implemented)

```
AI-Chess/
├── index.html              # Entry point, PWA manifest link
├── css/
│   └── styles.css          # Themes, board, layout, responsive rules
├── js/
│   ├── chess.js            # Rules engine (FEN, legal moves, special moves)
│   ├── ai.js               # Minimax AI (main thread; Worker planned)
│   ├── sound.js            # Web Audio synthesis
│   ├── ui.js               # Board, interaction, history, modals
│   └── app.js              # Bootstrap + service worker registration
├── icons/
│   └── chess.svg           # App / PWA icon
├── manifest.json           # Web App Manifest
├── sw.js                   # Service Worker (cache-first)
├── memory/                 # Project memory system
└── docs/                   # Architecture & process docs
```

## Components

| Module | Responsibility |
|--------|----------------|
| `chess.js` | Pure rules: parse/to FEN, pseudo & legal moves, castling, en passant, promotion, check/mate/stalemate, draws |
| `ai.js` | Best-move search (minimax + alpha-beta), difficulty → depth |
| `ui.js` | DOM board, click & drag input, undo/redo, captures, move list, settings, game-over |
| `sound.js` | Oscillator-based SFX (move, capture, check, mate, start) |
| `app.js` | `DOMContentLoaded` → `UI.init`; register `sw.js` |
| `sw.js` | Install/activate cache; serve offline shell |

## Data Flow

1. **User input** → `ui.js` (click or drag on square)
2. **Validate** → `Chess.getLegalMoves` / `Chess.movePiece`
3. **If legal** → push prior FEN to history, update state, re-render, play sound
4. **AI turn** (PvC) → `AI.getBestMove` on main thread → apply same path as human move
5. **Game over** → checkmate / stalemate / material / repetition / 50-move → modal
6. **Offline** → `sw.js` serves cached assets

## Design Patterns

- **Module pattern** — IIFEs expose focused APIs (`Chess`, `AI`, `UI`, `Sound`)
- **Immutable-style state** — new grid via `map` on each move; history is FEN stack
- **Single source of truth for attacks** — `isSquareAttacked` used by check, castling, and legality
- **Cache-first PWA** — static assets and engine files available offline

## Performance Notes (accepted from review)

| Topic | Current | Target |
|-------|---------|--------|
| AI search | Main-thread minimax | Move to **Web Worker** so hard depth does not freeze UI |
| Board paint | Full 64-square rebuild per move | Acceptable for MVP; memoize/diff only if mobile FPS suffers |
| Clocks (future) | — | `performance.now()` deltas + clear intervals on unmount |
| Drag | Mouse + touch listeners | Prefer Pointer Events unification long-term |

## Accessibility (backlog)

- Board has `role="grid"`; strengthen `gridcell` + `aria-label` per square/piece
- Keyboard: arrow focus, Enter to select/confirm (not yet implemented)
- Legal moves: pattern/marker in addition to color (partially via dots)

## Non-goals (rejected review items)

- React / CRA / TypeScript rewrite for MVP
- Server-side move validation or rate limiting (no backend)
- External Stockfish API keys in the client
