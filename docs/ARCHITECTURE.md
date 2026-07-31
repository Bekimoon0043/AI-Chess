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

## Module API Reference

### `Chess` — Rules Engine (`js/chess.js`)

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `INIT_FEN` | `string` | — | Starting position FEN string |
| `PIECE_MAP` | `Object` | — | Unicode piece symbols map |
| `parseFEN` | `(fen: string) => State` | `State` | Parse FEN to internal state object |
| `toFEN` | `(state: State) => string` | `string` | Serialize state to FEN |
| `getLegalMoves` | `(state, fromR, fromC) => Move[]` | `Move[]` | Legal moves from square, filtering check |
| `movePiece` | `(state, fromR, fromC, toR, toC, promo?) => State\|null` | `State\|null` | Execute move with optional promotion piece |
| `inCheck` | `(state, color) => boolean` | `boolean` | Is color's king in check? |
| `isCheckmate` | `(state) => boolean` | `boolean` | Current turn is checkmated |
| `isStalemate` | `(state) => boolean` | `boolean` | Current turn is stalemated |
| `insufficientMaterial` | `(state) => boolean` | `boolean` | Draw by insufficient material |
| `threefoldRepetition` | `(history) => boolean` | `boolean` | Draw by 3-fold repetition |
| `isWhitePiece` | `(piece) => boolean` | `boolean` | Is piece white? |
| `opponent` | `(turn) => string` | `string` | Get opposite color |

**State Object:**
```javascript
{
  grid: Array[8][8],        // null or piece char
  turn: 'white' | 'black',
  castling: { wK, wQ, bK, bQ },
  enPassant: string | null,
  halfMove: number,
  fullMove: number
}
```

### `AI` — Engine (`js/ai.js`)

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `getBestMove` | `(state, difficulty) => Move\|null` | `Move\|null` | Best move for current turn |

**Difficulty mapping:**
- `easy`: depth 1 + random move shuffling
- `medium`: depth 2
- `hard`: depth 3

### `UI` — Interface (`js/ui.js`)

| Method | Description |
|--------|-------------|
| `init()` | Bootstrap game, bind controls, render initial board |

**Internal state:**
- `state`: Current game state from `Chess.parseFEN`
- `history`: Stack of `{fen, move}` for undo
- `redoStack`: Stack for redo
- `selectedSquare`: Currently selected `{row, col}`
- `legalMoves`: Array of legal destination squares
- `settings`: Theme, sound, animation, legal dots, AI difficulty
- `gameMode`: `'pvc'` (Player vs Computer) or `'pvp'` (Pass-and-Play)
- `boardOrientation`: `'white'` or `'black'`

### `Sound` — Audio (`js/sound.js`)

| Method | Description |
|--------|-------------|
| `init()` | Create AudioContext (must be called after user gesture) |
| `move()` | Standard move sound (600Hz sine, 100ms) |
| `capture()` | Capture sound (200Hz triangle, 200ms) |
| `check()` | Check alert (800Hz square, dual beep) |
| `checkmate()` | Checkmate sound (100Hz sawtooth, 500ms) |
| `promotion()` | Promotion fanfare (1000Hz sine, 300ms) |
| `castling()` | Castling sound (500Hz triangle, 300ms) |
| `gameStart()` | New game sound (400Hz sine, 400ms) |
| `victory()` | Victory arpeggio (C-E-G, 200-300ms) |

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

## Performance Notes

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
