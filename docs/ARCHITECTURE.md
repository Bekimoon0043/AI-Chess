# Architecture

## System Overview

AI-Chess is a fully client-side Single Page Application designed for free hosting on GitHub Pages. There is no backend. All game logic, AI evaluation, audio, and UI state run in the browser.

**Core principles:**
- Zero server dependencies
- Offline-first (PWA)
- Mobile-first responsive design
- Engine work isolated from the UI thread via Web Workers

## Folder Structure

```
AI-Chess/
├── index.html              # Entry point, PWA manifest link
├── css/
│   ├── main.css            # CSS variables, themes, layout, responsive
│   ├── board.css           # Chess board styling, animations
│   └── components.css      # Modals, buttons, timers, panels
├── js/
│   ├── engine/
│   │   ├── chess.js        # chess.js library (embedded/minified)
│   │   └── stockfish.js    # Stockfish Web Worker
│   ├── components/
│   │   ├── Board.js        # Chess board rendering & interaction
│   │   ├── GameController.js # Game state, moves, history
│   │   ├── Timer.js        # Chess clock logic
│   │   ├── SoundManager.js # Web Audio API sound effects
│   │   ├── UIManager.js    # Modals, settings, themes
│   │   └── PWA.js          # Service worker registration
│   ├── utils/
│   │   ├── constants.js    # Game constants, piece values
│   │   └── helpers.js      # DOM helpers, formatters
│   └── app.js              # Main application bootstrap
├── assets/
│   ├── pieces/             # SVG chess pieces (inline for offline)
│   ├── sounds/             # Generated sound effects (Web Audio)
│   └── icons/              # PWA icons
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
└── docs/
    ├── ARCHITECTURE.md
    ├── DEPLOYMENT.md
    ├── DEVELOPMENT.md
    └── TESTING.md
```

## Components

| Component | Responsibility |
|-----------|----------------|
| `Board.js` | Renders squares & pieces, handles drag/tap input, legal-move highlights |
| `GameController.js` | Owns game state, validates moves via chess.js, maintains history (undo/redo), PGN |
| `Timer.js` | Chess clocks using `performance.now()` delta timing |
| `SoundManager.js` | Plays move/capture/check/game-over sounds via Web Audio API |
| `UIManager.js` | Modals, settings panel, theme switching, captured-pieces display |
| `PWA.js` | Registers service worker, handles install prompt |
| `app.js` | Bootstraps modules, wires event listeners, initializes game |

## Data Flow

1. **User input** → `Board.js` (pointer/touch events)
2. **Move request** → `GameController.js` validates with chess.js
3. **If legal** → update board UI, play sound, push to history, start opponent turn
4. **AI turn** → message sent to Stockfish Web Worker (`stockfish.js`)
5. **Worker reply** → best move returned → `GameController` applies move → board updates
6. **Persistence** → critical state written to LocalStorage / IndexedDB
7. **Offline** → `sw.js` serves cached assets and engine files

## Design Patterns

- **Module pattern** — each JS file exposes a focused API; `app.js` composes them
- **Web Worker isolation** — Stockfish never blocks the main thread
- **CSS custom properties** — theme tokens (`--board-light`, `--board-dark`, etc.) for Dark/Light modes
- **Event-driven UI** — components communicate via custom events / simple callbacks
- **Cache-first PWA** — Service Worker serves static assets and the engine for offline play
